<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  InputSearch,
  Spin,
  Table,
  Tag,
  Tree,
  message,
} from 'antdv-next';

import type { SystemRoleApi } from '#/api/system/role';
import type { SystemResourceApi } from '#/api/system/resource';

import { assignRoleResources, getRoleList } from '#/api/system/role';
import {
  getResourceTree,
  getResourcesByRoleId,
} from '#/api/system/resource';

// 角色列表相关
const roleList = ref<SystemRoleApi.Role[]>([]);
const roleLoading = ref(false);
const searchRoleName = ref('');
const selectedRoleId = ref<number>();

// 资源树相关
const resourceTreeData = ref<any[]>([]);
const checkedResourceIds = ref<number[]>([]);
const treeLoading = ref(false);
const saveLoading = ref(false);

// 角色表格列定义
const roleColumns = [
  { title: '角色名称', dataIndex: 'roleName', ellipsis: true },
  { title: '角色标识', dataIndex: 'roleKey', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 80 },
];

// 转换资源树为 antd 格式
function buildResourceTree(nodes: SystemResourceApi.Resource[]): any[] {
  return (nodes ?? []).map((node) => ({
    title: node.resourceName,
    key: node.id!,
    children: node.children?.length ? buildResourceTree(node.children) : [],
  }));
}

// 加载角色列表
async function loadRoles() {
  roleLoading.value = true;
  try {
    const res = await getRoleList({
      page: 1,
      limit: 100,
      roleName: searchRoleName.value || undefined,
    });
    roleList.value = res?.items ?? [];
  } catch {
    message.error('加载角色列表失败');
  } finally {
    roleLoading.value = false;
  }
}

// 加载资源树
async function loadResourceTree() {
  try {
    const res = await getResourceTree();
    resourceTreeData.value = buildResourceTree(res ?? []);
  } catch {
    message.error('加载资源树失败');
  }
}

// 选中角色
async function onRoleSelect(record: SystemRoleApi.Role) {
  if (!record.id) return;
  selectedRoleId.value = record.id;
  await loadRoleResources(record.id);
}

// 加载角色已分配资源
async function loadRoleResources(roleId: number) {
  treeLoading.value = true;
  try {
    const res = await getResourcesByRoleId(roleId);
    checkedResourceIds.value = (res ?? []).map((r) => r.id!).filter(Boolean);
  } catch {
    message.error('加载角色资源失败');
  } finally {
    treeLoading.value = false;
  }
}

// 保存资源分配
async function onSave() {
  if (!selectedRoleId.value) {
    message.warning('请先选择角色');
    return;
  }
  saveLoading.value = true;
  try {
    await assignRoleResources(selectedRoleId.value, checkedResourceIds.value);
    message.success('保存成功');
  } catch {
    message.error('保存失败');
  } finally {
    saveLoading.value = false;
  }
}

// 行样式：高亮选中行
function rowClassName(record: SystemRoleApi.Role) {
  return record.id === selectedRoleId.value ? 'role-row-selected' : '';
}

// 行事件：点击选中角色
function onRow(record: SystemRoleApi.Role) {
  return {
    onClick: () => onRoleSelect(record),
    style: { cursor: 'pointer' },
  };
}

onMounted(() => {
  loadRoles();
  loadResourceTree();
});
</script>

<template>
  <Page>
    <div class="flex gap-4">
      <!-- 左侧：角色列表 -->
      <Card class="w-1/2" title="角色列表">
        <template #extra>
          <InputSearch
            v-model:value="searchRoleName"
            allow-clear
            placeholder="请输入角色名称"
            style="width: 200px"
            @search="loadRoles"
          />
        </template>
        <Table
          :columns="roleColumns"
          :data-source="roleList"
          :loading="roleLoading"
          :pagination="false"
          :row-class-name="rowClassName"
          :on-row="onRow"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <Tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '停用' }}
              </Tag>
            </template>
          </template>
        </Table>
      </Card>

      <!-- 右侧：资源分配 -->
      <Card class="w-1/2" title="资源分配">
        <template v-if="selectedRoleId">
          <Spin :spinning="treeLoading">
            <div class="mb-3 text-gray-500">
              已选资源：{{ checkedResourceIds.length }} 个
            </div>
            <Tree
              v-model:checked-keys="checkedResourceIds"
              :tree-data="resourceTreeData"
              checkable
              default-expand-all
            />
          </Spin>
          <div class="mt-4">
            <Button :loading="saveLoading" type="primary" @click="onSave">
              保存
            </Button>
          </div>
        </template>
        <Empty v-else description="请选择左侧角色" />
      </Card>
    </div>
  </Page>
</template>

<style>
/* 选中行高亮：使用半透明主色，暗色/亮色主题下文字均可读 */
.role-row-selected > td {
  background-color: rgba(22, 119, 255, 0.15) !important;
}
</style>

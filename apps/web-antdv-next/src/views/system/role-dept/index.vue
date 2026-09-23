<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  InputSearch,
  Select,
  Spin,
  Table,
  Tag,
  Tree,
  message,
} from 'antdv-next';

import type { SystemRoleApi } from '#/api/system/role';
import type { SystemDeptApi } from '#/api/system/dept';

import {
  assignRoleDataScope,
  getRoleById,
  getRoleList,
} from '#/api/system/role';
import { getDeptTree } from '#/api/system/dept';

// 数据权限范围选项 1全部 2自定义 3本部门 4本部门及以下 5仅本人
const dataScopeOptions = [
  { label: '全部数据', value: 1 },
  { label: '自定义数据', value: 2 },
  { label: '本部门数据', value: 3 },
  { label: '本部门及以下', value: 4 },
  { label: '仅本人数据', value: 5 },
];

// 角色列表相关
const roleList = ref<SystemRoleApi.Role[]>([]);
const roleLoading = ref(false);
const searchRoleName = ref('');
const selectedRoleId = ref<number>();

// 数据权限相关
const dataScope = ref<number>(1);
const deptTreeData = ref<any[]>([]);
const checkedDeptIds = ref<number[]>([]);
const detailLoading = ref(false);
const saveLoading = ref(false);

// 角色表格列定义
const roleColumns = [
  { title: '角色名称', dataIndex: 'roleName', ellipsis: true },
  { title: '角色标识', dataIndex: 'roleKey', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 80 },
];

// 转换部门树为 antd 格式
function buildDeptTree(nodes: SystemDeptApi.Dept[]): any[] {
  return (nodes ?? []).map((node) => ({
    title: node.deptName,
    key: node.id!,
    children: node.children?.length ? buildDeptTree(node.children) : [],
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

// 加载部门树
async function loadDeptTree() {
  try {
    const res = await getDeptTree();
    deptTreeData.value = buildDeptTree(res ?? []);
  } catch {
    message.error('加载部门树失败');
  }
}

// 选中角色
async function onRoleSelect(record: SystemRoleApi.Role) {
  if (!record.id) return;
  selectedRoleId.value = record.id;
  await loadRoleDetail(record.id);
}

// 加载角色详情(含数据权限和部门ID)
async function loadRoleDetail(roleId: number) {
  detailLoading.value = true;
  try {
    const res = await getRoleById(roleId);
    dataScope.value = res?.dataScope ?? 1;
    checkedDeptIds.value = res?.deptIds ?? [];
  } catch {
    message.error('加载角色详情失败');
  } finally {
    detailLoading.value = false;
  }
}

// 保存数据权限
async function onSave() {
  if (!selectedRoleId.value) {
    message.warning('请先选择角色');
    return;
  }
  saveLoading.value = true;
  try {
    await assignRoleDataScope(
      selectedRoleId.value,
      dataScope.value,
      dataScope.value === 2 ? checkedDeptIds.value : [],
    );
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
  loadDeptTree();
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

      <!-- 右侧：数据权限配置 -->
      <Card class="w-1/2" title="数据权限配置">
        <template v-if="selectedRoleId">
          <Spin :spinning="detailLoading">
            <div class="mb-4">
              <div class="mb-2">数据范围</div>
              <Select
                v-model:value="dataScope"
                :options="dataScopeOptions"
                placeholder="请选择数据范围"
                style="width: 100%"
              />
            </div>
            <div v-if="dataScope === 2">
              <div class="mb-2">自定义数据权限</div>
              <Tree
                v-model:checked-keys="checkedDeptIds"
                :tree-data="deptTreeData"
                checkable
                default-expand-all
              />
            </div>
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

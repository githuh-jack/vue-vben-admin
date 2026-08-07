<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  Select,
  Spin,
  Tree,
  message,
} from 'antdv-next';

import type { SystemRoleApi } from '#/api/system/role';
import type { SystemResourceApi } from '#/api/system/resource';
import type { SystemDeptApi } from '#/api/system/dept';

import {
  assignRoleDataScope,
  assignRoleResources,
  getRoleById,
  getRoleList,
} from '#/api/system/role';
import {
  getResourceTree,
  getResourcesByRoleId,
} from '#/api/system/resource';
import { getDeptTree } from '#/api/system/dept';

// 数据权限范围选项 1全部 2自定义 3本部门 4本部门及以下 5仅本人
const dataScopeOptions = [
  { label: '全部数据', value: 1 },
  { label: '自定义数据', value: 2 },
  { label: '本部门数据', value: 3 },
  { label: '本部门及以下', value: 4 },
  { label: '仅本人数据', value: 5 },
];

// 角色相关
const roleList = ref<SystemRoleApi.Role[]>([]);
const selectedRoleId = ref<number>();
const roleLoading = ref(false);

// 角色下拉选项
const roleOptions = computed(() =>
  roleList.value.map((r) => ({ label: r.roleName, value: r.id })),
);

// 资源相关
const resourceTreeData = ref<any[]>([]);
const checkedResourceIds = ref<number[]>([]);
const resourceLoading = ref(false);
const saveResourceLoading = ref(false);

// 数据权限相关
const dataScope = ref<number>(1);
const deptTreeData = ref<any[]>([]);
const checkedDeptIds = ref<number[]>([]);
const saveScopeLoading = ref(false);

// 转换资源树为 antd 格式
function buildResourceTree(nodes: SystemResourceApi.Resource[]): any[] {
  return (nodes ?? []).map((node) => ({
    title: node.resourceName,
    key: node.id!,
    children: node.children?.length ? buildResourceTree(node.children) : [],
  }));
}

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
    const res = await getRoleList({ page: 1, limit: 100 });
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

// 加载部门树
async function loadDeptTree() {
  try {
    const res = await getDeptTree();
    deptTreeData.value = buildDeptTree(res ?? []);
  } catch {
    message.error('加载部门树失败');
  }
}

// 角色切换：加载角色详情和资源
async function onRoleChange(value: number) {
  await Promise.all([loadRoleDetail(value), loadRoleResources(value)]);
}

// 加载角色详情(数据权限)
async function loadRoleDetail(roleId: number) {
  try {
    const res = await getRoleById(roleId);
    dataScope.value = res?.dataScope ?? 1;
    checkedDeptIds.value = res?.deptIds ?? [];
  } catch {
    message.error('加载角色详情失败');
  }
}

// 加载角色资源
async function loadRoleResources(roleId: number) {
  resourceLoading.value = true;
  try {
    const res = await getResourcesByRoleId(roleId);
    checkedResourceIds.value = (res ?? []).map((r) => r.id!).filter(Boolean);
  } catch {
    message.error('加载角色资源失败');
  } finally {
    resourceLoading.value = false;
  }
}

// 保存资源权限
async function onSaveResources() {
  if (!selectedRoleId.value) {
    message.warning('请先选择角色');
    return;
  }
  saveResourceLoading.value = true;
  try {
    await assignRoleResources(selectedRoleId.value, checkedResourceIds.value);
    message.success('资源权限保存成功');
  } catch {
    message.error('资源权限保存失败');
  } finally {
    saveResourceLoading.value = false;
  }
}

// 保存数据权限
async function onSaveDataScope() {
  if (!selectedRoleId.value) {
    message.warning('请先选择角色');
    return;
  }
  saveScopeLoading.value = true;
  try {
    await assignRoleDataScope(
      selectedRoleId.value,
      dataScope.value,
      dataScope.value === 2 ? checkedDeptIds.value : [],
    );
    message.success('数据权限保存成功');
  } catch {
    message.error('数据权限保存失败');
  } finally {
    saveScopeLoading.value = false;
  }
}

onMounted(() => {
  loadRoles();
  loadResourceTree();
  loadDeptTree();
});
</script>

<template>
  <Page>
    <!-- 顶部：角色选择 -->
    <Card class="mb-4" title="选择角色">
      <Select
        v-model:value="selectedRoleId"
        :options="roleOptions"
        :loading="roleLoading"
        placeholder="请选择角色"
        style="width: 300px"
        @change="onRoleChange"
      />
    </Card>

    <div class="flex gap-4">
      <!-- 资源权限 -->
      <Card class="w-1/2" title="资源权限">
        <template v-if="selectedRoleId">
          <Spin :spinning="resourceLoading">
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
            <Button
              :loading="saveResourceLoading"
              type="primary"
              @click="onSaveResources"
            >
              保存资源
            </Button>
          </div>
        </template>
        <Empty v-else description="请先选择角色" />
      </Card>

      <!-- 数据权限 -->
      <Card class="w-1/2" title="数据权限">
        <template v-if="selectedRoleId">
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
          <div class="mt-4">
            <Button
              :loading="saveScopeLoading"
              type="primary"
              @click="onSaveDataScope"
            >
              保存数据权限
            </Button>
          </div>
        </template>
        <Empty v-else description="请先选择角色" />
      </Card>
    </div>
  </Page>
</template>

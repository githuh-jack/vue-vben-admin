<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Empty,
  InputSearch,
  Spin,
  Table,
  Tag,
  message,
} from 'antdv-next';

import type { SystemUserApi } from '#/api/system/user';
import type { SystemRoleApi } from '#/api/system/role';

import { getUserList } from '#/api/system/user';
import {
  assignUserRoles,
  getRoleList,
  getUserRoles,
} from '#/api/system/role';

// 用户列表相关
const userList = ref<SystemUserApi.User[]>([]);
const userLoading = ref(false);
const searchUsername = ref('');
const selectedUserId = ref<number>();

// 角色列表相关
const roleList = ref<SystemRoleApi.Role[]>([]);
const checkedRoleIds = ref<number[]>([]);
const roleLoading = ref(false);
const saveLoading = ref(false);

// 用户表格列定义
const userColumns = [
  { title: '用户名', dataIndex: 'username', ellipsis: true },
  { title: '昵称', dataIndex: 'nickname', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 80 },
];

// 加载用户列表
async function loadUsers() {
  userLoading.value = true;
  try {
    const res = await getUserList({
      page: 1,
      limit: 100,
      username: searchUsername.value || undefined,
    });
    userList.value = res?.items ?? [];
  } catch {
    message.error('加载用户列表失败');
  } finally {
    userLoading.value = false;
  }
}

// 加载全部角色
async function loadRoles() {
  try {
    const res = await getRoleList({ page: 1, limit: 100 });
    roleList.value = res?.items ?? [];
  } catch {
    message.error('加载角色列表失败');
  }
}

// 点击用户行选中
async function onUserSelect(record: SystemUserApi.User) {
  if (!record.id) return;
  selectedUserId.value = record.id;
  await loadUserRoles(record.id);
}

// 加载用户已分配的角色
async function loadUserRoles(userId: number) {
  roleLoading.value = true;
  try {
    const res = await getUserRoles(userId);
    checkedRoleIds.value = (res ?? []).map((r) => r.id!).filter(Boolean);
  } catch {
    message.error('加载用户角色失败');
  } finally {
    roleLoading.value = false;
  }
}

// 保存角色分配
async function onSave() {
  if (!selectedUserId.value) {
    message.warning('请先选择用户');
    return;
  }
  saveLoading.value = true;
  try {
    await assignUserRoles(selectedUserId.value, checkedRoleIds.value);
    message.success('保存成功');
  } catch {
    message.error('保存失败');
  } finally {
    saveLoading.value = false;
  }
}

// 行样式：高亮选中行
function rowClassName(record: SystemUserApi.User) {
  return record.id === selectedUserId.value ? 'user-row-selected' : '';
}

// 行事件：点击选中用户
function onRow(record: SystemUserApi.User) {
  return {
    onClick: () => onUserSelect(record),
    style: { cursor: 'pointer' },
  };
}

onMounted(() => {
  loadUsers();
  loadRoles();
});
</script>

<template>
  <Page>
    <div class="flex gap-4">
      <!-- 左侧：用户列表 -->
      <Card class="w-1/2" title="用户列表">
        <template #extra>
          <InputSearch
            v-model:value="searchUsername"
            allow-clear
            placeholder="请输入用户名"
            style="width: 200px"
            @search="loadUsers"
          />
        </template>
        <Table
          :columns="userColumns"
          :data-source="userList"
          :loading="userLoading"
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

      <!-- 右侧：角色分配 -->
      <Card class="w-1/2" title="角色分配">
        <template v-if="selectedUserId">
          <Spin :spinning="roleLoading">
            <div class="mb-3 text-gray-500">
              已选角色：{{ checkedRoleIds.length }} 个
            </div>
            <CheckboxGroup v-model:value="checkedRoleIds" style="width: 100%">
              <div class="flex flex-col gap-2">
                <Checkbox
                  v-for="role in roleList"
                  :key="role.id"
                  :value="role.id"
                >
                  {{ role.roleName }}
                  <span class="ml-2 text-gray-400">({{ role.roleKey }})</span>
                </Checkbox>
              </div>
            </CheckboxGroup>
          </Spin>
          <div class="mt-4">
            <Button :loading="saveLoading" type="primary" @click="onSave">
              保存分配
            </Button>
          </div>
        </template>
        <Empty v-else description="请选择左侧用户" />
      </Card>
    </div>
  </Page>
</template>

<style>
/* 选中行高亮：使用半透明主色，暗色/亮色主题下文字均可读 */
.user-row-selected > td {
  background-color: rgba(22, 119, 255, 0.15) !important;
}
</style>

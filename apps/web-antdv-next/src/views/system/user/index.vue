<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  TreeSelect,
} from 'antdv-next';

import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemUserApi } from '#/api/system/user';

import { getDeptTree } from '#/api/system/dept';
import {
  changeUserStatus,
  createUser,
  deleteUser,
  getUserList,
  resetUserPassword,
  updateUser,
} from '#/api/system/user';

defineOptions({ name: 'SystemUser' });

// 列表数据
const dataList = shallowRef<SystemUserApi.User[]>([]);
const loading = ref(false);
const total = ref(0);

// 部门树
const deptTree = shallowRef<SystemDeptApi.Dept[]>([]);

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  username: '',
  status: undefined as number | undefined,
  deptId: undefined as number | undefined,
});

// 弹窗状态
const modalVisible = ref(false);
const modalTitle = ref('新增用户');
const formRef = ref();
const submitting = ref(false);
const isEdit = ref(false);

// 重置密码弹窗
const resetModalVisible = ref(false);
const resetSubmitting = ref(false);
const resetPwdForm = reactive({
  id: undefined as number | undefined,
  password: '',
});

// 表单数据
const formData = reactive<SystemUserApi.User>({
  id: undefined,
  username: '',
  password: '',
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  deptId: undefined,
  deptIds: [],
  status: 1,
});

// 表单校验规则
const rules = computed(() => ({
  username: [{ message: '请输入用户名', required: true, trigger: 'blur' }],
  password: isEdit.value
    ? []
    : [{ message: '请输入用户密码', required: true, trigger: 'blur' }],
  status: [{ message: '请选择状态', required: true, trigger: 'change' }],
}));

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// TreeSelect 数据：基于部门树构造
const deptTreeSelectData = computed(() => {
  const build = (list: SystemDeptApi.Dept[]): any[] =>
    list.map((item) => ({
      key: item.id,
      value: item.id,
      title: item.deptName,
      children: item.children ? build(item.children) : [],
    }));
  return build(deptTree.value);
});

// 表格列定义
const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '姓名', dataIndex: 'realName', key: 'realName' },
  { title: '部门', dataIndex: 'deptName', key: 'deptName' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' as const },
];

// 加载部门树
async function loadDeptTree() {
  try {
    const data = await getDeptTree();
    deptTree.value = data ?? [];
  } catch (error) {
    console.error('加载部门树失败:', error);
  }
}

// 加载列表
async function loadData() {
  loading.value = true;
  try {
    const res: any = await getUserList({ ...query });
    dataList.value = res?.list ?? res?.records ?? [];
    total.value = res?.total ?? 0;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    message.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
}

// 查询
function handleSearch() {
  query.page = 1;
  loadData();
}

// 重置查询
function handleReset() {
  query.username = '';
  query.status = undefined;
  query.deptId = undefined;
  query.page = 1;
  loadData();
}

// 分页变化
function handleTableChange(pagination: any) {
  query.page = pagination.current;
  query.limit = pagination.pageSize;
  loadData();
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    realName: '',
    email: '',
    phone: '',
    avatar: '',
    deptId: undefined,
    deptIds: [],
    status: 1,
  });
}

// 新增
function handleAdd() {
  resetForm();
  isEdit.value = false;
  modalTitle.value = '新增用户';
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: SystemUserApi.User) {
  resetForm();
  Object.assign(formData, record);
  // 多部门回填：优先关系表数据，其次主部门
  formData.deptIds =
    record.deptIds && record.deptIds.length > 0
      ? [...record.deptIds]
      : record.deptId
        ? [record.deptId]
        : [];
  // 编辑时不修改密码
  formData.password = '';
  isEdit.value = true;
  modalTitle.value = '编辑用户';
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (isEdit.value) {
      const { password: _password, ...payload } = formData;
      await updateUser(payload);
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = formData;
      await createUser(payload);
      message.success('新增成功');
    }
    modalVisible.value = false;
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存用户失败:', error);
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteUser(id);
    message.success('删除成功');
    await loadData();
  } catch (error) {
    console.error('删除用户失败:', error);
    message.error('删除失败');
  }
}

// 切换状态
async function handleStatusChange(record: SystemUserApi.User, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await changeUserStatus(record.id!, newStatus);
    record.status = newStatus;
    message.success('状态修改成功');
  } catch (error) {
    console.error('修改用户状态失败:', error);
    message.error('状态修改失败');
  }
}

// 打开重置密码弹窗
function handleResetPassword(record: SystemUserApi.User) {
  resetPwdForm.id = record.id;
  resetPwdForm.password = '';
  resetModalVisible.value = true;
}

// 提交重置密码
async function handleResetSubmit() {
  if (!resetPwdForm.password) {
    message.warning('请输入新密码');
    return;
  }
  try {
    resetSubmitting.value = true;
    await resetUserPassword(resetPwdForm.id!, resetPwdForm.password);
    message.success('密码重置成功');
    resetModalVisible.value = false;
  } catch (error) {
    console.error('重置密码失败:', error);
    message.error('重置密码失败');
  } finally {
    resetSubmitting.value = false;
  }
}

onMounted(() => {
  loadDeptTree();
  loadData();
});
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.username"
        allow-clear
        placeholder="请输入用户名"
        style="width: 180px"
        @press-enter="handleSearch"
      />
      <Select
        v-model:value="query.status"
        :options="statusOptions"
        allow-clear
        placeholder="状态"
        style="width: 120px"
      />
      <TreeSelect
        v-model:value="query.deptId"
        :tree-data="deptTreeSelectData"
        allow-clear
        placeholder="请选择部门"
        style="width: 200px"
        tree-default-expand-all
        tree-node-filter-prop="title"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button @click="handleReset">重置</Button>
      <Button type="primary" @click="handleAdd">新增用户</Button>
    </div>

    <Table
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="{
        current: query.page,
        pageSize: query.limit,
        total,
        showSizeChanger: true,
        showTotal: (t: number) => `共 ${t} 条`,
      }"
      :row-key="(record: any) => record.id"
      :scroll="{ x: 900 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'deptName'">
          {{ record.deptNames || record.deptName || '' }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Switch
            :checked="record.status === 1"
            checked-children="启用"
            un-checked-children="停用"
            @change="(checked: boolean) => handleStatusChange(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              @click="handleResetPassword(record)"
            >
              重置密码
            </Button>
            <Popconfirm
              title="确定要删除该用户吗？"
              @confirm="handleDelete(record.id)"
            >
              <Button danger type="link" size="small">删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="modalVisible"
      :confirm-loading="submitting"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 5 }"
        :model="formData"
        :rules="rules"
        :wrapper-col="{ span: 17 }"
      >
        <FormItem label="用户名" name="username">
          <Input
            v-model:value="formData.username"
            :disabled="isEdit"
            placeholder="请输入用户名"
          />
        </FormItem>
        <FormItem v-if="!isEdit" label="密码" name="password">
          <Input.Password
            v-model:value="formData.password"
            placeholder="请输入用户密码"
          />
        </FormItem>
        <FormItem label="昵称" name="nickname">
          <Input v-model:value="formData.nickname" placeholder="请输入昵称" />
        </FormItem>
        <FormItem label="姓名" name="realName">
          <Input v-model:value="formData.realName" placeholder="请输入姓名" />
        </FormItem>
        <FormItem label="部门" name="deptIds">
          <TreeSelect
            v-model:value="formData.deptIds"
            :tree-data="deptTreeSelectData"
            multiple
            placeholder="请选择部门(可多选，第一个为主部门)"
            tree-default-expand-all
            tree-node-filter-prop="title"
          />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="formData.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="手机号" name="phone">
          <Input v-model:value="formData.phone" placeholder="请输入手机号" />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model:open="resetModalVisible"
      :confirm-loading="resetSubmitting"
      title="重置密码"
      width="420px"
      @ok="handleResetSubmit"
    >
      <Form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <FormItem label="新密码">
          <Input.Password
            v-model:value="resetPwdForm.password"
            placeholder="请输入新密码"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

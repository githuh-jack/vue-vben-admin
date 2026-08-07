<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antdv-next';

import type { SystemRoleApi } from '#/api/system/role';

import {
  createRole,
  deleteRole,
  getRoleList,
  updateRole,
} from '#/api/system/role';

defineOptions({ name: 'SystemRole' });

// 列表数据
const dataList = shallowRef<SystemRoleApi.Role[]>([]);
const loading = ref(false);
const total = ref(0);

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  roleName: '',
  status: undefined as number | undefined,
});

// 弹窗状态
const modalVisible = ref(false);
const modalTitle = ref('新增角色');
const formRef = ref();
const submitting = ref(false);
const isEdit = ref(false);

// 表单数据
const formData = reactive<SystemRoleApi.Role>({
  id: undefined,
  roleName: '',
  roleKey: '',
  sort: 0,
  status: 1,
  dataScope: 1,
  remark: '',
});

// 表单校验规则
const rules = {
  roleName: [{ message: '请输入角色名称', required: true, trigger: 'blur' }],
  roleKey: [{ message: '请输入角色标识', required: true, trigger: 'blur' }],
  sort: [{ message: '请输入排序', required: true, trigger: 'blur' }],
  status: [{ message: '请选择状态', required: true, trigger: 'change' }],
};

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// 数据权限范围选项
const dataScopeOptions = [
  { label: '全部', value: 1 },
  { label: '自定义', value: 2 },
  { label: '本部门', value: 3 },
  { label: '本部门及以下', value: 4 },
  { label: '仅本人', value: 5 },
];

// 表格列定义
const columns = [
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '角色标识', dataIndex: 'roleKey', key: 'roleKey' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const },
];

// 加载列表
async function loadData() {
  loading.value = true;
  try {
    const res: any = await getRoleList({ ...query });
    dataList.value = res?.list ?? res?.records ?? [];
    total.value = res?.total ?? 0;
  } catch (error) {
    console.error('加载角色列表失败:', error);
    message.error('加载角色列表失败');
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
  query.roleName = '';
  query.status = undefined;
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
    roleName: '',
    roleKey: '',
    sort: 0,
    status: 1,
    dataScope: 1,
    remark: '',
  });
}

// 新增
function handleAdd() {
  resetForm();
  isEdit.value = false;
  modalTitle.value = '新增角色';
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: SystemRoleApi.Role) {
  resetForm();
  Object.assign(formData, record);
  isEdit.value = true;
  modalTitle.value = '编辑角色';
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (isEdit.value) {
      await updateRole({ ...formData });
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = formData;
      await createRole(payload);
      message.success('新增成功');
    }
    modalVisible.value = false;
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存角色失败:', error);
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteRole(id);
    message.success('删除成功');
    await loadData();
  } catch (error) {
    console.error('删除角色失败:', error);
    message.error('删除失败');
  }
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.roleName"
        allow-clear
        placeholder="请输入角色名称"
        style="width: 200px"
        @press-enter="handleSearch"
      />
      <Select
        v-model:value="query.status"
        :options="statusOptions"
        allow-clear
        placeholder="状态"
        style="width: 120px"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button @click="handleReset">重置</Button>
      <Button type="primary" @click="handleAdd">新增角色</Button>
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
      :scroll="{ x: 800 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '停用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="确定要删除该角色吗？"
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
        <FormItem label="角色名称" name="roleName">
          <Input
            v-model:value="formData.roleName"
            placeholder="请输入角色名称"
          />
        </FormItem>
        <FormItem label="角色标识" name="roleKey">
          <Input
            v-model:value="formData.roleKey"
            placeholder="请输入角色标识"
          />
        </FormItem>
        <FormItem label="排序" name="sort">
          <InputNumber
            v-model:value="formData.sort"
            :min="0"
            placeholder="请输入排序"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
        <FormItem label="数据权限" name="dataScope">
          <Select
            v-model:value="formData.dataScope"
            :options="dataScopeOptions"
            placeholder="请选择数据权限范围"
          />
        </FormItem>
        <FormItem label="备注" name="remark">
          <Input.TextArea
            v-model:value="formData.remark"
            :rows="3"
            placeholder="请输入备注"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

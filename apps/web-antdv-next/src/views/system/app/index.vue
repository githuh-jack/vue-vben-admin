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
  Tag,
} from 'antdv-next';

import type { SystemAppApi } from '#/api/system/app';

import {
  createApp,
  deleteApp,
  getAppList,
  initAppTables,
  updateApp,
} from '#/api/system/app';

defineOptions({ name: 'SystemApp' });

// 列表数据
const dataList = shallowRef<SystemAppApi.App[]>([]);
const loading = ref(false);
const total = ref(0);

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  appName: '',
  status: undefined as number | undefined,
});

// 弹窗状态
const modalVisible = ref(false);
const modalTitle = ref('新增应用');
const formRef = ref();
const submitting = ref(false);
const isEdit = ref(false);

// 表单数据
const formData = reactive<SystemAppApi.App>({
  id: undefined,
  appName: '',
  appCode: '',
  description: '',
  allowRegister: 1,
  initSql: '',
  status: 1,
});

// 表单校验规则
const rules = computed(() => ({
  appName: [{ message: '请输入应用名称', required: true, trigger: 'blur' }],
  appCode: [
    { message: '请输入应用编码', required: true, trigger: 'blur' },
    {
      message: '应用编码仅支持字母、数字、下划线',
      pattern: /^[A-Za-z0-9_]+$/,
      trigger: 'blur',
    },
  ],
}));

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// 表格列定义
const columns = [
  { title: '应用名称', dataIndex: 'appName', key: 'appName' },
  { title: '应用编码', dataIndex: 'appCode', key: 'appCode' },
  { title: '关联部门', dataIndex: 'deptName', key: 'deptName' },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '准许注册', dataIndex: 'allowRegister', key: 'allowRegister', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '相关表', dataIndex: 'tablesInitialized', key: 'tablesInitialized', width: 100 },
  { title: '创建时间', dataIndex: 'sys001', key: 'sys001', width: 170 },
  { title: '操作', key: 'action', width: 230, fixed: 'right' as const },
];

// 加载列表
async function loadData() {
  loading.value = true;
  try {
    const res: any = await getAppList({ ...query });
    dataList.value = res?.list ?? res?.items ?? [];
    total.value = res?.total ?? 0;
  } catch (error) {
    console.error('加载应用列表失败:', error);
    message.error('加载应用列表失败');
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
  query.appName = '';
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
    appName: '',
    appCode: '',
    description: '',
    allowRegister: 1,
    initSql: '',
    status: 1,
  });
}

// 新增
function handleAdd() {
  resetForm();
  isEdit.value = false;
  modalTitle.value = '新增应用';
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: SystemAppApi.App) {
  resetForm();
  Object.assign(formData, record);
  isEdit.value = true;
  modalTitle.value = '编辑应用';
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (isEdit.value) {
      await updateApp(formData);
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = formData;
      await createApp(payload);
      message.success('新增成功，已自动创建同名根部门');
    }
    modalVisible.value = false;
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存应用失败:', error);
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

// 初始化相关表
async function handleInitTables(record: SystemAppApi.App) {
  try {
    const res: any = await initAppTables(record.id!);
    message.success(`初始化完成，共执行 ${res ?? 0} 条语句`);
    await loadData();
  } catch (error) {
    console.error('初始化相关表失败:', error);
    message.error('初始化相关表失败');
  }
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteApp(id);
    message.success('删除成功');
    await loadData();
  } catch (error) {
    console.error('删除应用失败:', error);
    message.error('删除失败');
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.appName"
        allow-clear
        placeholder="请输入应用名称"
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
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button @click="handleReset">重置</Button>
      <Button type="primary" @click="handleAdd">新增应用</Button>
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
      :scroll="{ x: 1250 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'allowRegister'">
          <Switch
            :checked="record.allowRegister === 1"
            checked-children="是"
            un-checked-children="否"
            disabled
          />
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Switch
            :checked="record.status === 1"
            checked-children="启用"
            un-checked-children="停用"
            disabled
          />
        </template>
        <template v-else-if="column.dataIndex === 'tablesInitialized'">
          <Tag v-if="record.tablesInitialized === 1" color="success">已初始化</Tag>
          <Tag v-else color="warning">未初始化</Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="将执行该应用存储的相关表DDL语句(CREATE TABLE IF NOT EXISTS)，确定执行吗？"
              @confirm="handleInitTables(record)"
            >
              <Button type="link" size="small">初始化相关表</Button>
            </Popconfirm>
            <Popconfirm
              title="删除后关联根部门保留，确定删除该应用吗？"
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
        <FormItem label="应用名称" name="appName">
          <Input v-model:value="formData.appName" placeholder="请输入应用名称" />
        </FormItem>
        <FormItem label="应用编码" name="appCode">
          <Input
            v-model:value="formData.appCode"
            :disabled="isEdit"
            placeholder="请输入应用编码(字母/数字/下划线)"
          />
        </FormItem>
        <FormItem label="准许注册" name="allowRegister">
          <Switch
            v-model:checked="formData.allowRegister"
            :checked-value="1"
            :un-checked-value="0"
            checked-children="是"
            un-checked-children="否"
          />
        </FormItem>
        <FormItem label="描述" name="description">
          <Input.TextArea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入应用描述"
          />
        </FormItem>
        <FormItem label="相关表SQL" name="initSql">
          <Input.TextArea
            v-model:value="formData.initSql"
            :rows="8"
            placeholder="应用相关表初始化DDL语句，多条语句用分号分隔(如 CREATE TABLE IF NOT EXISTS biz_xxx ...)"
          />
        </FormItem>
        <div class="mb-1 px-1 text-xs text-gray-400">
          新增应用后，系统将在部门表自动创建同名根节点，并在菜单表创建应用菜单根节点；相关表SQL可在列表页点击"初始化相关表"执行
        </div>
      </Form>
    </Modal>
  </Page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Table,
} from 'antdv-next';

import {
  getPaperBoatConfigList,
  removePaperBoatConfig,
  savePaperBoatConfig,
} from '#/api/system/paperBoat';

defineOptions({ name: 'PaperBoatConfig' });

const dataList = shallowRef<any[]>([]);
const loading = ref(false);
const total = ref(0);
const query = reactive({ page: 1, limit: 10, configKey: '' });

const modalVisible = ref(false);
const modalTitle = ref('新增配置');
const submitting = ref(false);
const isEdit = ref(false);
const formData = reactive({
  id: undefined as number | undefined,
  config_key: '',
  config_value: '',
  remark: '',
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '配置键', dataIndex: 'config_key', width: 220 },
  { title: '配置值', dataIndex: 'config_value', ellipsis: true },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
  { title: '更新时间', dataIndex: 'sys002', width: 170 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' as const },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getPaperBoatConfigList({ ...query });
    dataList.value = res?.list ?? res?.items ?? [];
    total.value = res?.total ?? 0;
  } catch (error) {
    console.error(error);
    message.error('加载失败(需先在应用管理执行"初始化相关表")');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleTableChange(pagination: any) {
  query.page = pagination.current;
  query.limit = pagination.pageSize;
  loadData();
}

function handleAdd() {
  Object.assign(formData, {
    id: undefined,
    config_key: '',
    config_value: '',
    remark: '',
  });
  isEdit.value = false;
  modalTitle.value = '新增配置';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  Object.assign(formData, {
    id: record.id,
    config_key: record.config_key,
    config_value: record.config_value ?? '',
    remark: record.remark ?? '',
  });
  isEdit.value = true;
  modalTitle.value = '编辑配置';
  modalVisible.value = true;
}

async function handleSubmit() {
  if (!formData.config_key) {
    message.error('配置键不能为空');
    return;
  }
  submitting.value = true;
  try {
    await savePaperBoatConfig({
      config_key: formData.config_key,
      config_value: formData.config_value,
      remark: formData.remark,
    });
    message.success('保存成功');
    modalVisible.value = false;
    await loadData();
  } catch (error) {
    console.error(error);
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await removePaperBoatConfig(id);
    message.success('删除成功');
    await loadData();
  } catch (error) {
    console.error(error);
    message.error('删除失败');
  }
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.configKey"
        allow-clear
        placeholder="配置键"
        style="width: 200px"
        @press-enter="handleSearch"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button type="primary" @click="handleAdd">新增配置</Button>
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
        <template v-if="column.key === 'action'">
          <Button class="mr-1" type="link" size="small" @click="handleEdit(record)">
            编辑
          </Button>
          <Popconfirm title="确定删除该配置吗？" @confirm="handleDelete(record.id)">
            <Button danger type="link" size="small">删除</Button>
          </Popconfirm>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="modalVisible"
      :confirm-loading="submitting"
      :title="modalTitle"
      width="560px"
      @ok="handleSubmit"
    >
      <Form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <FormItem label="配置键">
          <Input v-model:value="formData.config_key" placeholder="如 daily_login_coins" />
        </FormItem>
        <FormItem label="配置值">
          <Input v-model:value="formData.config_value" placeholder="如 10" />
        </FormItem>
        <FormItem label="备注">
          <Input v-model:value="formData.remark" placeholder="配置说明" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

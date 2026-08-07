<script setup lang="ts">
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Select, Space, Table, Tag } from 'antdv-next';

import type { SystemOperLogApi } from '#/api/system/log';

import { getOperLogList } from '#/api/system/log';

// 搜索参数
const searchParams = ref({
  userName: '',
  code: undefined as number | undefined,
});

// 状态码选项
const codeOptions = [
  { label: '成功', value: 20000 },
  { label: '失败', value: 50000 },
];

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 数据列表与加载状态
const list = ref<SystemOperLogApi.OperLog[]>([]);
const loading = ref(false);

// 表格列配置
const columns = [
  { title: '用户名', dataIndex: 'userName', key: 'userName', width: 120 },
  {
    title: '操作名称',
    dataIndex: 'operationName',
    key: 'operationName',
    width: 150,
  },
  {
    title: '操作类型',
    dataIndex: 'operationType',
    key: 'operationType',
    width: 120,
  },
  {
    title: '请求方法',
    dataIndex: 'requestMethod',
    key: 'requestMethod',
    width: 100,
  },
  {
    title: '请求URL',
    dataIndex: 'requestUrl',
    key: 'requestUrl',
    width: 200,
    ellipsis: true,
  },
  { title: '请求IP', dataIndex: 'requestIp', key: 'requestIp', width: 130 },
  {
    title: '耗时(ms)',
    dataIndex: 'costTime',
    key: 'costTime',
    width: 100,
    customRender: ({ record }: any) => `${record.costTime}ms`,
  },
  {
    title: '状态码',
    dataIndex: 'code',
    key: 'code',
    width: 100,
    customRender: ({ record }: any) =>
      h(
        Tag,
        { color: record.code === 20000 ? 'green' : 'red' },
        () => (record.code === 20000 ? '成功' : '失败'),
      ),
  },
  { title: '操作时间', dataIndex: 'startTime', key: 'startTime', width: 180 },
  {
    title: '消息',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
  },
];

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await getOperLogList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      userName: searchParams.value.userName || undefined,
      code: searchParams.value.code,
    });
    list.value = res.items || [];
    pagination.value.total = res.total || 0;
  } catch {
    message.error('加载操作日志失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.value.current = 1;
  loadData();
}

// 重置
function handleReset() {
  searchParams.value.userName = '';
  searchParams.value.code = undefined;
  handleSearch();
}

// 分页变化
function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center gap-2">
      <Input
        v-model:value="searchParams.userName"
        placeholder="用户名"
        allow-clear
        style="width: 200px"
      />
      <Select
        v-model:value="searchParams.code"
        placeholder="状态码"
        allow-clear
        style="width: 150px"
        :options="codeOptions"
      />
      <Button type="primary" @click="handleSearch">搜索</Button>
      <Button @click="handleReset">重置</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="traceId"
      :pagination="pagination"
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
    >
    </Table>
  </Page>
</template>

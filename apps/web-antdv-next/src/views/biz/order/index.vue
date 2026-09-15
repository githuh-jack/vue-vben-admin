<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Table, Tag } from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import { getCoinAdminOrders } from '#/api/biz';

defineOptions({ name: 'BizOrder' });

const dataList = shallowRef<BizAdminApi.Order[]>([]);
const loading = ref(false);

const query = reactive({
  page: 1,
  limit: 10,
  userId: undefined as number | undefined,
  itemType: '',
  status: undefined as number | undefined,
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '用户', dataIndex: 'userName', key: 'userName', width: 120 },
  { title: '商品类型', dataIndex: 'itemType', key: 'itemType', width: 100 },
  { title: '商品名', dataIndex: 'itemName', key: 'itemName' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 90 },
  { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '时间', dataIndex: 'sys001', key: 'sys001', width: 170 },
];

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '待处理' },
  1: { color: 'success', text: '已完成' },
  2: { color: 'error', text: '已退款' },
};

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getCoinAdminOrders({ ...query });
    dataList.value = res?.list ?? res?.items ?? res ?? [];
  } catch {
    message.error('加载订单列表失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleReset() {
  query.userId = undefined;
  query.itemType = '';
  query.status = undefined;
  handleSearch();
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.userId"
        allow-clear
        placeholder="用户ID"
        style="width: 140px"
        type="number"
        @press-enter="handleSearch"
      />
      <Input
        v-model:value="query.itemType"
        allow-clear
        placeholder="商品类型(stamp/envelope)"
        style="width: 220px"
        @press-enter="handleSearch"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button @click="handleReset">重置</Button>
    </div>

    <Table
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="false"
      :row-key="(record: any) => record.id"
      :scroll="{ x: 1100 }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'itemType'">
          {{
            record.itemType === 'stamp'
              ? '邮票'
              : record.itemType === 'envelope'
                ? '信封'
                : record.itemType
          }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="statusMap[record.status]?.color || 'default'">
            {{ statusMap[record.status]?.text || record.status }}
          </Tag>
        </template>
      </template>
    </Table>
  </Page>
</template>

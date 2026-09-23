<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, InputNumber, message, Table } from 'antdv-next';

import { getPaperBoatBambooLogList } from '#/api/system/paperBoat';

defineOptions({ name: 'PaperBoatBambooLog' });

const dataList = shallowRef<any[]>([]);
const loading = ref(false);
const total = ref(0);
const query = reactive({
  page: 1,
  limit: 10,
  userId: undefined as number | undefined,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '用户ID', dataIndex: 'user_id', width: 90 },
  { title: '文竹ID', dataIndex: 'bamboo_id', width: 90 },
  { title: '变化类型', dataIndex: 'change_type', width: 110 },
  { title: '变化高度(cm)', dataIndex: 'change_value', width: 120 },
  { title: '原因', dataIndex: 'reason', ellipsis: true },
  { title: '创建时间', dataIndex: 'sys001', width: 170 },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getPaperBoatBambooLogList({ ...query });
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

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <InputNumber
        v-model:value="query.userId"
        placeholder="用户ID"
        style="width: 140px"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
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
    />
  </Page>
</template>

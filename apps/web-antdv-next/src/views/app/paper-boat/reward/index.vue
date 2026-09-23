<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, InputNumber, message, Table } from 'antdv-next';

import { getPaperBoatRewardList } from '#/api/system/paperBoat';

defineOptions({ name: 'PaperBoatReward' });

const dataList = shallowRef<any[]>([]);
const loading = ref(false);
const total = ref(0);
const query = reactive({
  page: 1,
  limit: 10,
  rewardType: '',
  userId: undefined as number | undefined,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '用户ID', dataIndex: 'user_id', width: 90 },
  { title: '奖励类型', dataIndex: 'reward_type', width: 140 },
  { title: '奖励铜钱(文)', dataIndex: 'reward_coins', width: 120 },
  { title: '奖励日期', dataIndex: 'reward_date', width: 110 },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
  { title: '创建时间', dataIndex: 'sys001', width: 170 },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getPaperBoatRewardList({ ...query });
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
      <Input
        v-model:value="query.rewardType"
        allow-clear
        placeholder="奖励类型(如daily_login)"
        style="width: 200px"
        @press-enter="handleSearch"
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
      :scroll="{ x: 900 }"
      size="middle"
      @change="handleTableChange"
    />
  </Page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, InputNumber, message, Table, Tag } from 'antdv-next';

import { getPaperBoatLetterList } from '#/api/system/paperBoat';

defineOptions({ name: 'PaperBoatLetter' });

const dataList = shallowRef<any[]>([]);
const loading = ref(false);
const total = ref(0);
const query = reactive({
  page: 1,
  limit: 10,
  senderId: undefined as number | undefined,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '发信人ID', dataIndex: 'sender_id', width: 100 },
  { title: '收信人ID', dataIndex: 'receiver_id', width: 100 },
  { title: '内容', dataIndex: 'content', ellipsis: true },
  { title: '类型', dataIndex: 'letter_type', width: 100 },
  { title: '耗用(文)', dataIndex: 'coin_cost', width: 90 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '发送时间', dataIndex: 'send_time', width: 170 },
  { title: '创建时间', dataIndex: 'sys001', width: 170 },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getPaperBoatLetterList({ ...query });
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
        v-model:value="query.senderId"
        placeholder="发信人ID"
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
      :scroll="{ x: 1200 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'letter_type'">
          <Tag :color="record.letter_type === 2 ? 'blue' : 'default'">
            {{ record.letter_type === 2 ? '广场信' : '私人信' }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '正常' : '已撤回' }}
          </Tag>
        </template>
      </template>
    </Table>
  </Page>
</template>

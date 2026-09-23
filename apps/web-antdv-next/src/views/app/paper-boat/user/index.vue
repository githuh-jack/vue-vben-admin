<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Switch, Table } from 'antdv-next';

import { getPaperBoatUserList } from '#/api/system/paperBoat';

defineOptions({ name: 'PaperBoatUser' });

const dataList = shallowRef<any[]>([]);
const loading = ref(false);
const total = ref(0);
const query = reactive({ page: 1, limit: 10, username: '' });

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '用户名', dataIndex: 'username' },
  { title: '昵称', dataIndex: 'nickname' },
  { title: '姓名', dataIndex: 'real_name' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '铜钱(文)', dataIndex: 'coins', width: 90 },
  { title: '信用分', dataIndex: 'credit_score', width: 80 },
  { title: '邀请码', dataIndex: 'invite_code', width: 100 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '注册时间', dataIndex: 'sys001', width: 170 },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getPaperBoatUserList({ ...query });
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
      <Input
        v-model:value="query.username"
        allow-clear
        placeholder="用户名/昵称"
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
      :scroll="{ x: 1200 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Switch :checked="record.status === 1" checked-children="启用" disabled un-checked-children="停用" />
        </template>
      </template>
    </Table>
  </Page>
</template>

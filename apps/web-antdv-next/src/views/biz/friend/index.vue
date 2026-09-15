<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Table, Tag } from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import { getFriendAdminList } from '#/api/biz';

defineOptions({ name: 'BizFriend' });

const dataList = shallowRef<BizAdminApi.Friend[]>([]);
const loading = ref(false);

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '发起方ID', dataIndex: 'userId', key: 'userId', width: 110 },
  { title: '被加方', dataIndex: 'friendName', key: 'friendName', width: 120 },
  { title: '被加方ID', dataIndex: 'friendId', key: 'friendId', width: 110 },
  { title: '申请备注', dataIndex: 'applyRemark', key: 'applyRemark', ellipsis: true },
  { title: '添加时间', dataIndex: 'addTime', key: 'addTime', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'sys001', key: 'sys001', width: 170 },
];

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'processing', text: '申请中' },
  1: { color: 'success', text: '已通过' },
  2: { color: 'error', text: '已拒绝' },
  3: { color: 'default', text: '已删除' },
};

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getFriendAdminList();
    dataList.value = res ?? [];
  } catch {
    message.error('加载好友关系失败');
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center gap-2">
      <Button type="primary" @click="loadData">刷新</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="false"
      :row-key="(record: any) => record.id"
      :scroll="{ x: 1000 }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="statusMap[record.status]?.color || 'default'">
            {{ statusMap[record.status]?.text || record.status }}
          </Tag>
        </template>
      </template>
    </Table>
  </Page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Modal, Table, Tag } from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import { getLetterAdminList } from '#/api/biz';

defineOptions({ name: 'BizLetter' });

const dataList = shallowRef<BizAdminApi.Letter[]>([]);
const loading = ref(false);
const total = ref(0);
const detailVisible = ref(false);
const detailData = shallowRef<BizAdminApi.Letter>({});

const query = reactive({
  page: 1,
  limit: 10,
  senderId: undefined as number | undefined,
  receiverId: undefined as number | undefined,
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '发件人', dataIndex: 'senderName', key: 'senderName', width: 120 },
  { title: '收件人', dataIndex: 'receiverName', key: 'receiverName', width: 120 },
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '邮票', dataIndex: 'stampName', key: 'stampName', width: 100 },
  { title: '信封', dataIndex: 'envelopeName', key: 'envelopeName', width: 100 },
  { title: '发送时间', dataIndex: 'sendTime', key: 'sendTime', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' as const },
];

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '草稿' },
  1: { color: 'processing', text: '已发送' },
  2: { color: 'success', text: '已读' },
  3: { color: 'error', text: '已删除' },
};

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getLetterAdminList({ ...query });
    dataList.value = res?.list ?? res?.items ?? [];
    total.value = res?.total ?? dataList.value.length;
  } catch {
    message.error('加载信件列表失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleReset() {
  query.senderId = undefined;
  query.receiverId = undefined;
  handleSearch();
}

function handleTableChange(pagination: any) {
  query.page = pagination.current;
  query.limit = pagination.pageSize;
  loadData();
}

function viewDetail(record: BizAdminApi.Letter) {
  detailData.value = record;
  detailVisible.value = true;
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="query.senderId"
        allow-clear
        placeholder="发件人ID"
        style="width: 150px"
        type="number"
        @press-enter="handleSearch"
      />
      <Input
        v-model:value="query.receiverId"
        allow-clear
        placeholder="收件人ID"
        style="width: 150px"
        type="number"
        @press-enter="handleSearch"
      />
      <Button type="primary" @click="handleSearch">查询</Button>
      <Button @click="handleReset">重置</Button>
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
      :scroll="{ x: 1100 }"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="statusMap[record.status]?.color || 'default'">
            {{ statusMap[record.status]?.text || record.status }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Button type="link" size="small" @click="viewDetail(record)">
            查看
          </Button>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="detailVisible"
      title="信件详情"
      width="640px"
      :footer="null"
    >
      <div class="space-y-2">
        <p><b>标题：</b>{{ detailData.title }}</p>
        <p><b>发件人：</b>{{ detailData.senderName }} (ID: {{ detailData.senderId }})</p>
        <p><b>收件人：</b>{{ detailData.receiverName }} (ID: {{ detailData.receiverId }})</p>
        <p><b>发送时间：</b>{{ detailData.sendTime || '—' }}</p>
        <p><b>阅读时间：</b>{{ detailData.readTime || '—' }}</p>
        <p><b>邮票：</b>{{ detailData.stampName || '—' }}</p>
        <p><b>信封：</b>{{ detailData.envelopeName || '—' }}</p>
        <div>
          <b>正文：</b>
          <div class="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-3">
            {{ detailData.content }}
          </div>
        </div>
      </div>
    </Modal>
  </Page>
</template>

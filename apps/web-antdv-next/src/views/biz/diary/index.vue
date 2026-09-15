<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Modal, Table, Tag } from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import { getDiaryAdminList } from '#/api/biz';

defineOptions({ name: 'BizDiary' });

const dataList = shallowRef<BizAdminApi.Diary[]>([]);
const loading = ref(false);
const total = ref(0);
const detailVisible = ref(false);
const detailData = shallowRef<BizAdminApi.Diary>({});

const query = reactive({
  page: 1,
  limit: 10,
  userId: undefined as number | undefined,
  keyWord: '',
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '作者', dataIndex: 'userName', key: 'userName', width: 120 },
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '天气', dataIndex: 'weather', key: 'weather', width: 80 },
  { title: '心情', dataIndex: 'mood', key: 'mood', width: 80 },
  { title: '日期', dataIndex: 'writeDate', key: 'writeDate', width: 120 },
  { title: '可见性', dataIndex: 'isPublic', key: 'isPublic', width: 90 },
  { title: '创建时间', dataIndex: 'sys001', key: 'sys001', width: 170 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' as const },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getDiaryAdminList({ ...query });
    dataList.value = res?.list ?? res?.items ?? res ?? [];
    total.value = res?.total ?? dataList.value.length;
  } catch {
    message.error('加载日记列表失败');
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
  query.keyWord = '';
  handleSearch();
}

function handleTableChange(pagination: any) {
  query.page = pagination.current;
  query.limit = pagination.pageSize;
  loadData();
}

function viewDetail(record: BizAdminApi.Diary) {
  detailData.value = record;
  detailVisible.value = true;
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
        v-model:value="query.keyWord"
        allow-clear
        placeholder="标题关键字"
        style="width: 180px"
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
        <template v-if="column.dataIndex === 'isPublic'">
          <Tag :color="record.isPublic === 1 ? 'green' : 'default'">
            {{ record.isPublic === 1 ? '公开' : '私密' }}
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
      title="日记详情"
      width="640px"
      :footer="null"
    >
      <div class="space-y-2">
        <p><b>标题：</b>{{ detailData.title }}</p>
        <p><b>作者：</b>{{ detailData.userName }} (ID: {{ detailData.userId }})</p>
        <p><b>日期：</b>{{ detailData.writeDate }}</p>
        <p><b>天气：</b>{{ detailData.weather || '—' }}</p>
        <p><b>心情：</b>{{ detailData.mood || '—' }}</p>
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

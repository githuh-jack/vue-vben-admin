<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Table,
  Tag,
} from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import {
  adjustUserCoin,
  getCoinAdminLogs,
  getCoinAdminOrders,
} from '#/api/biz';

defineOptions({ name: 'BizCoin' });

const activeTab = ref('logs');
const loading = ref(false);

// 铜钱流水
const logList = shallowRef<BizAdminApi.CoinLog[]>([]);
const logQuery = reactive({
  page: 1,
  limit: 10,
  userId: undefined as number | undefined,
  logType: '',
});
const logTotal = ref(0);

// 订单
const orderList = shallowRef<BizAdminApi.Order[]>([]);
const orderQuery = reactive({
  page: 1,
  limit: 10,
  userId: undefined as number | undefined,
  itemType: '',
  status: undefined as number | undefined,
});

// 调整弹窗
const adjustVisible = ref(false);
const adjustSubmitting = ref(false);
const adjustForm = reactive({
  userId: undefined as number | undefined,
  delta: 0,
  remark: '',
});

const logColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '用户', dataIndex: 'userName', key: 'userName', width: 120 },
  { title: '变动', dataIndex: 'changeAmount', key: 'changeAmount', width: 100 },
  { title: '变动后余额', dataIndex: 'balanceAfter', key: 'balanceAfter', width: 110 },
  { title: '类型', dataIndex: 'logType', key: 'logType', width: 140 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '时间', dataIndex: 'sys001', key: 'sys001', width: 170 },
];

const orderColumns = [
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

const orderStatusMap: Record<number, { color: string; text: string }> = {
  1: { color: 'success', text: '已完成' },
  2: { color: 'error', text: '已退款' },
};

async function loadLogs() {
  loading.value = true;
  try {
    const res: any = await getCoinAdminLogs({ ...logQuery });
    logList.value = res?.list ?? res?.items ?? res ?? [];
    logTotal.value = res?.total ?? logList.value.length;
  } catch {
    message.error('加载铜钱流水失败');
  } finally {
    loading.value = false;
  }
}

async function loadOrders() {
  loading.value = true;
  try {
    const res: any = await getCoinAdminOrders({ ...orderQuery });
    orderList.value = res?.list ?? res?.items ?? res ?? [];
  } catch {
    message.error('加载订单失败');
  } finally {
    loading.value = false;
  }
}

function handleTabChange(key: string) {
  if (key === 'logs') loadLogs();
  else loadOrders();
}

function searchLogs() {
  logQuery.page = 1;
  loadLogs();
}

function handleLogTableChange(pagination: any) {
  logQuery.page = pagination.current;
  logQuery.limit = pagination.pageSize;
  loadLogs();
}

function openAdjust() {
  adjustForm.userId = undefined;
  adjustForm.delta = 0;
  adjustForm.remark = '';
  adjustVisible.value = true;
}

async function submitAdjust() {
  if (!adjustForm.userId) {
    message.warning('请输入用户ID');
    return;
  }
  if (!adjustForm.delta) {
    message.warning('请输入调整数量(正数加,负数减)');
    return;
  }
  try {
    adjustSubmitting.value = true;
    await adjustUserCoin({
      userId: adjustForm.userId,
      delta: adjustForm.delta,
      remark: adjustForm.remark || '管理员调整',
    });
    message.success('调整成功');
    adjustVisible.value = false;
    await loadLogs();
  } catch {
    message.error('调整失败');
  } finally {
    adjustSubmitting.value = false;
  }
}

onMounted(loadLogs);
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button
          :type="activeTab === 'logs' ? 'primary' : 'default'"
          @click="handleTabChange('logs')"
        >
          铜钱流水
        </Button>
        <Button
          :type="activeTab === 'orders' ? 'primary' : 'default'"
          @click="handleTabChange('orders')"
        >
          购买订单
        </Button>
      </div>
      <Button type="primary" @click="openAdjust">调整用户铜钱</Button>
    </div>

    <div v-show="activeTab === 'logs'">
      <div class="mb-4 flex flex-wrap items-center gap-2">
          <Input
            v-model:value="logQuery.userId"
            allow-clear
            placeholder="用户ID"
            style="width: 140px"
            type="number"
            @press-enter="searchLogs"
          />
          <Input
            v-model:value="logQuery.logType"
            allow-clear
            placeholder="类型(如 shop/recharge)"
            style="width: 200px"
            @press-enter="searchLogs"
          />
          <Button type="primary" @click="searchLogs">查询</Button>
        </div>
        <Table
          :columns="logColumns"
          :data-source="logList"
          :loading="loading"
          :pagination="{
            current: logQuery.page,
            pageSize: logQuery.limit,
            total: logTotal,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条`,
          }"
          :row-key="(record: any) => record.id"
          :scroll="{ x: 1000 }"
          size="middle"
          @change="handleLogTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'changeAmount'">
              <span
                :style="{
                  color: record.changeAmount >= 0 ? '#52c41a' : '#f5222d',
                  fontWeight: 600,
                }"
              >
                {{ record.changeAmount >= 0 ? '+' : ''
                }}{{ record.changeAmount }}
              </span>
            </template>
          </template>
        </Table>
      </div>

      <div v-show="activeTab === 'orders'">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <Input
            v-model:value="orderQuery.userId"
            allow-clear
            placeholder="用户ID"
            style="width: 140px"
            type="number"
          />
          <Input
            v-model:value="orderQuery.itemType"
            allow-clear
            placeholder="商品类型(stamp/envelope)"
            style="width: 220px"
          />
          <Button type="primary" @click="loadOrders">查询</Button>
        </div>
        <Table
          :columns="orderColumns"
          :data-source="orderList"
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
              <Tag :color="orderStatusMap[record.status]?.color || 'default'">
                {{ orderStatusMap[record.status]?.text || record.status }}
              </Tag>
            </template>
          </template>
        </Table>
      </div>

    <Modal
      v-model:open="adjustVisible"
      :confirm-loading="adjustSubmitting"
      title="调整用户铜钱"
      width="480px"
      @ok="submitAdjust"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <FormItem label="用户ID" required>
          <InputNumber
            v-model:value="adjustForm.userId"
            style="width: 100%"
            placeholder="用户ID"
          />
        </FormItem>
        <FormItem label="变动数量" required>
          <InputNumber
            v-model:value="adjustForm.delta"
            style="width: 100%"
            placeholder="正数增加, 负数扣减"
          />
        </FormItem>
        <FormItem label="备注">
          <Input
            v-model:value="adjustForm.remark"
            placeholder="管理员调整"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

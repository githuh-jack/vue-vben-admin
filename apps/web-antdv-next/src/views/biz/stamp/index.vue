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
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
} from 'antdv-next';

import type { BizAdminApi } from '#/api/biz';
import {
  createStamp,
  deleteStamp,
  getStampAdminList,
  updateStamp,
} from '#/api/biz';

defineOptions({ name: 'BizStamp' });

const dataList = shallowRef<BizAdminApi.Stamp[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref('新增邮票');
const submitting = ref(false);
const isEdit = ref(false);

const formData = reactive<BizAdminApi.Stamp>({
  id: undefined,
  name: '',
  description: '',
  imageUrl: '',
  price: 1,
  stock: -1,
  stampType: '普通',
  status: 1,
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'stampType', key: 'stampType', width: 100 },
  { title: '单价(文)', dataIndex: 'price', key: 'price', width: 100 },
  {
    title: '库存',
    dataIndex: 'stock',
    key: 'stock',
    width: 100,
    customRender: ({ text }: { text: number }) =>
      text < 0 ? '不限' : text,
  },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const },
];

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getStampAdminList();
    dataList.value = res ?? [];
  } catch {
    message.error('加载邮票列表失败');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    name: '',
    description: '',
    imageUrl: '',
    price: 1,
    stock: -1,
    stampType: '普通',
    status: 1,
  });
}

function handleAdd() {
  resetForm();
  isEdit.value = false;
  modalTitle.value = '新增邮票';
  modalVisible.value = true;
}

function handleEdit(record: BizAdminApi.Stamp) {
  resetForm();
  Object.assign(formData, record);
  isEdit.value = true;
  modalTitle.value = '编辑邮票';
  modalVisible.value = true;
}

async function handleSubmit() {
  if (!formData.name) {
    message.warning('请输入邮票名称');
    return;
  }
  try {
    submitting.value = true;
    if (isEdit.value) {
      await updateStamp(formData);
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = formData;
      await createStamp(payload as BizAdminApi.Stamp);
      message.success('新增成功');
    }
    modalVisible.value = false;
    await loadData();
  } catch {
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteStamp(id);
    message.success('删除成功');
    await loadData();
  } catch {
    message.error('删除失败');
  }
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center gap-2">
      <Button type="primary" @click="handleAdd">新增邮票</Button>
      <Button @click="loadData">刷新</Button>
    </div>

    <Table
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="false"
      :row-key="(record: any) => record.id"
      :scroll="{ x: 900 }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 1 ? 'green' : 'default'">
            {{ record.status === 1 ? '上架' : '下架' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="确定要删除该邮票吗？"
              @confirm="handleDelete(record.id)"
            >
              <Button danger type="link" size="small">删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="modalVisible"
      :confirm-loading="submitting"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
    >
      <Form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <FormItem label="名称" required>
          <Input v-model:value="formData.name" placeholder="邮票名称" />
        </FormItem>
        <FormItem label="类型">
          <Input v-model:value="formData.stampType" placeholder="普通/稀有/限量" />
        </FormItem>
        <FormItem label="单价(文)" required>
          <InputNumber
            v-model:value="formData.price"
            :min="0"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="库存(-1不限)">
          <InputNumber
            v-model:value="formData.stock"
            :min="-1"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="图片URL">
          <Input v-model:value="formData.imageUrl" placeholder="图片链接" />
        </FormItem>
        <FormItem label="描述">
          <Input
            v-model:value="formData.description"
            :rows="3"
            type="textarea"
          />
        </FormItem>
        <FormItem label="上架">
          <Switch
            :checked="formData.status === 1"
            checked-children="上架"
            un-checked-children="下架"
            @change="(c: boolean) => (formData.status = c ? 1 : 0)"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

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
  Select,
  Space,
  Table,
  Tag,
} from 'antdv-next';

import type {
  SystemDictDataApi,
  SystemDictTypeApi,
} from '#/api/system/dict';

import {
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  getDictDataList,
  getDictTypeList,
  updateDictData,
  updateDictType,
} from '#/api/system/dict';

defineOptions({ name: 'SystemDict' });

// ===== 字典类型 =====
const typeList = shallowRef<SystemDictTypeApi.DictType[]>([]);
const typeLoading = ref(false);
const typeTotal = ref(0);
const typeQuery = reactive({
  page: 1,
  limit: 10,
  dictName: '',
  status: undefined as number | undefined,
});

const typeModalVisible = ref(false);
const typeModalTitle = ref('新增字典类型');
const typeFormRef = ref();
const typeSubmitting = ref(false);
const typeIsEdit = ref(false);
const typeFormData = reactive<SystemDictTypeApi.DictType>({
  id: undefined,
  dictName: '',
  dictType: '',
  status: 1,
});

const typeRules = {
  dictName: [{ message: '请输入字典名称', required: true, trigger: 'blur' }],
  dictType: [{ message: '请输入字典类型', required: true, trigger: 'blur' }],
  status: [{ message: '请选择状态', required: true, trigger: 'change' }],
};

// ===== 字典数据 =====
const selectedType = shallowRef<SystemDictTypeApi.DictType | null>(null);
const dataList = shallowRef<SystemDictDataApi.DictData[]>([]);
const dataLoading = ref(false);
const dataTotal = ref(0);
const dataQuery = reactive({
  page: 1,
  limit: 10,
});

const dataModalVisible = ref(false);
const dataModalTitle = ref('新增字典数据');
const dataFormRef = ref();
const dataSubmitting = ref(false);
const dataIsEdit = ref(false);
const dataFormData = reactive<SystemDictDataApi.DictData>({
  id: undefined,
  dictTypeId: 0,
  dictLabel: '',
  dictValue: '',
  sort: 0,
  cssClass: '',
  listClass: 'primary',
  status: 1,
});

const dataRules = {
  dictLabel: [{ message: '请输入字典标签', required: true, trigger: 'blur' }],
  dictValue: [{ message: '请输入字典键值', required: true, trigger: 'blur' }],
  sort: [{ message: '请输入排序', required: true, trigger: 'blur' }],
  status: [{ message: '请选择状态', required: true, trigger: 'change' }],
};

// 通用选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// 字典数据 listClass 样式选项
const listClassOptions = [
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' },
  { label: 'info', value: 'info' },
];

// 字典类型表格列
const typeColumns = [
  { title: '字典名称', dataIndex: 'dictName', key: 'dictName' },
  { title: '字典类型', dataIndex: 'dictType', key: 'dictType' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 240, fixed: 'right' as const },
];

// 字典数据表格列
const dataColumns = [
  { title: '字典标签', dataIndex: 'dictLabel', key: 'dictLabel' },
  { title: '字典键值', dataIndex: 'dictValue', key: 'dictValue' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '样式', dataIndex: 'listClass', key: 'listClass', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const },
];

// 加载字典类型列表
async function loadTypeList() {
  typeLoading.value = true;
  try {
    const res: any = await getDictTypeList({ ...typeQuery });
    typeList.value = res?.list ?? res?.records ?? [];
    typeTotal.value = res?.total ?? 0;
  } catch (error) {
    console.error('加载字典类型列表失败:', error);
    message.error('加载字典类型列表失败');
  } finally {
    typeLoading.value = false;
  }
}

// 查询字典类型
function handleTypeSearch() {
  typeQuery.page = 1;
  loadTypeList();
}

// 重置字典类型查询
function handleTypeReset() {
  typeQuery.dictName = '';
  typeQuery.status = undefined;
  typeQuery.page = 1;
  loadTypeList();
}

// 字典类型分页变化
function handleTypeTableChange(pagination: any) {
  typeQuery.page = pagination.current;
  typeQuery.limit = pagination.pageSize;
  loadTypeList();
}

// 重置字典类型表单
function resetTypeForm() {
  Object.assign(typeFormData, {
    id: undefined,
    dictName: '',
    dictType: '',
    status: 1,
  });
}

// 新增字典类型
function handleTypeAdd() {
  resetTypeForm();
  typeIsEdit.value = false;
  typeModalTitle.value = '新增字典类型';
  typeModalVisible.value = true;
}

// 编辑字典类型
function handleTypeEdit(record: SystemDictTypeApi.DictType) {
  resetTypeForm();
  Object.assign(typeFormData, record);
  typeIsEdit.value = true;
  typeModalTitle.value = '编辑字典类型';
  typeModalVisible.value = true;
}

// 提交字典类型
async function handleTypeSubmit() {
  try {
    await typeFormRef.value?.validate();
    typeSubmitting.value = true;
    if (typeIsEdit.value) {
      await updateDictType({ ...typeFormData });
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = typeFormData;
      await createDictType(payload);
      message.success('新增成功');
    }
    typeModalVisible.value = false;
    await loadTypeList();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存字典类型失败:', error);
    message.error('保存失败');
  } finally {
    typeSubmitting.value = false;
  }
}

// 删除字典类型
async function handleTypeDelete(id: number) {
  try {
    await deleteDictType(id);
    message.success('删除成功');
    // 若删除的是当前选中类型，清空右侧数据
    if (selectedType.value?.id === id) {
      selectedType.value = null;
      dataList.value = [];
    }
    await loadTypeList();
  } catch (error) {
    console.error('删除字典类型失败:', error);
    message.error('删除失败');
  }
}

// ===== 字典数据 =====
// 加载字典数据列表
async function loadDataList() {
  if (!selectedType.value?.id) return;
  dataLoading.value = true;
  try {
    const res: any = await getDictDataList({
      dictTypeId: selectedType.value.id,
      page: dataQuery.page,
      limit: dataQuery.limit,
    });
    dataList.value = res?.list ?? res?.records ?? [];
    dataTotal.value = res?.total ?? 0;
  } catch (error) {
    console.error('加载字典数据失败:', error);
    message.error('加载字典数据失败');
  } finally {
    dataLoading.value = false;
  }
}

// 管理某字典类型的数据
function handleManageData(record: SystemDictTypeApi.DictType) {
  selectedType.value = record;
  dataQuery.page = 1;
  loadDataList();
}

// 字典数据分页变化
function handleDataTableChange(pagination: any) {
  dataQuery.page = pagination.current;
  dataQuery.limit = pagination.pageSize;
  loadDataList();
}

// 重置字典数据表单
function resetDataForm() {
  Object.assign(dataFormData, {
    id: undefined,
    dictTypeId: selectedType.value?.id ?? 0,
    dictLabel: '',
    dictValue: '',
    sort: 0,
    cssClass: '',
    listClass: 'primary',
    status: 1,
  });
}

// 新增字典数据
function handleDataAdd() {
  resetDataForm();
  dataIsEdit.value = false;
  dataModalTitle.value = '新增字典数据';
  dataModalVisible.value = true;
}

// 编辑字典数据
function handleDataEdit(record: SystemDictDataApi.DictData) {
  resetDataForm();
  Object.assign(dataFormData, record);
  dataIsEdit.value = true;
  dataModalTitle.value = '编辑字典数据';
  dataModalVisible.value = true;
}

// 提交字典数据
async function handleDataSubmit() {
  try {
    await dataFormRef.value?.validate();
    dataSubmitting.value = true;
    if (dataIsEdit.value) {
      await updateDictData({ ...dataFormData });
      message.success('修改成功');
    } else {
      const { id: _id, ...payload } = dataFormData;
      await createDictData(payload);
      message.success('新增成功');
    }
    dataModalVisible.value = false;
    await loadDataList();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存字典数据失败:', error);
    message.error('保存失败');
  } finally {
    dataSubmitting.value = false;
  }
}

// 删除字典数据
async function handleDataDelete(id: number) {
  try {
    await deleteDictData(id);
    message.success('删除成功');
    await loadDataList();
  } catch (error) {
    console.error('删除字典数据失败:', error);
    message.error('删除失败');
  }
}

onMounted(loadTypeList);
</script>

<template>
  <Page>
    <!-- 字典类型 -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-base font-medium">字典类型</span>
    </div>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Input
        v-model:value="typeQuery.dictName"
        allow-clear
        placeholder="请输入字典名称"
        style="width: 200px"
        @press-enter="handleTypeSearch"
      />
      <Select
        v-model:value="typeQuery.status"
        :options="statusOptions"
        allow-clear
        placeholder="状态"
        style="width: 120px"
      />
      <Button type="primary" @click="handleTypeSearch">查询</Button>
      <Button @click="handleTypeReset">重置</Button>
      <Button type="primary" @click="handleTypeAdd">新增字典类型</Button>
    </div>

    <Table
      :columns="typeColumns"
      :data-source="typeList"
      :loading="typeLoading"
      :pagination="{
        current: typeQuery.page,
        pageSize: typeQuery.limit,
        total: typeTotal,
        showSizeChanger: true,
        showTotal: (t: number) => `共 ${t} 条`,
      }"
      :row-key="(record: any) => record.id"
      :scroll="{ x: 700 }"
      size="middle"
      @change="handleTypeTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '停用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button
              type="link"
              size="small"
              @click="handleManageData(record)"
            >
              管理数据
            </Button>
            <Button
              type="link"
              size="small"
              @click="handleTypeEdit(record)"
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除该字典类型吗？"
              @confirm="handleTypeDelete(record.id)"
            >
              <Button danger type="link" size="small">删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 字典数据 -->
    <div v-if="selectedType" class="mt-6">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-base font-medium">
          字典数据（{{ selectedType.dictName }} - {{ selectedType.dictType }}）
        </span>
      </div>
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Button type="primary" @click="handleDataAdd">新增字典数据</Button>
        <Button @click="loadDataList">刷新</Button>
      </div>

      <Table
        :columns="dataColumns"
        :data-source="dataList"
        :loading="dataLoading"
        :pagination="{
          current: dataQuery.page,
          pageSize: dataQuery.limit,
          total: dataTotal,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        :row-key="(record: any) => record.id"
        :scroll="{ x: 700 }"
        size="middle"
        @change="handleDataTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'listClass'">
            <Tag
              v-if="record.listClass"
              :color="record.listClass"
            >
              {{ record.listClass }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '停用' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <Space>
              <Button
                type="link"
                size="small"
                @click="handleDataEdit(record)"
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除该字典数据吗？"
                @confirm="handleDataDelete(record.id)"
              >
                <Button danger type="link" size="small">删除</Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </div>

    <!-- 字典类型弹窗 -->
    <Modal
      v-model:open="typeModalVisible"
      :confirm-loading="typeSubmitting"
      :title="typeModalTitle"
      width="500px"
      @ok="handleTypeSubmit"
    >
      <Form
        ref="typeFormRef"
        :label-col="{ span: 6 }"
        :model="typeFormData"
        :rules="typeRules"
        :wrapper-col="{ span: 16 }"
      >
        <FormItem label="字典名称" name="dictName">
          <Input
            v-model:value="typeFormData.dictName"
            placeholder="请输入字典名称"
          />
        </FormItem>
        <FormItem label="字典类型" name="dictType">
          <Input
            v-model:value="typeFormData.dictType"
            :disabled="typeIsEdit"
            placeholder="请输入字典类型"
          />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="typeFormData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 字典数据弹窗 -->
    <Modal
      v-model:open="dataModalVisible"
      :confirm-loading="dataSubmitting"
      :title="dataModalTitle"
      width="500px"
      @ok="handleDataSubmit"
    >
      <Form
        ref="dataFormRef"
        :label-col="{ span: 6 }"
        :model="dataFormData"
        :rules="dataRules"
        :wrapper-col="{ span: 16 }"
      >
        <FormItem label="字典标签" name="dictLabel">
          <Input
            v-model:value="dataFormData.dictLabel"
            placeholder="请输入字典标签"
          />
        </FormItem>
        <FormItem label="字典键值" name="dictValue">
          <Input
            v-model:value="dataFormData.dictValue"
            placeholder="请输入字典键值"
          />
        </FormItem>
        <FormItem label="排序" name="sort">
          <InputNumber
            v-model:value="dataFormData.sort"
            :min="0"
            placeholder="请输入排序"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="样式属性" name="cssClass">
          <Input
            v-model:value="dataFormData.cssClass"
            placeholder="请输入样式属性"
          />
        </FormItem>
        <FormItem label="列表样式" name="listClass">
          <Select
            v-model:value="dataFormData.listClass"
            :options="listClassOptions"
            placeholder="请选择列表样式"
          />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="dataFormData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

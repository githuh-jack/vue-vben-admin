<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';

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
  TreeSelect,
} from 'antdv-next';

import type { SystemDeptApi } from '#/api/system/dept';

import {
  createDept,
  deleteDept,
  getDeptById,
  getDeptTree,
  updateDept,
} from '#/api/system/dept';

// 部门树数据
const deptList = ref<SystemDeptApi.Dept[]>([]);
const loading = ref(false);

// 弹窗状态
const modalVisible = ref(false);
const modalTitle = ref('');
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

// 表单数据
const formState = ref({
  id: undefined as number | undefined,
  parentId: 0,
  deptName: '',
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
});

// 表单校验规则
const rules = {
  parentId: [{ required: true, message: '请选择父部门', trigger: 'change' }],
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// 表格列配置
const columns = [
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName',
    width: 200,
  },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 100 },
  { title: '负责人', dataIndex: 'leader', key: 'leader', width: 120 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 150 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    customRender: ({ record }: any) =>
      h(
        Tag,
        { color: record.status === 1 ? 'green' : 'red' },
        () => (record.status === 1 ? '启用' : '停用'),
      ),
  },
  { title: '操作', key: 'action', width: 250, fixed: 'right' },
];

// 将部门树转换为 TreeSelect 数据
function toTreeData(list: SystemDeptApi.Dept[]): any[] {
  return list.map((item) => ({
    title: item.deptName,
    value: item.id!,
    children: item.children?.length ? toTreeData(item.children) : undefined,
  }));
}

// TreeSelect 数据(含顶级节点)
const treeData = computed(() => [
  { title: '顶级', value: 0, children: toTreeData(deptList.value) },
]);

// 加载部门树
async function loadData() {
  loading.value = true;
  try {
    const res = await getDeptTree();
    deptList.value = res || [];
  } catch {
    message.error('加载部门树失败');
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  formState.value = {
    id: undefined,
    parentId: 0,
    deptName: '',
    sort: 0,
    leader: '',
    phone: '',
    email: '',
    status: 1,
  };
}

// 新增顶级部门
function handleAdd() {
  isEdit.value = false;
  modalTitle.value = '新增部门';
  resetForm();
  modalVisible.value = true;
}

// 新增子部门
function handleAddChild(record: SystemDeptApi.Dept) {
  isEdit.value = false;
  modalTitle.value = '新增子部门';
  resetForm();
  formState.value.parentId = record.id!;
  modalVisible.value = true;
}

// 编辑部门
async function handleEdit(record: SystemDeptApi.Dept) {
  isEdit.value = true;
  modalTitle.value = '编辑部门';
  resetForm();
  try {
    const data = await getDeptById(record.id!);
    formState.value = {
      id: data.id,
      parentId: data.parentId,
      deptName: data.deptName,
      sort: data.sort,
      leader: data.leader,
      phone: data.phone,
      email: data.email,
      status: data.status,
    };
  } catch {
    Object.assign(formState.value, record);
  }
  modalVisible.value = true;
}

// 删除部门
async function handleDelete(id: number) {
  try {
    await deleteDept(id);
    message.success('删除成功');
    loadData();
  } catch {
    message.error('删除失败');
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;
    if (isEdit.value) {
      await updateDept(formState.value as SystemDeptApi.Dept);
      message.success('修改成功');
    } else {
      await createDept(formState.value);
      message.success('新增成功');
    }
    modalVisible.value = false;
    loadData();
  } catch {
    // 校验失败
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center gap-2">
      <Button type="primary" @click="handleAdd">新增部门</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="deptList"
      :loading="loading"
      row-key="id"
      :pagination="false"
      :scroll="{ x: 1000 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleAddChild(record)">
              新增子部门
            </Button>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="确定删除该部门吗？"
              @confirm="handleDelete(record.id)"
            >
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
    >
      <Form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <FormItem label="父部门" name="parentId">
          <TreeSelect
            v-model:value="formState.parentId"
            :tree-data="treeData"
            placeholder="请选择父部门"
            tree-default-expand-all
          />
        </FormItem>
        <FormItem label="部门名称" name="deptName">
          <Input
            v-model:value="formState.deptName"
            placeholder="请输入部门名称"
          />
        </FormItem>
        <FormItem label="排序" name="sort">
          <InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" />
        </FormItem>
        <FormItem label="负责人" name="leader">
          <Input v-model:value="formState.leader" placeholder="请输入负责人" />
        </FormItem>
        <FormItem label="联系电话" name="phone">
          <Input v-model:value="formState.phone" placeholder="请输入联系电话" />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="formState.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="formState.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';

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

import type { SystemResourceApi } from '#/api/system/resource';

import {
  createResource,
  deleteResource,
  getResourceTree,
  updateResource,
} from '#/api/system/resource';

defineOptions({ name: 'SystemResource' });

// 资源树数据
const resourceList = shallowRef<SystemResourceApi.Resource[]>([]);
const loading = ref(false);

// 弹窗状态
const modalVisible = ref(false);
const modalTitle = ref('新增资源');
const formRef = ref();
const submitting = ref(false);

// 表单数据
const formData = reactive<SystemResourceApi.Resource>({
  id: undefined,
  resourceName: '',
  parentId: 0,
  sort: 0,
  path: '',
  component: '',
  resourceType: 'M',
  perms: '',
  icon: '',
  status: 1,
});

// 表单校验规则
const rules = {
  resourceName: [{ message: '请输入资源名称', required: true, trigger: 'blur' }],
  parentId: [{ message: '请选择父资源', required: true, trigger: 'change' }],
  resourceType: [
    { message: '请选择资源类型', required: true, trigger: 'change' },
  ],
  sort: [{ message: '请输入排序', required: true, trigger: 'blur' }],
  status: [{ message: '请选择状态', required: true, trigger: 'change' }],
};

// 资源类型选项
const resourceTypeOptions = [
  { label: '菜单 (M)', value: 'M' },
  { label: '接口 (A)', value: 'A' },
  { label: '按钮 (F)', value: 'F' },
];

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// TreeSelect 数据：基于资源树构造
const treeSelectData = computed(() => {
  const build = (
    list: SystemResourceApi.Resource[],
  ): any[] =>
    list.map((item) => ({
      key: item.id,
      value: item.id,
      title: item.resourceName,
      children: item.children ? build(item.children) : [],
    }));
  return [
    { key: 0, value: 0, title: '根节点', children: build(resourceList.value) },
  ];
});

// 资源类型 Tag 颜色
function typeColor(type: SystemResourceApi.ResourceType) {
  switch (type) {
    case 'M': {
      return 'blue';
    }
    case 'A': {
      return 'green';
    }
    case 'F': {
      return 'orange';
    }
    default: {
      return 'default';
    }
  }
}

function typeText(type: SystemResourceApi.ResourceType) {
  switch (type) {
    case 'M': {
      return '菜单';
    }
    case 'A': {
      return '接口';
    }
    case 'F': {
      return '按钮';
    }
    default: {
      return type;
    }
  }
}

// 表格列定义
const columns = [
  { title: '资源名称', dataIndex: 'resourceName', key: 'resourceName' },
  {
    title: '资源类型',
    dataIndex: 'resourceType',
    key: 'resourceType',
    width: 100,
  },
  { title: '路由路径', dataIndex: 'path', key: 'path' },
  { title: '权限标识', dataIndex: 'perms', key: 'perms' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' as const },
];

// 加载资源树
async function loadData() {
  loading.value = true;
  try {
    const data = await getResourceTree();
    resourceList.value = data ?? [];
  } catch (error) {
    console.error('加载资源树失败:', error);
    message.error('加载资源树失败');
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    id: undefined,
    resourceName: '',
    parentId: 0,
    sort: 0,
    path: '',
    component: '',
    resourceType: 'M',
    perms: '',
    icon: '',
    status: 1,
  });
}

// 新增（根级或子级）
function handleAdd(parentId = 0) {
  resetForm();
  formData.parentId = parentId;
  modalTitle.value = parentId === 0 ? '新增根资源' : '新增子资源';
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: SystemResourceApi.Resource) {
  resetForm();
  Object.assign(formData, record);
  modalTitle.value = '编辑资源';
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (formData.id) {
      await updateResource({ ...formData });
      message.success('修改成功');
    } else {
      const { id: _id, children: _children, ...payload } = formData;
      await createResource(payload);
      message.success('新增成功');
    }
    modalVisible.value = false;
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) return; // 校验失败
    console.error('保存资源失败:', error);
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteResource(id);
    message.success('删除成功');
    await loadData();
  } catch (error) {
    console.error('删除资源失败:', error);
    message.error('删除失败');
  }
}

onMounted(loadData);
</script>

<template>
  <Page>
    <div class="mb-4 flex items-center gap-2">
      <Button type="primary" @click="handleAdd(0)">新增根资源</Button>
      <Button @click="loadData">刷新</Button>
    </div>

    <Table
      :columns="columns"
      :data-source="resourceList"
      :loading="loading"
      :pagination="false"
      :row-key="(record: any) => record.id"
      children-column-name="children"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'resourceType'">
          <Tag :color="typeColor(record.resourceType)">
            {{ typeText(record.resourceType) }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '停用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleAdd(record.id)">
              新增子资源
            </Button>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="确定要删除该资源吗？"
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
      <Form
        ref="formRef"
        :label-col="{ span: 5 }"
        :model="formData"
        :rules="rules"
        :wrapper-col="{ span: 17 }"
      >
        <FormItem label="父资源" name="parentId">
          <TreeSelect
            v-model:value="formData.parentId"
            :tree-data="treeSelectData"
            placeholder="请选择父资源"
            tree-default-expand-all
            tree-node-filter-prop="title"
          />
        </FormItem>
        <FormItem label="资源名称" name="resourceName">
          <Input
            v-model:value="formData.resourceName"
            placeholder="请输入资源名称"
          />
        </FormItem>
        <FormItem label="资源类型" name="resourceType">
          <Select
            v-model:value="formData.resourceType"
            :options="resourceTypeOptions"
            placeholder="请选择资源类型"
          />
        </FormItem>
        <FormItem label="路由路径" name="path">
          <Input v-model:value="formData.path" placeholder="请输入路由路径" />
        </FormItem>
        <FormItem label="组件路径" name="component">
          <Input
            v-model:value="formData.component"
            placeholder="请输入组件路径"
          />
        </FormItem>
        <FormItem label="权限标识" name="perms">
          <Input v-model:value="formData.perms" placeholder="请输入权限标识" />
        </FormItem>
        <FormItem label="图标" name="icon">
          <Input v-model:value="formData.icon" placeholder="请输入图标" />
        </FormItem>
        <FormItem label="排序" name="sort">
          <InputNumber
            v-model:value="formData.sort"
            :min="0"
            placeholder="请输入排序"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

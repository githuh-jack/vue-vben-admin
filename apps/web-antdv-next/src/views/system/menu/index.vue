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

import type { SystemMenuApi } from '#/api/system/menu';

import {
  createMenu,
  deleteMenu,
  getMenuTree,
  updateMenu,
} from '#/api/system/menu';

// 菜单树数据
const menuList = ref<SystemMenuApi.Menu[]>([]);
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
  menuName: '',
  title: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  affixTab: 0,
  keepAlive: 0,
  badgeType: '',
  link: '',
  status: 1,
});

// 表单校验规则
const rules = {
  parentId: [{ required: true, message: '请选择父菜单', trigger: 'change' }],
  menuName: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
  title: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

// 是否选项
const yesNoOptions = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

// 表格列配置
const columns = [
  {
    title: '路由名称',
    dataIndex: 'menuName',
    key: 'menuName',
    width: 180,
  },
  { title: '菜单标题', dataIndex: 'title', key: 'title', width: 150 },
  { title: '图标', dataIndex: 'icon', key: 'icon', width: 120 },
  { title: '路由路径', dataIndex: 'path', key: 'path', width: 180 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 100 },
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

// 将菜单树转换为 TreeSelect 数据
function toTreeData(list: SystemMenuApi.Menu[]): any[] {
  return list.map((item) => ({
    title: item.title,
    value: item.id!,
    children: item.children?.length ? toTreeData(item.children) : undefined,
  }));
}

// TreeSelect 数据(含顶级节点)
const treeData = computed(() => [
  { title: '顶级', value: 0, children: toTreeData(menuList.value) },
]);

// 加载菜单树
async function loadData() {
  loading.value = true;
  try {
    const res = await getMenuTree();
    menuList.value = res || [];
  } catch {
    message.error('加载菜单树失败');
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  formState.value = {
    id: undefined,
    parentId: 0,
    menuName: '',
    title: '',
    icon: '',
    path: '',
    component: '',
    sort: 0,
    affixTab: 0,
    keepAlive: 0,
    badgeType: '',
    link: '',
    status: 1,
  };
}

// 新增顶级菜单
function handleAdd() {
  isEdit.value = false;
  modalTitle.value = '新增菜单';
  resetForm();
  modalVisible.value = true;
}

// 新增子菜单
function handleAddChild(record: SystemMenuApi.Menu) {
  isEdit.value = false;
  modalTitle.value = '新增子菜单';
  resetForm();
  formState.value.parentId = record.id!;
  modalVisible.value = true;
}

// 编辑菜单
function handleEdit(record: SystemMenuApi.Menu) {
  isEdit.value = true;
  modalTitle.value = '编辑菜单';
  resetForm();
  Object.assign(formState.value, {
    id: record.id,
    parentId: record.parentId,
    menuName: record.menuName,
    title: record.title,
    icon: record.icon,
    path: record.path,
    component: record.component,
    sort: record.sort,
    affixTab: record.affixTab,
    keepAlive: record.keepAlive,
    badgeType: record.badgeType,
    link: record.link,
    status: record.status,
  });
  modalVisible.value = true;
}

// 删除菜单
async function handleDelete(id: number) {
  try {
    await deleteMenu(id);
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
      await updateMenu(formState.value as SystemMenuApi.Menu);
      message.success('修改成功');
    } else {
      await createMenu(formState.value);
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
      <Button type="primary" @click="handleAdd">新增菜单</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="menuList"
      :loading="loading"
      row-key="id"
      :pagination="false"
      :scroll="{ x: 1200 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Space>
            <Button type="link" size="small" @click="handleAddChild(record)">
              新增子菜单
            </Button>
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Popconfirm
              title="确定删除该菜单吗？"
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
        <FormItem label="父菜单" name="parentId">
          <TreeSelect
            v-model:value="formState.parentId"
            :tree-data="treeData"
            placeholder="请选择父菜单"
            tree-default-expand-all
          />
        </FormItem>
        <FormItem label="路由名称" name="menuName">
          <Input
            v-model:value="formState.menuName"
            placeholder="请输入路由名称"
          />
        </FormItem>
        <FormItem label="菜单标题" name="title">
          <Input
            v-model:value="formState.title"
            placeholder="请输入菜单标题"
          />
        </FormItem>
        <FormItem label="图标" name="icon">
          <Input v-model:value="formState.icon" placeholder="请输入图标" />
        </FormItem>
        <FormItem label="路由路径" name="path">
          <Input v-model:value="formState.path" placeholder="请输入路由路径" />
        </FormItem>
        <FormItem label="组件路径" name="component">
          <Input
            v-model:value="formState.component"
            placeholder="请输入组件路径"
          />
        </FormItem>
        <FormItem label="排序" name="sort">
          <InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" />
        </FormItem>
        <FormItem label="状态" name="status">
          <Select
            v-model:value="formState.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </FormItem>
        <FormItem label="是否缓存" name="keepAlive">
          <Select
            v-model:value="formState.keepAlive"
            :options="yesNoOptions"
            placeholder="请选择是否缓存"
          />
        </FormItem>
        <FormItem label="固定Tab" name="affixTab">
          <Select
            v-model:value="formState.affixTab"
            :options="yesNoOptions"
            placeholder="请选择是否固定Tab"
          />
        </FormItem>
        <FormItem label="外链URL" name="link">
          <Input v-model:value="formState.link" placeholder="请输入外链URL" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

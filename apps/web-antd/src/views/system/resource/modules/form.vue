<script lang="ts" setup>
import type { SystemResourceApi } from '#/api/system/resource';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { getResourceTree } from '#/api/system/resource';
import { createResource, updateResource } from '#/api/system/resource';
import { $t } from '#/locales';

import { getResourceTypeOptions } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemResourceApi.SystemResource>();

const schema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getResourceTypeOptions(),
      optionType: 'button',
    },
    defaultValue: 'A',
    fieldName: 'resourceType',
    formItemClass: 'col-span-2 md:col-span-2',
    label: $t('system.resource.type'),
  },
  {
    component: 'Input',
    fieldName: 'resourceName',
    label: $t('system.resource.resourceName'),
    rules: z
      .string()
      .min(
        2,
        $t('ui.formRules.minLength', [
          $t('system.resource.resourceName'),
          2,
        ]),
      )
      .max(
        30,
        $t('ui.formRules.maxLength', [
          $t('system.resource.resourceName'),
          30,
        ]),
      ),
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      api: getResourceTree,
      class: 'w-full',
      labelField: 'resourceName',
      valueField: 'id',
      childrenField: 'children',
      treeDefaultExpandAll: true,
    },
    fieldName: 'parentId',
    label: $t('system.resource.parent'),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['M', 'A'].includes(values.resourceType);
      },
      triggerFields: ['resourceType'],
    },
    fieldName: 'path',
    label: $t('system.resource.path'),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['A'].includes(values.resourceType);
      },
      triggerFields: ['resourceType'],
    },
    fieldName: 'component',
    label: $t('system.resource.component'),
  },
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.resourceType === 'F' ? 'required' : null;
      },
      show: (values) => {
        return ['A', 'F'].includes(values.resourceType);
      },
      triggerFields: ['resourceType'],
    },
    fieldName: 'perms',
    label: $t('system.resource.perms'),
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'lucide',
    },
    dependencies: {
      show: (values) => {
        return ['M', 'A'].includes(values.resourceType);
      },
      triggerFields: ['resourceType'],
    },
    fieldName: 'icon',
    label: $t('system.resource.icon'),
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: $t('system.resource.sort'),
    defaultValue: 0,
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: 1 },
        { label: $t('common.disabled'), value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: $t('system.resource.status'),
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemResourceApi.SystemResource>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      } else {
        formApi.resetForm();
        formData.value = undefined;
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data = await formApi.getValues();
    try {
      await (formData.value?.id
        ? updateResource({ id: formData.value.id, ...data })
        : createResource(data));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.resource.name')])
    : $t('ui.actionTitle.create', [$t('system.resource.name')]),
);
</script>

<template>
  <Drawer class="w-full max-w-200" :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>

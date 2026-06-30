import type { DescriptionsItemType } from '@vben/common-ui';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { getDeptTree } from '#/api/system/dept';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: $t('system.user.password'),
      componentProps: {
        type: 'password',
      },
      dependencies: {
        rules: (values) => {
          return values.id ? null : 'required';
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: $t('system.user.nickname'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.user.phone'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptTree,
        class: 'w-full',
        labelField: 'deptName',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'deptId',
      label: $t('system.user.dept'),
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
      label: $t('system.user.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.user.status'),
    },
  ];
}

export function useDescriptionItems(
  row?: SystemUserApi.SystemUser,
): DescriptionsItemType[] {
  const enabled = row?.status === 1;
  return [
    { label: $t('system.user.username'), content: row?.username },
    { label: $t('system.user.nickname'), content: row?.realName },
    { label: $t('system.user.email'), content: row?.email },
    { label: $t('system.user.phone'), content: row?.phone },
    { label: $t('system.user.dept'), content: row?.deptName },
    {
      label: $t('system.user.status'),
      content: () =>
        h(
          Tag,
          { color: enabled ? 'success' : 'error' },
          {
            default: () =>
              enabled ? $t('common.enabled') : $t('common.disabled'),
          },
        ),
    },
    { label: $t('system.user.createTime'), content: row?.sys001 },
    { label: $t('system.user.updateTime'), content: row?.sys002 },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onStatusChange?: (
    newStatus: any,
    row: T,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns {
  return [
    {
      field: 'id',
      title: 'ID',
      width: 80,
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      width: 120,
    },
    {
      field: 'realName',
      title: $t('system.user.nickname'),
      width: 120,
    },
    {
      field: 'deptName',
      title: $t('system.user.dept'),
      width: 120,
    },
    {
      field: 'phone',
      title: $t('system.user.phone'),
      width: 140,
    },
    {
      field: 'email',
      title: $t('system.user.email'),
      width: 180,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'sys001',
      title: $t('system.user.createTime'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.user.operation'),
      width: 200,
    },
  ];
}

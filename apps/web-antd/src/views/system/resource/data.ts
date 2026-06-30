import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemResourceApi } from '#/api/system/resource';

import { $t } from '#/locales';

export function getResourceTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.resource.typeMenu'),
      value: 'M',
    },
    {
      color: 'default',
      label: $t('system.resource.typeApi'),
      value: 'A',
    },
    {
      color: 'error',
      label: $t('system.resource.typeButton'),
      value: 'F',
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemResourceApi.SystemResource>,
): VxeTableGridColumns<SystemResourceApi.SystemResource> {
  return [
    {
      align: 'left',
      field: 'resourceName',
      fixed: 'left',
      title: $t('system.resource.resourceName'),
      treeNode: true,
      width: 200,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getResourceTypeOptions() },
      field: 'resourceType',
      title: $t('system.resource.type'),
      width: 100,
    },
    {
      field: 'perms',
      title: $t('system.resource.perms'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.resource.path'),
      width: 200,
    },
    {
      align: 'left',
      field: 'component',
      minWidth: 200,
      title: $t('system.resource.component'),
    },
    {
      field: 'icon',
      title: $t('system.resource.icon'),
      width: 120,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.resource.status'),
      width: 100,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'resourceName',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit',
          'delete',
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.resource.operation'),
      width: 200,
    },
  ];
}

<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemResourceApi } from '#/api/system/resource';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteResource, getResourceTree } from '#/api/system/resource';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await getResourceTree();
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemResourceApi.SystemResource>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemResourceApi.SystemResource) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: SystemResourceApi.SystemResource) {
  formDrawerApi.setData({ parentId: row.id }).open();
}

function onDelete(row: SystemResourceApi.SystemResource) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.resourceName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteResource(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.resourceName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.resource.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="mr-1 size-4" />
          {{ $t('ui.actionTitle.create', [$t('system.resource.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

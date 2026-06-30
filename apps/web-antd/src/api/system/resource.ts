import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemResourceApi {
  /** 资源类型 */
  export type ResourceType = 'M' | 'A' | 'F';

  export interface SystemResource {
    [key: string]: any;
    id: number;
    resourceName: string;
    parentId: number;
    sort: number;
    path: string;
    component: string;
    resourceType: ResourceType;
    perms: string;
    icon: string;
    status: 0 | 1;
    children?: SystemResource[];
    sys001: string;
    sys002: string;
  }
}

/** 查询资源树 */
async function getResourceTree() {
  return requestClient.get<SystemResourceApi.SystemResource[]>(
    '/system/resource/tree',
  );
}

/** 查询资源详情 */
async function getResourceDetail(id: number) {
  return requestClient.get<SystemResourceApi.SystemResource>(
    `/system/resource/detail/${id}`,
  );
}

/** 新增资源 */
async function createResource(data: Recordable<any>) {
  return requestClient.post('/system/resource', data);
}

/** 修改资源 */
async function updateResource(data: Recordable<any>) {
  return requestClient.post('/system/resource/edit', data);
}

/** 删除资源 */
async function deleteResource(id: number) {
  return requestClient.post(`/system/resource/remove/${id}`);
}

export {
  createResource,
  deleteResource,
  getResourceDetail,
  getResourceTree,
  updateResource,
};

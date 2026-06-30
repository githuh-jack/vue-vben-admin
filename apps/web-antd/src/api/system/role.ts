import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: number;
    roleName: string;
    roleKey: string;
    sort: number;
    status: 0 | 1;
    dataScope: number;
    remark: string;
    sys001: string;
    sys002: string;
  }
}

/** 查询角色列表 */
async function getRoleList(params?: Recordable<any>) {
  return requestClient.get<SystemRoleApi.SystemRole[]>('/system/role/list', {
    params,
  });
}

/** 查询角色详情 */
async function getRoleDetail(id: number) {
  return requestClient.get<SystemRoleApi.SystemRole>(
    `/system/role/detail/${id}`,
  );
}

/** 新增角色 */
async function createRole(data: Recordable<any>) {
  return requestClient.post('/system/role', data);
}

/** 修改角色 */
async function updateRole(data: Recordable<any>) {
  return requestClient.post('/system/role/edit', data);
}

/** 删除角色 */
async function deleteRole(id: number) {
  return requestClient.post(`/system/role/remove/${id}`);
}

export { createRole, deleteRole, getRoleDetail, getRoleList, updateRole };

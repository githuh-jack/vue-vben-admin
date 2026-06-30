import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    id: number;
    parentId: number;
    deptName: string;
    sort: number;
    leader: string;
    phone: string;
    email: string;
    status: 0 | 1;
    children?: SystemDept[];
    sys001: string;
    sys002: string;
  }
}

/** 查询部门列表 */
async function getDeptList() {
  return requestClient.get<SystemDeptApi.SystemDept[]>('/system/dept/list');
}

/** 查询部门树 */
async function getDeptTree() {
  return requestClient.get<SystemDeptApi.SystemDept[]>('/system/dept/tree');
}

/** 查询部门详情 */
async function getDeptDetail(id: number) {
  return requestClient.get<SystemDeptApi.SystemDept>(
    `/system/dept/detail/${id}`,
  );
}

/** 新增部门 */
async function createDept(data: Recordable<any>) {
  return requestClient.post('/system/dept', data);
}

/** 修改部门 */
async function updateDept(data: Recordable<any>) {
  return requestClient.post('/system/dept/edit', data);
}

/** 删除部门 */
async function deleteDept(id: number) {
  return requestClient.post(`/system/dept/remove/${id}`);
}

export { createDept, deleteDept, getDeptDetail, getDeptList, getDeptTree, updateDept };

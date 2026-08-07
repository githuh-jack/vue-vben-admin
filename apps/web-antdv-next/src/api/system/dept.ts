import { requestClient } from '#/api/request';

/** 部门/组织管理接口 */
export namespace SystemDeptApi {
  /** 部门实体 */
  export interface Dept {
    [key: string]: any;
    /** 部门ID */
    id?: number;
    /** 父部门ID */
    parentId: number;
    /** 部门名称 */
    deptName: string;
    /** 排序 */
    sort: number;
    /** 负责人 */
    leader?: string;
    /** 联系电话 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 状态 0停用 1启用 */
    status: number;
    /** 子部门 */
    children?: Dept[];
  }
}

/** 获取部门树 */
export function getDeptTree() {
  return requestClient.get<SystemDeptApi.Dept[]>('/system/dept/tree');
}

/** 获取部门列表(扁平) */
export function getDeptList() {
  return requestClient.get<SystemDeptApi.Dept[]>('/system/dept/list');
}

/** 获取部门详情 */
export function getDeptById(id: number) {
  return requestClient.get<SystemDeptApi.Dept>(`/system/dept/detail/${id}`);
}

/** 新增部门 */
export function createDept(data: Omit<SystemDeptApi.Dept, 'children' | 'id'>) {
  return requestClient.post('/system/dept', data);
}

/** 修改部门 */
export function updateDept(data: SystemDeptApi.Dept) {
  return requestClient.post('/system/dept/edit', data);
}

/** 删除部门 */
export function deleteDept(id: number) {
  return requestClient.post(`/system/dept/remove/${id}`);
}

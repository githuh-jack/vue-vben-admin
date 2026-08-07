import { requestClient } from '#/api/request';

/** 角色管理接口 */
export namespace SystemRoleApi {
  /** 数据权限范围 1全部 2自定义 3本部门 4本部门及以下 5仅本人 */
  export type DataScope = 1 | 2 | 3 | 4 | 5;

  /** 角色实体 */
  export interface Role {
    [key: string]: any;
    id?: number;
    /** 角色名称 */
    roleName: string;
    /** 角色标识 */
    roleKey: string;
    /** 排序 */
    sort: number;
    /** 状态 0停用 1启用 */
    status: number;
    /** 数据权限范围 */
    dataScope?: DataScope;
    /** 备注 */
    remark?: string;
    /** 关联部门ID列表 */
    deptIds?: number[];
  }
}

/** 分页查询角色列表 */
export function getRoleList(params: { page: number; limit: number; roleName?: string; status?: number }) {
  return requestClient.get('/system/role/list', { params });
}

/** 获取用户角色列表 */
export function getUserRoles(userId: number) {
  return requestClient.get<SystemRoleApi.Role[]>(`/system/role/user/${userId}`);
}

/** 获取角色详情(含部门ID列表) */
export function getRoleById(id: number) {
  return requestClient.get<SystemRoleApi.Role>(`/system/role/detail/${id}`);
}

/** 新增角色 */
export function createRole(data: Omit<SystemRoleApi.Role, 'id'>) {
  return requestClient.post('/system/role', data);
}

/** 修改角色 */
export function updateRole(data: SystemRoleApi.Role) {
  return requestClient.post('/system/role/edit', data);
}

/** 删除角色 */
export function deleteRole(id: number) {
  return requestClient.post(`/system/role/remove/${id}`);
}

/** 给角色分配资源 */
export function assignRoleResources(roleId: number, resourceIds: number[]) {
  return requestClient.post('/system/role/assignResources', { roleId, resourceIds });
}

/** 给用户分配角色 */
export function assignUserRoles(userId: number, roleIds: number[]) {
  return requestClient.post('/system/role/assignRoles', { userId, roleIds });
}

/** 给角色分配数据权限(部门) */
export function assignRoleDataScope(roleId: number, dataScope: number, deptIds: number[]) {
  return requestClient.post('/system/role/assignDataScope', { roleId, dataScope, deptIds });
}

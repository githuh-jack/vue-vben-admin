import { requestClient } from '#/api/request';

/** 资源管理接口 */
export namespace SystemResourceApi {
  /** 资源类型: M菜单 A接口 F按钮 */
  export type ResourceType = 'A' | 'F' | 'M';

  /** 资源实体 */
  export interface Resource {
    [key: string]: any;
    id?: number;
    /** 资源名称 */
    resourceName: string;
    /** 父资源ID */
    parentId: number;
    /** 排序 */
    sort: number;
    /** 路由路径 */
    path?: string;
    /** 组件路径 */
    component?: string;
    /** 资源类型 M菜单 A接口 F按钮 */
    resourceType: ResourceType;
    /** 权限标识 */
    perms?: string;
    /** 图标 */
    icon?: string;
    /** 状态 0停用 1启用 */
    status: number;
    /** 子资源 */
    children?: Resource[];
  }
}

/** 获取资源树 */
export function getResourceTree() {
  return requestClient.get<SystemResourceApi.Resource[]>('/system/resource/tree');
}

/** 获取当前用户资源 */
export function getUserResources() {
  return requestClient.get<SystemResourceApi.Resource[]>('/system/resource/user');
}

/** 根据角色ID获取资源 */
export function getResourcesByRoleId(roleId: number) {
  return requestClient.get<SystemResourceApi.Resource[]>(`/system/resource/role/${roleId}`);
}

/** 获取资源详情 */
export function getResourceById(id: number) {
  return requestClient.get<SystemResourceApi.Resource>(`/system/resource/detail/${id}`);
}

/** 新增资源 */
export function createResource(data: Omit<SystemResourceApi.Resource, 'children' | 'id'>) {
  return requestClient.post('/system/resource', data);
}

/** 修改资源 */
export function updateResource(data: SystemResourceApi.Resource) {
  return requestClient.post('/system/resource/edit', data);
}

/** 删除资源 */
export function deleteResource(id: number) {
  return requestClient.post(`/system/resource/remove/${id}`);
}

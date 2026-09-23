import { requestClient } from '#/api/request';

/** 应用管理接口 */
export namespace SystemAppApi {
  /** 应用实体 */
  export interface App {
    [key: string]: any;
    id?: number;
    /** 应用名称 */
    appName: string;
    /** 应用编码 */
    appCode: string;
    /** 应用描述 */
    description?: string;
    /** 是否准许注册 0否 1是 */
    allowRegister?: number;
    /** 关联根部门ID */
    deptId?: number;
    /** 部门名称 */
    deptName?: string;
    /** 关联菜单根节点ID */
    menuId?: number;
    /** 应用相关表初始化DDL语句(分号分隔) */
    initSql?: string;
    /** 相关表是否已初始化 0否 1是 */
    tablesInitialized?: number;
    /** 状态 0停用 1启用 */
    status: number;
    /** 创建时间 */
    sys001?: string;
  }
}

/** 分页查询应用列表 */
export function getAppList(params: {
  limit: number;
  page: number;
  appName?: string;
  status?: number;
}) {
  return requestClient.get('/system/app/list', { params });
}

/** 新增应用(自动创建同名根部门) */
export function createApp(data: Omit<SystemAppApi.App, 'id'>) {
  return requestClient.post('/system/app', data);
}

/** 修改应用 */
export function updateApp(data: SystemAppApi.App) {
  return requestClient.post('/system/app/edit', data);
}

/** 删除应用 */
export function deleteApp(id: number) {
  return requestClient.post(`/system/app/remove/${id}`);
}

/** 初始化应用相关表(执行应用存储的DDL语句) */
export function initAppTables(id: number) {
  return requestClient.post(`/system/app/initTables/${id}`);
}

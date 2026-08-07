import { requestClient } from '#/api/request';

/** 菜单管理接口 */
export namespace SystemMenuApi {
  /** 菜单实体 */
  export interface Menu {
    [key: string]: any;
    id?: number;
    /** 父菜单ID */
    parentId: number;
    /** 路由name(唯一) */
    menuName: string;
    /** 菜单标题(i18n key) */
    title: string;
    /** 图标 */
    icon?: string;
    /** 路由路径 */
    path: string;
    /** 组件路径(BasicLayout/IFrameView/具体路径) */
    component?: string;
    /** 排序 */
    sort: number;
    /** 是否固定tab 0否1是 */
    affixTab?: number;
    /** 是否缓存 0否1是 */
    keepAlive?: number;
    /** 徽标类型 */
    badgeType?: string;
    /** 外链URL */
    link?: string;
    /** 状态 0停用 1启用 */
    status: number;
    /** 子菜单 */
    children?: Menu[];
  }
}

/** 分页查询菜单列表 */
export function getMenuList(params: { page: number; limit: number; menuName?: string; status?: number }) {
  return requestClient.get('/system/menu/list', { params });
}

/** 获取菜单树(含停用) */
export function getMenuTree() {
  return requestClient.get<SystemMenuApi.Menu[]>('/system/menu/tree');
}

/** 获取菜单详情 */
export function getMenuById(id: number) {
  return requestClient.get<SystemMenuApi.Menu>(`/system/menu/detail/${id}`);
}

/** 新增菜单 */
export function createMenu(data: Omit<SystemMenuApi.Menu, 'children' | 'id'>) {
  return requestClient.post('/system/menu', data);
}

/** 修改菜单 */
export function updateMenu(data: SystemMenuApi.Menu) {
  return requestClient.post('/system/menu/edit', data);
}

/** 删除菜单 */
export function deleteMenu(id: number) {
  return requestClient.post(`/system/menu/remove/${id}`);
}

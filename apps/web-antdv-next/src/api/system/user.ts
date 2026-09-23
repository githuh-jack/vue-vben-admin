import { requestClient } from '#/api/request';

/** 用户管理接口 */
export namespace SystemUserApi {
  /** 用户实体 */
  export interface User {
    [key: string]: any;
    id?: number;
    /** 用户名 */
    username: string;
    /** 密码 */
    password?: string;
    /** 昵称(笔名) */
    nickname?: string;
    /** 姓名 */
    realName?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 头像 */
    avatar?: string;
    /** 主部门ID */
    deptId?: number;
    /** 所属部门ID集合(多部门，第一个为主部门) */
    deptIds?: number[];
    /** 部门名称集合展示(逗号分隔) */
    deptNames?: string;
    /** 部门名称 */
    deptName?: string;
    /** 状态 0停用 1启用 */
    status: number;
  }
}

/** 分页查询用户列表 */
export function getUserList(params: { page: number; limit: number; username?: string; status?: number; deptId?: number }) {
  return requestClient.get('/system/user/list', { params });
}

/** 获取用户详情 */
export function getUserById(id: number) {
  return requestClient.get<SystemUserApi.User>(`/system/user/detail/${id}`);
}

/** 新增用户 */
export function createUser(data: Omit<SystemUserApi.User, 'id'>) {
  return requestClient.post('/system/user', data);
}

/** 修改用户 */
export function updateUser(data: SystemUserApi.User) {
  return requestClient.post('/system/user/edit', data);
}

/** 删除用户 */
export function deleteUser(id: number) {
  return requestClient.post(`/system/user/remove/${id}`);
}

/** 修改用户状态 */
export function changeUserStatus(id: number, status: number) {
  return requestClient.post('/system/user/changeStatus', { id, status });
}

/** 重置密码 */
export function resetUserPassword(id: number, password?: string) {
  return requestClient.post('/system/user/resetPassword', { id, password });
}

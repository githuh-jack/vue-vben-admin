import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: number;
    username: string;
    realName: string;
    email: string;
    phone: string;
    avatar: string;
    deptId: number;
    deptName: string;
    status: 0 | 1;
    pwdForceChange: 0 | 1;
    tenantId: number;
    sys001: string;
    sys002: string;
  }
}

/** 查询用户列表 */
async function getUserList(params?: Recordable<any>) {
  return requestClient.get<SystemUserApi.SystemUser[]>('/system/user/list', {
    params,
  });
}

/** 查询用户详情 */
async function getUserDetail(id: number) {
  return requestClient.get<SystemUserApi.SystemUser>(
    `/system/user/detail/${id}`,
  );
}

/** 新增用户 */
async function createUser(data: Recordable<any>) {
  return requestClient.post('/system/user', data);
}

/** 修改用户 */
async function updateUser(data: Recordable<any>) {
  return requestClient.post('/system/user/edit', data);
}

/** 删除用户 */
async function deleteUser(id: number) {
  return requestClient.post(`/system/user/remove/${id}`);
}

/** 重置密码（管理员） */
async function resetPassword(data: { id: number; password?: string }) {
  return requestClient.post('/system/user/resetPassword', data);
}

/** 修改密码（用户自己） */
async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}) {
  return requestClient.post('/system/user/changePassword', data);
}

/** 修改个人信息 */
async function updateProfile(data: Recordable<any>) {
  return requestClient.post('/system/user/profile', data);
}

/** 修改用户状态 */
async function changeUserStatus(data: { id: number; status: 0 | 1 }) {
  return requestClient.post('/system/user/changeStatus', data);
}

export {
  changePassword,
  changeUserStatus,
  createUser,
  deleteUser,
  getUserDetail,
  getUserList,
  resetPassword,
  updateProfile,
  updateUser,
};

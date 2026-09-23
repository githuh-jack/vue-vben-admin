import { requestClient } from '#/api/request';

/** 传信纸船应用管理接口(数据来自 biz_ 前缀表，字段为数据库列名) */

/** 分页查询应用用户 */
export function getPaperBoatUserList(params: {
  limit: number;
  page: number;
  username?: string;
}) {
  return requestClient.get('/system/paperBoat/user/list', { params });
}

/** 分页查询信件 */
export function getPaperBoatLetterList(params: {
  limit: number;
  page: number;
  senderId?: number;
}) {
  return requestClient.get('/system/paperBoat/letter/list', { params });
}

/** 分页查询铜钱流水 */
export function getPaperBoatCoinList(params: {
  limit: number;
  page: number;
  userId?: number;
}) {
  return requestClient.get('/system/paperBoat/coin/list', { params });
}

/** 分页查询奖励记录 */
export function getPaperBoatRewardList(params: {
  limit: number;
  page: number;
  rewardType?: string;
  userId?: number;
}) {
  return requestClient.get('/system/paperBoat/reward/list', { params });
}

/** 分页查询邀请记录 */
export function getPaperBoatInviteList(params: {
  limit: number;
  page: number;
  userId?: number;
}) {
  return requestClient.get('/system/paperBoat/invite/list', { params });
}

/** 分页查询文竹生长记录 */
export function getPaperBoatBambooLogList(params: {
  limit: number;
  page: number;
  userId?: number;
}) {
  return requestClient.get('/system/paperBoat/bambooLog/list', { params });
}

/** 分页查询应用配置 */
export function getPaperBoatConfigList(params: {
  limit: number;
  page: number;
  configKey?: string;
}) {
  return requestClient.get('/system/paperBoat/config/list', { params });
}

/** 保存应用配置(新增或按config_key更新) */
export function savePaperBoatConfig(data: {
  config_key: string;
  config_value: string;
  remark?: string;
}) {
  return requestClient.post('/system/paperBoat/config/save', data);
}

/** 删除应用配置 */
export function removePaperBoatConfig(id: number) {
  return requestClient.post(`/system/paperBoat/config/remove/${id}`);
}

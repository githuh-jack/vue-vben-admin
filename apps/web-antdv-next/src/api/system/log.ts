import { requestClient } from '#/api/request';

/** 操作日志接口 */
export namespace SystemOperLogApi {
  /** 操作日志实体 */
  export interface OperLog {
    [key: string]: any;
    traceId: string;
    /** 用户ID */
    userId: number;
    /** 用户名 */
    userName: string;
    /** 操作名称 */
    operationName: string;
    /** 操作类型 */
    operationType: string;
    /** 请求方法 */
    requestMethod: string;
    /** 请求URL */
    requestUrl: string;
    /** 请求IP */
    requestIp: string;
    /** 请求参数 */
    requestParam: string;
    /** 响应数据 */
    responseData: string;
    /** 耗时(ms) */
    costTime: number;
    /** 状态码 20000成功 50000失败 */
    code: number;
    /** 消息 */
    message: string;
    /** 会话ID */
    sessionId: string;
    /** 开始时间 */
    startTime: string;
    /** 结束时间 */
    endTime: string;
  }
}

/** 登录日志接口 */
export namespace SystemLoginLogApi {
  /** 登录日志实体 */
  export interface LoginLog {
    [key: string]: any;
    traceId: string;
    /** 用户ID */
    userId: number;
    /** 用户名 */
    userName: string;
    /** 登录名 */
    loginName: string;
    /** 登录IP */
    loginIp: string;
    /** 登录地点 */
    loginLocation: string;
    /** 登录类型 login/logout */
    loginType: string;
    /** token */
    token: string;
    /** 会话ID */
    sessionId: string;
    /** 状态码 20000成功 50000失败 */
    code: number;
    /** 消息 */
    message: string;
    /** 登录时间 */
    loginTime: string;
  }
}

/** 分页查询操作日志 */
export function getOperLogList(params: { page: number; limit: number; userName?: string; code?: number }) {
  return requestClient.get('/system/operLog/list', { params });
}

/** 分页查询登录日志 */
export function getLoginLogList(params: { page: number; limit: number; userName?: string; code?: number }) {
  return requestClient.get('/system/loginLog/list', { params });
}

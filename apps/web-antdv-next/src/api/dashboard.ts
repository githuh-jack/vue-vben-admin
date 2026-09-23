import { requestClient } from '#/api/request';

/** 分析页统计接口 */
export namespace DashboardApi {
  /** 概览卡片数据 */
  export interface Overview {
    /** 邀请注册数 */
    inviteTotal: number;
    /** 今日登录次数 */
    loginToday: number;
    /** 登录总量 */
    loginTotal: number;
    /** 今日操作次数 */
    opToday: number;
    /** 操作总量 */
    opTotal: number;
    /** 今日新增用户 */
    userToday: number;
    /** 用户总量 */
    userTotal: number;
  }

  /** 分析页统计数据 */
  export interface AnalyticsData {
    /** 登录结果分布 */
    loginPie: { name: string; value: number }[];
    /** 近12月注册 */
    months: { labels: string[]; registers: number[] };
    /** 操作类型分布 */
    opRose: { name: string; value: number }[];
    /** 概览卡片 */
    overview: Overview;
    /** 系统资源雷达 */
    radar: { indicators: string[]; values: number[] };
    /** 近7天注册/登录趋势 */
    trends: { dates: string[]; logins: number[]; registers: number[] };
  }
}

/** 获取分析页统计数据 */
export async function getAnalyticsApi() {
  return requestClient.get<DashboardApi.AnalyticsData>(
    '/system/dashboard/analytics',
  );
}

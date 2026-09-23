<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import type { DashboardApi } from '#/api/dashboard';

import { computed, onMounted, reactive } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { getAnalyticsApi } from '#/api/dashboard';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

// 后端统计数据，保持原分析页布局，仅数据源改为接口查询
const analytics = reactive<DashboardApi.AnalyticsData>({
  loginPie: [],
  months: { labels: [], registers: [] },
  opRose: [],
  overview: {
    inviteTotal: 0,
    loginToday: 0,
    loginTotal: 0,
    opToday: 0,
    opTotal: 0,
    userToday: 0,
    userTotal: 0,
  },
  radar: { indicators: [], values: [] },
  trends: { dates: [], logins: [], registers: [] },
});

const overviewItems = computed<AnalysisOverviewItem[]>(() => [
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: analytics.overview.userTotal,
    value: analytics.overview.userToday,
  },
  {
    icon: SvgCakeIcon,
    title: '登录量',
    totalTitle: '总登录量',
    totalValue: analytics.overview.loginTotal,
    value: analytics.overview.loginToday,
  },
  {
    icon: SvgDownloadIcon,
    title: '操作量',
    totalTitle: '总操作量',
    totalValue: analytics.overview.opTotal,
    value: analytics.overview.opToday,
  },
  {
    icon: SvgBellIcon,
    title: '邀请注册',
    totalTitle: '邀请注册总数',
    totalValue: analytics.overview.inviteTotal,
    value: analytics.overview.inviteTotal,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '近7天趋势',
    value: 'trends',
  },
  {
    label: '月注册量',
    value: 'visits',
  },
];

onMounted(async () => {
  try {
    const data = await getAnalyticsApi();
    if (data) {
      Object.assign(analytics, data);
    }
  } catch {
    // 错误提示由请求拦截器统一处理
  }
});
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends
          :dates="analytics.trends.dates"
          :logins="analytics.trends.logins"
          :registers="analytics.trends.registers"
        />
      </template>
      <template #visits>
        <AnalyticsVisits
          :labels="analytics.months.labels"
          :values="analytics.months.registers"
        />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="资源概览">
        <AnalyticsVisitsData
          :indicators="analytics.radar.indicators"
          :values="analytics.radar.values"
        />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="登录结果">
        <AnalyticsVisitsSource :data="analytics.loginPie" />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="操作分布">
        <AnalyticsVisitsSales :data="analytics.opRose" />
      </AnalysisChartCard>
    </div>
  </div>
</template>

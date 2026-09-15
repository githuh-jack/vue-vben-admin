import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:book-open',
      order: 200,
      title: '业务管理',
    },
    name: 'Biz',
    path: '/biz',
    children: [
      {
        name: 'BizLetter',
        path: '/biz/letter',
        component: () => import('#/views/biz/letter/index.vue'),
        meta: {
          icon: 'lucide:mail',
          title: '信件管理',
        },
      },
      {
        name: 'BizFriend',
        path: '/biz/friend',
        component: () => import('#/views/biz/friend/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: '好友关系',
        },
      },
      {
        name: 'BizDiary',
        path: '/biz/diary',
        component: () => import('#/views/biz/diary/index.vue'),
        meta: {
          icon: 'lucide:notebook-pen',
          title: '日记管理',
        },
      },
      {
        name: 'BizThought',
        path: '/biz/thought',
        component: () => import('#/views/biz/thought/index.vue'),
        meta: {
          icon: 'lucide:lightbulb',
          title: '感想管理',
        },
      },
      {
        name: 'BizNote',
        path: '/biz/note',
        component: () => import('#/views/biz/note/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '笔记管理',
        },
      },
      {
        name: 'BizStamp',
        path: '/biz/stamp',
        component: () => import('#/views/biz/stamp/index.vue'),
        meta: {
          icon: 'lucide:stamp',
          title: '邮票管理',
        },
      },
      {
        name: 'BizEnvelope',
        path: '/biz/envelope',
        component: () => import('#/views/biz/envelope/index.vue'),
        meta: {
          icon: 'lucide:mail',
          title: '信封管理',
        },
      },
      {
        name: 'BizCoin',
        path: '/biz/coin',
        component: () => import('#/views/biz/coin/index.vue'),
        meta: {
          icon: 'lucide:coins',
          title: '铜钱管理',
        },
      },
      {
        name: 'BizOrder',
        path: '/biz/order',
        component: () => import('#/views/biz/order/index.vue'),
        meta: {
          icon: 'lucide:shopping-cart',
          title: '订单管理',
        },
      },
    ],
  },
];

export default routes;

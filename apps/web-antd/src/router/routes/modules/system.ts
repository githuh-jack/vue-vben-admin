import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      title: 'system.title',
      order: 9997,
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/list.vue'),
        meta: {
          icon: 'lucide:user',
          title: 'system.user.title',
        },
      },
      {
        name: 'SystemDept',
        path: '/system/dept',
        component: () => import('#/views/system/dept/list.vue'),
        meta: {
          icon: 'lucide:building',
          title: 'system.dept.title',
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/list.vue'),
        meta: {
          icon: 'lucide:shield',
          title: 'system.role.title',
        },
      },
      {
        name: 'SystemResource',
        path: '/system/resource',
        component: () => import('#/views/system/resource/list.vue'),
        meta: {
          icon: 'lucide:menu',
          title: 'system.resource.title',
        },
      },
    ],
  },
];

export default routes;

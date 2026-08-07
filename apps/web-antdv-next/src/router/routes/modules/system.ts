import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 100,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemDept',
        path: '/system/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          icon: 'lucide:git-branch',
          title: $t('page.system.dept'),
        },
      },
      {
        name: 'SystemDict',
        path: '/system/dict',
        component: () => import('#/views/system/dict/index.vue'),
        meta: {
          icon: 'lucide:book-marked',
          title: $t('page.system.dict'),
        },
      },
      {
        name: 'SystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          icon: 'lucide:menu',
          title: $t('page.system.menu'),
        },
      },
      {
        name: 'SystemResource',
        path: '/system/resource',
        component: () => import('#/views/system/resource/index.vue'),
        meta: {
          icon: 'lucide:layout-grid',
          title: $t('page.system.resource'),
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: $t('page.system.role'),
        },
      },
      {
        name: 'SystemPermission',
        path: '/system/permission',
        component: () => import('#/views/system/permission/index.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: $t('page.system.permission'),
        },
      },
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: $t('page.system.user'),
        },
      },
      {
        name: 'SystemUserRole',
        path: '/system/user-role',
        component: () => import('#/views/system/user-role/index.vue'),
        meta: {
          icon: 'lucide:user-cog',
          title: $t('page.system.userRole'),
        },
      },
      {
        name: 'SystemRoleDept',
        path: '/system/role-dept',
        component: () => import('#/views/system/role-dept/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('page.system.roleDept'),
        },
      },
      {
        name: 'SystemRoleResource',
        path: '/system/role-resource',
        component: () => import('#/views/system/role-resource/index.vue'),
        meta: {
          icon: 'lucide:link',
          title: $t('page.system.roleResource'),
        },
      },
      {
        name: 'SystemOperLog',
        path: '/system/oper-log',
        component: () => import('#/views/system/oper-log/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.system.operLog'),
        },
      },
      {
        name: 'SystemLoginLog',
        path: '/system/login-log',
        component: () => import('#/views/system/login-log/index.vue'),
        meta: {
          icon: 'lucide:log-in',
          title: $t('page.system.loginLog'),
        },
      },
    ],
  },
];

export default routes;

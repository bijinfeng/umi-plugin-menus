import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['@umijs/plugin-model', '../lib'],

  routes: [
    {
      path: '/dashboard',
      component: '@/pages/dashboard',
      menu: {
        name: '监控页',
        icon: 'dashboard',
        hideChildMenu: false,
      },
      flatMenu: false,
    },
    {
      path: '/404',
      component: '@/pages/404',
    },
    {
      path: '/',
      component: '@/pages/index',
      menu: {
        name: '首页',
        icon: 'home',
      },
      flatMenu: true,
      routes: [
        {
          path: '/link',
          component: '@/pages/link',
          menu: {
            name: '链接',
            icon: 'link',
            hideChildMenu: true,
          },
          routes: [
            {
              path: '/link/demo',
              component: '@/pages/link/demo',
            },
          ],
        },
      ],
    },
  ],
});

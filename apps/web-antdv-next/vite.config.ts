import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // 后端auth单体服务地址（不使用网关）
            target: 'http://localhost:9200',
            ws: true,
          },
        },
      },
    },
  };
});

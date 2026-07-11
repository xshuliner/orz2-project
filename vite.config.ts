import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  base: mode === 'uat' ? '/uat/' : '/',
  // qrcode 插件会在 dev server 启动时,把局域网 URL 转成二维码打印到终端,
  // 配合 `vite --host 0.0.0.0`,同网段手机扫码即可真机预览。
  plugins: [react(), tailwindcss(), qrcode()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            /node_modules\/(react|react-dom|scheduler|react-router|@remix-run|react-helmet-async)\//.test(
              id
            )
          ) {
            return 'vendor-react';
          }

          if (id.includes('/node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
}));

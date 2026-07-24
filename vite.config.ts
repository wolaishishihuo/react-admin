import { resolve } from 'path';
import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite';
import { wrapperEnv } from './build/getEnv';
import { createVitePlugins } from './build/plugins';
import { createProxy } from './build/proxy';

// @see: https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);

  return {
    base: viteEnv.VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    legacy: {
      inconsistentCjsInterop: true
    },
    server: {
      host: '0.0.0.0',
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    plugins: createVitePlugins(viteEnv),
    build: {
      outDir: 'dist',
      sourcemap: false,
      // 禁用 gzip 压缩体积报告，可略微缩短打包时间
      reportCompressedSize: false,
      // 触发体积警告的 chunk 大小阈值
      chunkSizeWarningLimit: 2000,
      rolldownOptions: {
        output: {
          // Vite 8 默认 Oxc 压缩；由 VITE_DROP_CONSOLE 控制是否移除 console.*
          ...(viteEnv.VITE_DROP_CONSOLE && {
            minify: { compress: { dropConsole: true } }
          }),
          // 静态资源分类与打包
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  };
});

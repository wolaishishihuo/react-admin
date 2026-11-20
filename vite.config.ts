import { resolve } from 'path';

import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite';

import { wrapperEnv } from './build/getEnv.ts';
import { createVitePlugins } from './build/plugins.ts';
import { createProxy } from './build/proxy.ts';

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
        '@': resolve(import.meta.dirname, './src')
      }
    },
    css: {
      transformer: 'lightningcss'
    },
    server: {
      host: '0.0.0.0',
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      // Load proxy configuration from .env.development
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    plugins: createVitePlugins(viteEnv),
    build: {
      outDir: 'dist',
      // Vite 8 default minifier; `esbuild` requires a separate esbuild install
      minify: 'oxc',
      sourcemap: false,
      // Disable gzip compressed size reporting, which slightly reduces pack time
      reportCompressedSize: false,
      // Determine the chunk size that triggers the warning
      chunkSizeWarningLimit: 2000,
      rolldownOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          codeSplitting: {
            // 仅拆出高频稳定基础包，保留 Rolldown 对 antd/pro-components 各懒加载页面的自动按需拆分
            includeDependenciesRecursively: false,
            groups: [
              // 离线完整 Remix Icon 集（~1 MB）长期不变，独立分包避免业务发布使其缓存失效
              { name: 'vendor-icons', test: /node_modules[\\/](@iconify-json|@iconify)[\\/]/, priority: 30 },
              // 图表引擎保持按图表页懒加载，独立长期缓存
              { name: 'vendor-echarts', test: /node_modules[\\/](echarts|zrender)[\\/]/, priority: 25 },
              // React / Router 运行时内核（严格匹配包边界，不吞入 react-countup 等页面按需库）
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
                priority: 20
              }
            ]
          }
        }
      }
    }
  };
});

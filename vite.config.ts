import { readFileSync } from "node:fs";

import dayjs from "dayjs";
import { resolve } from "path";
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";

import { wrapperEnv } from "./build/getEnv.ts";
import { createVitePlugins } from "./build/plugins.ts";
import { createProxy } from "./build/proxy.ts";

const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, "package.json"), "utf-8")) as {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};

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
        "@": resolve(import.meta.dirname, "./src")
      }
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    server: {
      host: "0.0.0.0",
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      // Load proxy configuration from .env.development
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    plugins: createVitePlugins(viteEnv),
    build: {
      outDir: "dist",
      // Vite 8 default minifier; `esbuild` requires a separate esbuild install
      minify: "oxc",
      sourcemap: false,
      // Disable gzip compressed size reporting, which slightly reduces pack time
      reportCompressedSize: false,
      // Determine the chunk size that triggers the warning
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
});

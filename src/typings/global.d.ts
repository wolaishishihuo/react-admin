/* Vite */
declare interface ViteEnv {
  VITE_GLOB_APP_TITLE: string;
  VITE_STORAGE_PREFIX: string;
  VITE_PORT: number;
  VITE_OPEN: boolean;
  VITE_REPORT: boolean;
  VITE_ROUTER_MODE: 'hash' | 'history';
  VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'gzip,brotli' | 'none';
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean;
  VITE_PUBLIC_PATH: string;
  VITE_API_URL: string;
  VITE_APP_ENABLE_REFRESH_TOKEN: string;
  VITE_PROXY: [string, string][];
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}

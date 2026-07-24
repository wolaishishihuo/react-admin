import type { ProxyOptions } from 'vite';

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyTargetList = Record<string, ProxyOptions>;

/**
 * 解析 .env.development 中的代理配置并创建代理
 * @param list
 */
export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const httpsRE = /^https:\/\//;
    const isHttps = httpsRE.test(target);

    // https://github.com/http-party/node-http-proxy#options
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), ''),
      // 本地联调锁定基地 902：dev 直连裸后端无网关注入租户，缺省会回落集团 000
      // headers: { 'x-spec-tenant': '902' },
      // HTTPS 目标需设置 secure=false
      ...(isHttps ? { secure: false } : {})
    };
  }
  return ret;
}

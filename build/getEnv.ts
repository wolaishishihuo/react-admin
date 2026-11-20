/** 将 Vite loadEnv 读取的字符串映射解析为带类型的 ViteEnv */
export function wrapperEnv(envConf: Record<string, string>): ViteEnv {
  const ret: Record<string, unknown> = {};

  for (const envName of Object.keys(envConf)) {
    let realValue: unknown = envConf[envName].replace(/\\n/g, '\n');
    if (realValue === 'true') realValue = true;
    else if (realValue === 'false') realValue = false;

    if (envName === 'VITE_PORT') realValue = Number(realValue);
    if (envName === 'VITE_PROXY' && typeof realValue === 'string') {
      try {
        realValue = JSON.parse(realValue);
      } catch (error) {
        console.error(error);
      }
    }
    ret[envName] = realValue;
  }

  return ret as unknown as ViteEnv;
}

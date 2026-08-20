/**
 * 会话生命周期：建立（initPermissions）与清除（clearAuth）的唯一入口
 *
 * 不进 utils barrel（避免与 stores 形成循环），按 @/utils/auth 直接引用。
 */
import { getAuthMenuListApi, getUserInfoApi, logoutApi } from '@/api/modules/login';
import { notification } from '@/hooks/useMessage';
import { setToken, setUserInfo, setAuthMenuList, validateTabs } from '@/stores';
import { cancelAllRequest } from './http/cancel';
import { queryClient } from './queryClient';

/** 清空会话：取消在途请求 → 作废服务端会话 → 清本地态；跳转由 RouterGuard 随 token 变化自行完成 */
export async function clearAuth() {
  cancelAllRequest();

  // 后端作废会话要带 token，必须在清本地之前
  try {
    await logoutApi();
  } catch {
    // 服务端失败静默，客户端登出始终生效
  }

  queryClient.clear();
  setToken('');
  setUserInfo({ name: '' });
  setAuthMenuList([]);
  // 标签留着，由登录时的用户切换判定决定去留
}

/** 会话校验 → 用户信息 → 菜单/按钮权限入 store */
async function loadPermissions(token: string) {
  // 冷启动会话校验：由后端回答"我是谁"，userInfo 也在此刷新（登录态下的唯一写入点）
  // 请求失败（网络/服务端故障）向上抛，交 MenuLoadError 重试；只有明确取不到用户才算会话失效
  const userInfo = await getUserInfoApi(token);
  if (!userInfo) {
    await clearAuth();
    return Promise.reject('Session expired');
  }
  setUserInfo(userInfo);

  // 拉取菜单入 auth store；失败不清 token，交给 MenuLoadError 兜底
  const menuList = await getAuthMenuListApi();
  setAuthMenuList(menuList);

  // 有会话但无菜单权限：清会话回登录
  if (!menuList.length) {
    notification.warning({
      title: '无权限访问',
      description: '当前账号无任何菜单权限，请联系系统管理员！'
    });
    await clearAuth();
    return Promise.reject('No permission');
  }

  // 清理悬空标签（换账号/菜单变更后）
  validateTabs();
}

/** 防重入：登录时 LoginForm 与 RouterProvider 的 effect 会各发起一次，二者共用同一次初始化 */
let initInFlight: Promise<void> | null = null;

/** 建立会话：校验登录态并把用户信息、菜单、按钮权限装载到 store */
export function initPermissions(token: string) {
  if (!token) return Promise.resolve();

  initInFlight ??= loadPermissions(token).finally(() => {
    initInFlight = null;
  });

  return initInFlight;
}

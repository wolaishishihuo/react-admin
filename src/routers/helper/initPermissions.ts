import { fetchGetAuthMenuList } from '@/apis/modules/login';
import { fetchGetCurrentUser } from '@/apis/modules/user';
import { notification } from '@/hooks/useMessage';
import { useAuthStore, useUserStore } from '@/stores';

/** 合并同 token 的并发初始化（如登录页提交与 RouterProvider effect 同时触发） */
let inFlight: { token: string; promise: Promise<void> } | null = null;

function resetAuthState() {
  const { setToken, setRefreshToken, setUserInfo } = useUserStore.getState();
  const { setAuthMenuList, setAuthButtons } = useAuthStore.getState();
  setUserInfo({ name: '' });
  setAuthButtons([]);
  setAuthMenuList([]);
  setToken('');
  setRefreshToken('');
}

/** 启动期并行拉取当前用户与授权菜单，写入 authStore / userStore */
export function initPermissions(token: string): Promise<void> {
  if (!token) return Promise.resolve();
  if (inFlight?.token === token) return inFlight.promise;

  const promise = (async () => {
    try {
      const [currentUser, menuList] = await Promise.all([fetchGetCurrentUser(), fetchGetAuthMenuList()]);
      // 请求在途期间若已退出或切换账号，丢弃过期结果，不污染新会话
      if (useUserStore.getState().token !== token) return;

      if (!menuList.length) {
        notification.warning({
          title: '无权限访问',
          description: '当前账号无任何菜单权限，请联系系统管理员！'
        });
        resetAuthState();
        return Promise.reject(new Error('No permission'));
      }

      useUserStore.getState().setUserInfo({ name: currentUser.name ?? '' });
      useAuthStore.getState().setAuthButtons(currentUser.buttons ?? []);
      useAuthStore.getState().setAuthMenuList(menuList);
    } catch (error) {
      // 仅在仍属于同一会话时清理，避免旧会话失败把新账号 token 清空
      if (useUserStore.getState().token === token) {
        resetAuthState();
      }
      return Promise.reject(error);
    } finally {
      if (inFlight?.token === token) inFlight = null;
    }
  })();

  inFlight = { token, promise };
  return promise;
}

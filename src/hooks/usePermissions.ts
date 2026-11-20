import { fetchGetAuthMenuList } from '@/apis/modules/login';
import { fetchGetCurrentUser } from '@/apis/modules/user';
import { notification } from '@/hooks/useMessage';
import { useAuthStore, useUserStore } from '@/stores';

let inFlight: { token: string; promise: Promise<void> } | null = null;

function initPermissions(token: string) {
  if (!token) return Promise.resolve();
  if (inFlight?.token === token) return inFlight.promise;

  const { setToken, setRefreshToken, setUserInfo } = useUserStore.getState();
  const { setAuthMenuList, setAuthButtons } = useAuthStore.getState();

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
        setUserInfo({ name: '' });
        setAuthButtons([]);
        setAuthMenuList([]);
        setToken('');
        setRefreshToken('');
        return Promise.reject(new Error('No permission'));
      }

      setUserInfo({ name: currentUser.name ?? '' });
      setAuthButtons(currentUser.buttons ?? []);
      setAuthMenuList(
        menuList.filter(item => item.meta?.key === 'home' || item.meta?.key === 'system' || item.meta?.key === 'template')
      );
    } catch (error) {
      // 仅在仍属于同一会话时清理，避免旧会话失败把新账号 token 清空
      if (useUserStore.getState().token === token) {
        setUserInfo({ name: '' });
        setAuthButtons([]);
        setAuthMenuList([]);
        setToken('');
        setRefreshToken('');
      }
      return Promise.reject(error);
    } finally {
      if (inFlight?.token === token) inFlight = null;
    }
  })();

  inFlight = { token, promise };
  return promise;
}

/**
 * @description  Use permissions hook
 */
const usePermissions = () => ({ initPermissions });

export default usePermissions;

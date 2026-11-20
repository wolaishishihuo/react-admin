import { fetchGetAuthMenuList } from '@/apis/modules/login';
import { fetchGetCurrentUser } from '@/apis/modules/user';
import { notification } from '@/hooks/useMessage';
import { useAuthStore, useUserStore } from '@/stores';

let inFlight: { token: string; promise: Promise<void> } | null = null;

function initPermissions(token: string) {
  if (!token) return Promise.resolve();
  if (inFlight?.token === token) return inFlight.promise;

  const { setToken, setRefreshToken } = useUserStore.getState();
  const { setAuthMenuList, setAuthButtons } = useAuthStore.getState();

  const promise = (async () => {
    try {
      const [currentUser, menuList] = await Promise.all([fetchGetCurrentUser(), fetchGetAuthMenuList()]);
      setAuthButtons(currentUser.buttons ?? []);

      setAuthMenuList(
        menuList.filter(item => item.meta?.key === 'home' || item.meta?.key === 'system' || item.meta?.key === 'template')
      );

      if (!menuList.length) {
        notification.warning({
          title: '无权限访问',
          description: '当前账号无任何菜单权限，请联系系统管理员！'
        });
        setAuthButtons([]);
        setToken('');
        setRefreshToken('');
        return Promise.reject('No permission');
      }
    } catch (error) {
      setAuthButtons([]);
      setToken('');
      setRefreshToken('');
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

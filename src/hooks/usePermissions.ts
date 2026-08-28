import { getAuthButtonListApi, getAuthMenuListApi } from '@/apis/modules/login';
import { notification } from '@/hooks/useMessage';
import { useAuthStore, useUserStore } from '@/stores';

let inFlight: { token: string; promise: Promise<void> } | null = null;

/**
 * @description  Use permissions hook
 */
const usePermissions = () => {
  const setToken = useUserStore(state => state.setToken);
  const setAuthMenuList = useAuthStore(state => state.setAuthMenuList);
  const setAuthButtonList = useAuthStore(state => state.setAuthButtonList);

  const initPermissions = (token: string) => {
    if (!token) return Promise.resolve();
    if (inFlight?.token === token) return inFlight.promise;

    const promise = (async () => {
      try {
        const { data: buttonList } = await getAuthButtonListApi();
        setAuthButtonList(buttonList);

        const { data: menuList } = await getAuthMenuListApi();
        setAuthMenuList(menuList);

        if (!menuList.length) {
          notification.warning({
            title: '无权限访问',
            description: '当前账号无任何菜单权限，请联系系统管理员！'
          });
          setToken('');
          return Promise.reject('No permission');
        }
      } catch (error) {
        setToken('');
        return Promise.reject(error);
      } finally {
        if (inFlight?.token === token) inFlight = null;
      }
    })();

    inFlight = { token, promise };
    return promise;
  };

  return { initPermissions };
};

export default usePermissions;

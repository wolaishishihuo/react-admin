import { getAuthMenuListApi } from '@/api/modules/login';
import { notification } from '@/hooks/useMessage';
import { setToken, setAuthMenuList, useAuthStore, validateTabs } from '@/stores';

/** 权限初始化 Hook：拉取菜单/按钮权限入 auth store */
const usePermissions = () => {
  const initPermissions = async (token: string) => {
    if (!token) return;

    // 拉取菜单入 auth store；失败不清 token，交给 MenuLoadError 兜底
    const menuList = await getAuthMenuListApi();
    setAuthMenuList(menuList);

    // 有会话但无菜单权限：清 token 回登录
    if (!menuList.length) {
      notification.warning({
        title: '无权限访问',
        description: '当前账号无任何菜单权限，请联系系统管理员！'
      });
      setToken('');
      return Promise.reject('No permission');
    }

    // 清理悬空标签（换账号/菜单变更后）
    const validPaths = useAuthStore
      .getState()
      .flatMenuList.map(item => item.path)
      .filter((path): path is string => !!path);
    validateTabs(validPaths);
  };

  return { initPermissions };
};

export default usePermissions;

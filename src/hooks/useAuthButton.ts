import { useAuthStore } from '@/stores';
import { getMenuByPath } from '@/utils';

/** 按钮权限 Hook：当前页 BUTTONS（由菜单 meta.auths 派生） */
const useAuthButton = () => {
  const authButtonList = useAuthStore(state => state.authButtonList);

  const meta = getMenuByPath()?.meta ?? {};
  const currentPageAuthButton: { [key: string]: boolean } = {};
  authButtonList[meta.key!]?.forEach(item => (currentPageAuthButton[item] = true));

  return { BUTTONS: currentPageAuthButton };
};

export default useAuthButton;

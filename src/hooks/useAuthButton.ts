import { useAuthStore } from '@/stores';
import { getMenuByPath } from '@/utils';

/**
 * @description  Use auth button hook
 */
const useAuthButton = () => {
  const authButtonList = useAuthStore(state => state.authButtonList);

  const meta = getMenuByPath()?.meta ?? {};

  let currentPageAuthButton: { [key: string]: boolean } = {};

  authButtonList[meta.key!]?.forEach(item => (currentPageAuthButton[item] = true));

  return {
    BUTTONS: currentPageAuthButton
  };
};

export default useAuthButton;

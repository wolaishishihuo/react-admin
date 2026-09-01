import { useAuthStore } from '@/stores';

function matchAuthButtons(buttons: string[], code: string | string[]) {
  const codes = typeof code === 'string' ? [code] : code;
  return codes.length > 0 && codes.every(item => buttons.includes(item));
}

/**
 * @description Button permission checks against authStore.authButtons
 */
const useAuthButton = () => {
  const authButtons = useAuthStore(state => state.authButtons);

  function hasPerm(code: string | string[]) {
    return matchAuthButtons(authButtons, code);
  }

  return { hasPerm };
};

export default useAuthButton;

import { useRoute, getMenuSelectPath } from '@/router/use-route';
import { useAuthorizedNavigation } from './menu-model';

export function useAuthButton() {
  const route = useRoute();
  const { permissionMap } = useAuthorizedNavigation();
  const pathname = getMenuSelectPath(route);
  const permissions = permissionMap.get(pathname) ?? [];
  const BUTTONS: Record<string, boolean> = {};
  for (const item of permissions) BUTTONS[item] = true;
  return { BUTTONS };
}

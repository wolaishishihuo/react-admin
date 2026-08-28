/** 当前页按钮码：`const { BUTTONS } = useAuthButton()`。 */
import { useRoute } from '@/router/use-route';
import { useAuthorizedNavigation, useMenuSelectPath } from './menu-model';

export function useAuthButton() {
  const route = useRoute();
  const { permissionMap } = useAuthorizedNavigation();
  const pathname = useMenuSelectPath();
  const permissions = permissionMap.get(pathname) ?? permissionMap.get(route.originPath) ?? [];
  const BUTTONS: Record<string, boolean> = {};
  for (const item of permissions) BUTTONS[item] = true;
  return { BUTTONS };
}

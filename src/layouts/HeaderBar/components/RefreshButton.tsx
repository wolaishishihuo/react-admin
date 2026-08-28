import { getTabId } from '@/stores/modules/tab-identity';
import { bumpContentRevision } from '@/stores/modules/tabs.store';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { useRoute } from '@/router/use-route';
import IconButton from './IconButton';

export default function RefreshButton() {
  const route = useRoute();
  const { pathMap } = useAuthorizedNavigation();
  const multi = Boolean(pathMap.get(route.originPath)?.multi ?? route.staticData.tab?.multi);

  return (
    <IconButton
      icon='ri:refresh-line'
      className='refresh-btn lt-sm:!hidden'
      onClick={() => bumpContentRevision(getTabId(route.originPath, multi, route.fullPath))}
    />
  );
}

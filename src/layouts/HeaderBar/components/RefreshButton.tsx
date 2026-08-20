import { getTabId } from '@/stores/modules/tab-identity';
import { bumpContentRevision } from '@/stores/modules/tabs.store';
import { useRoute } from '@/router/use-route';
import IconButton from './IconButton';

export default function RefreshButton() {
  const route = useRoute();

  return (
    <IconButton
      icon='ri:refresh-line'
      className='refresh-btn lt-sm:!hidden'
      onClick={() => bumpContentRevision(getTabId(route.originPath, Boolean(route.staticData.tab?.multi), route.fullPath))}
    />
  );
}

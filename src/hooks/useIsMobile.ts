import { useSyncExternalStore } from 'react';

const MOBILE_QUERY = '(max-width: 800px)';

const subscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
};

/** 是否移动端视口（≤800px），驱动移动端侧栏 overlay 的 JS 侧行为 */
const useIsMobile = () => useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches);

export default useIsMobile;

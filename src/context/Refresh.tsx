import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react';

import { queryClient } from '@/apis/query';

interface RefreshContextType {
  outletShow: boolean;
  refreshNonce: number;
  refresh: () => void;
}

interface RefreshProviderProps {
  /** 需要订阅页面刷新上下文的子树 */
  children: ReactNode;
}

export const RefreshContext = createContext<RefreshContextType>({
  outletShow: true,
  refreshNonce: 0,
  refresh: () => {}
});

export const RefreshProvider = (props: RefreshProviderProps) => {
  const { children } = props;
  const [outletShow, setOutletShow] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries();
    setRefreshNonce(n => n + 1);
    setOutletShow(false);
    window.setTimeout(() => setOutletShow(true));
  }, []);

  const contextValue = useMemo(
    () => ({
      outletShow,
      refreshNonce,
      refresh
    }),
    [outletShow, refreshNonce, refresh]
  );

  return <RefreshContext.Provider value={contextValue}>{children}</RefreshContext.Provider>;
};

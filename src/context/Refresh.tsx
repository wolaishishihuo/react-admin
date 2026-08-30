import { createContext, useCallback, useMemo, useState } from 'react';

import { queryClient } from '@/apis/query';

interface RefreshContextType {
  outletShow: boolean;
  refreshNonce: number;
  refresh: () => void;
}

export const RefreshContext = createContext<RefreshContextType>({
  outletShow: true,
  refreshNonce: 0,
  refresh: () => {}
});

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

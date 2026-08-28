import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

interface RefreshContextType {
  outletShow: boolean;
  refreshNonce: number;
  refresh: () => void;
}

export const RefreshContext = createContext<RefreshContextType>({
  outletShow: true,
  refreshNonce: 0,
  refresh: () => undefined
});

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [outletShow, setOutletShow] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = useCallback(() => {
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
}

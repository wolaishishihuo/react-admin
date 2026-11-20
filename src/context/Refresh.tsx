import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const queryClient = useQueryClient();
  const [outletShow, setOutletShow] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const refresh = useCallback(() => {
    // Only mark queries stale; avoid firing an active refetch right before unmounting the outlet
    void queryClient.invalidateQueries({ refetchType: 'none' });
    setRefreshNonce(n => n + 1);
    setOutletShow(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOutletShow(true));
  }, [queryClient]);

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

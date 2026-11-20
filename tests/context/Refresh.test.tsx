import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createQueryClient } from '@/apis/query';
import { RefreshContext, RefreshProvider } from '@/context/Refresh';

describe('RefreshProvider', () => {
  it('marks queries stale without triggering a duplicate refetch before remounting the outlet', async () => {
    const queryClient = createQueryClient();
    const fetchStats = vi.fn(async () => ({ count: fetchStats.mock.calls.length }));

    const StatsView = () => {
      const { data } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        staleTime: 60_000
      });
      return <div>count:{data?.count ?? 'loading'}</div>;
    };

    const Shell = () => {
      const { outletShow, refresh } = useContext(RefreshContext);
      return (
        <div>
          <button type='button' onClick={refresh}>
            refresh
          </button>
          {outletShow && <StatsView />}
        </div>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <RefreshProvider>
          <Shell />
        </RefreshProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText('count:1')).toBeInTheDocument();
    expect(fetchStats).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('refresh'));

    await waitFor(() => {
      expect(screen.getByText('count:2')).toBeInTheDocument();
    });
    // Exactly one initial fetch + one remount fetch (no pre-unmount wasted fetch)
    expect(fetchStats).toHaveBeenCalledTimes(2);
  });
});

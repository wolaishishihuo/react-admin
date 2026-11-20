import axios from 'axios';

import { createQueryClient } from './create-client';

function handleError(error: unknown) {
  if (axios.isCancel(error)) return;
  if (import.meta.env.DEV) {
    console.error('Query/Mutation error:', error);
  }
}

export const queryClient = createQueryClient({
  mutationCache: { onError: handleError },
  queryCache: { onError: handleError }
});

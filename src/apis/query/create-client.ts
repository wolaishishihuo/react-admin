import type { DefaultOptions } from "@tanstack/react-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { DEFAULT_MUTATION_CONFIG, DEFAULT_QUERY_CONFIG } from "./defaults";

type MutationCacheConfig = ConstructorParameters<typeof MutationCache>[0];
type QueryCacheConfig = ConstructorParameters<typeof QueryCache>[0];

export interface CreateQueryClientOptions {
  /** Override defaultOptions (shallow-merged with built-in defaults) */
  defaultOptions?: DefaultOptions;
  /** MutationCache config (onError / onSuccess / onSettled / onMutate) */
  mutationCache?: MutationCacheConfig;
  /** QueryCache config (onError / onSuccess / onSettled) */
  queryCache?: QueryCacheConfig;
}

/** Create a QueryClient with project defaults */
export function createQueryClient(options: CreateQueryClientOptions = {}) {
  const { defaultOptions, mutationCache, queryCache } = options;

  return new QueryClient({
    defaultOptions: {
      ...defaultOptions,
      mutations: { ...DEFAULT_MUTATION_CONFIG, ...defaultOptions?.mutations },
      queries: { ...DEFAULT_QUERY_CONFIG, ...defaultOptions?.queries }
    },
    mutationCache: new MutationCache(mutationCache),
    queryCache: new QueryCache(queryCache)
  });
}

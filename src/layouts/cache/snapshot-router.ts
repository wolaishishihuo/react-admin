/**
 * 缓存 pane 使用的只读 router 快照。
 * 全仓库唯一允许读写 router.__store / latestLocation 的文件。
 */
import type { AnyRouter, RouterState } from '@tanstack/react-router';

export type RouterStateSnapshot = RouterState<AnyRouter['routeTree']>;

interface StaticRouterStore {
  get: () => RouterStateSnapshot;
  readonly state: RouterStateSnapshot;
  subscribe: () => { unsubscribe: () => void };
}

interface SnapshotRouterFields {
  __store?: StaticRouterStore;
  latestLocation?: RouterStateSnapshot['location'];
}

function assertSnapshotFields(router: AnyRouter) {
  if (!import.meta.env.DEV) return;
  const fields = router as unknown as SnapshotRouterFields;
  if (!('__store' in fields) || !('latestLocation' in fields)) {
    throw new Error('[snapshot-router] Router 1.162.8 内部字段 __store / latestLocation 不存在，禁止静默降级');
  }
}

function createStaticRouterStore(routeState: RouterStateSnapshot): StaticRouterStore {
  return {
    get state() {
      return routeState;
    },
    get() {
      return routeState;
    },
    subscribe() {
      return {
        unsubscribe() {}
      };
    }
  };
}

export function createSnapshotRouter(router: AnyRouter, routeState: RouterStateSnapshot) {
  assertSnapshotFields(router);
  const liveFields = router as unknown as SnapshotRouterFields;
  const liveStore = liveFields.__store;
  const snapshotRouter = Object.assign(Object.create(Object.getPrototypeOf(router)), router) as AnyRouter;
  const fields = snapshotRouter as unknown as SnapshotRouterFields;
  fields.__store = createStaticRouterStore(routeState);
  fields.latestLocation = routeState.location;
  if (import.meta.env.DEV) {
    if (snapshotRouter === router) throw new Error('[snapshot-router] 克隆结果与 live router 是同一引用');
    if (liveFields.__store !== liveStore) throw new Error('[snapshot-router] 克隆污染了 live router.__store');
    if (fields.__store === liveStore) throw new Error('[snapshot-router] snapshot 与 live 共享 __store');
  }
  return snapshotRouter;
}

import type React from 'react';
import { Suspense } from 'react';
import { PageLoader } from '../Loading';

/** 路由懒加载包装（Suspense + PageLoader 兜底） */
const LazyComponent = (Comp: React.LazyExoticComponent<React.ComponentType>) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Comp />
    </Suspense>
  );
};

export default LazyComponent;

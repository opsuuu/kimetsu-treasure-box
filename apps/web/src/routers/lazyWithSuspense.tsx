import React from 'react';
import { PageLoading } from '@/components';
import type { RouteMeta } from './types';

export function lazyWithSuspense(factory: RouteMeta['component']) {
  const Page = React.lazy(factory);
  return function Wrapped() {
    return (
      <React.Suspense fallback={<PageLoading />}>
        <Page />
      </React.Suspense>
    );
  };
}

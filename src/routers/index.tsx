import { createBrowserRouter, createRoutesFromElements, Outlet, Route, ScrollRestoration } from 'react-router';
import { routeMeta } from './meta';
import React from 'react';
import NotFound from '@/NotFound';
import { PageLoading } from '@/components';

export function lazyWithSuspense<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  const Page = React.lazy<T>(factory);
  const Wrapped: React.FC<React.ComponentProps<T>> = (props) => (
    <React.Suspense fallback={<PageLoading />}>
      <Page {...props} />
    </React.Suspense>
  );
  return Wrapped;
}

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const MainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {
        Object.keys(routeMeta).map((path) => (
          <Route
            key={path}
            path={path}
            element={React.createElement(lazyWithSuspense(routeMeta[path].component))}
          />
        )) as any
      }
      <Route path='*' element={<NotFound />} />
    </Route>,
  ),
);

export default MainRouter;

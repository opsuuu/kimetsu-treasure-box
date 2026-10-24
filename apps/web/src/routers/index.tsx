import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import { routeMeta } from './meta';
import NotFound from '@/NotFound';
import { lazyWithSuspense } from './lazyWithSuspense';
import { RootLayout } from './RootLayout';

const MainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {Object.keys(routeMeta).map((path) => {
        const Page = lazyWithSuspense(routeMeta[path].component);
        return <Route key={path} path={path} element={<Page />} />;
      })}
      <Route path='*' element={<NotFound />} />
    </Route>,
  ),
);

export default MainRouter;

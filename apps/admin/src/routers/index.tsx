import { createBrowserRouter, Navigate } from 'react-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';

const LoginPage = React.lazy(() => import('@/pages/Login'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const ItemsPage = React.lazy(() => import('@/pages/Items'));

function Suspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-gray-400">
          載入中...
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: (
              <Suspense>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/items',
            element: (
              <Suspense>
                <ItemsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;

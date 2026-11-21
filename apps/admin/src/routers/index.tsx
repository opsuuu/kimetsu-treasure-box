import { createBrowserRouter, Navigate } from 'react-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { PageSuspense } from '@/components/PageSuspense';

const LoginPage = React.lazy(() => import('@/pages/Login'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const ItemsPage = React.lazy(() => import('@/pages/Items'));
const ItemNewPage = React.lazy(() => import('@/pages/ItemNew'));
const ItemEditPage = React.lazy(() => import('@/pages/ItemEdit'));
const FrontOrderPage = React.lazy(() => import('@/pages/FrontOrder'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PageSuspense>
        <LoginPage />
      </PageSuspense>
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
              <PageSuspense>
                <DashboardPage />
              </PageSuspense>
            ),
          },
          {
            path: '/items',
            element: (
              <PageSuspense>
                <ItemsPage />
              </PageSuspense>
            ),
          },
          {
            path: '/items/new',
            element: (
              <PageSuspense>
                <ItemNewPage />
              </PageSuspense>
            ),
          },
          {
            path: '/items/:id/edit',
            element: (
              <PageSuspense>
                <ItemEditPage />
              </PageSuspense>
            ),
          },
          {
            path: '/front-order',
            element: (
              <PageSuspense>
                <FrontOrderPage />
              </PageSuspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;

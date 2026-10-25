import { createBrowserRouter, Navigate } from 'react-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { PageSuspense } from '@/components/PageSuspense';

const LoginPage = React.lazy(() => import('@/pages/Login'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const ItemsPage = React.lazy(() => import('@/pages/Items'));
const ItemFormPage = React.lazy(() => import('@/pages/ItemForm'));
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
                <ItemFormPage />
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
          {
            // 編輯頁尚未實作，先退回列表避免落到 404
            path: '/items/:id/edit',
            element: <Navigate to="/items" replace />,
          },
        ],
      },
    ],
  },
]);

export default router;

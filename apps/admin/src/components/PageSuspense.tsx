import React from 'react';

export function PageSuspense({ children }: { children: React.ReactNode }) {
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

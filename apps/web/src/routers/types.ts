import type { ComponentType } from 'react';

export interface RouteMeta {
  title: string;
  icon?: string;
  navLabel: string;
  showInNav: boolean;
  component: () => Promise<{ default: ComponentType }>;
}

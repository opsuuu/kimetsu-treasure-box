import { ROUTES, ROUTE_PATTERNS } from './paths';
import type { RouteMeta } from './types';

export const routeMeta: Record<string, RouteMeta> = {
  [ROUTES.HOME]: {
    title: '首頁',
    icon: '',
    navLabel: 'Home',
    showInNav: true,
    component: () => import('@/Home'),
  },
  [ROUTES.ITEMS]: {
    title: '周邊圖鑑',
    icon: '',
    navLabel: 'Items',
    showInNav: true,
    component: () => import('@/Items'),
  },
  [ROUTE_PATTERNS.ITEM_DETAIL]: {
    title: '商品詳細',
    icon: '',
    navLabel: '',
    showInNav: false,
    component: () => import('@/ItemDetail'),
  },
  // [ROUTES.ITEMS]: {
  //   title: '週邊圖鑑',
  //   icon: '',
  //   navLabel: 'Items',
  //   showInNav: true,
  // },
  // [ROUTES.CHARACTERS]: {
  //   title: '角色',
  //   icon: '',
  //   navLabel: 'Characters',
  //   showInNav: true,
  // },
  // [ROUTES.FAVORITES]: {
  //   title: '收藏',
  //   icon: '',
  //   navLabel: 'Favorites',
  //   showInNav: true,
  // },
  // [ROUTES.ABOUT]: {
  //   title: '關於',
  //   icon: '',
  //   navLabel: 'About',
  //   showInNav: true,
  // },
} as const;

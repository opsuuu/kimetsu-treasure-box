export const ROUTES = {
  HOME: '/',
  // 週邊列表
  ITEMS: '/items',
  ITEMS_BY_CHARACTER: (character: string) => `/items?character=${character}`,
  // 單一商品的詳細頁，內容可能有：商品名稱、商品圖片、發售時間、商品價格、角色分類、商品類別、商品系列、商品金額（日幣）、廠商、同系列商品（相關商品）等等。
  ITEM_DETAIL: (id: string | number) => `/items/${id}`,
  // 角色列表，這頁會列出所有角色，點進去後會看該角色周邊。
  CHARACTERS: '/characters',
  // 角色週邊，這頁會顯示某角色所有週邊，例如：/characters/tomioka-giyu，列表可能是：壓克力立牌、徽章、娃娃、小卡、吊飾、海報等，這頁其實本質就是： /items?character=shinobu，只是做成一個獨立頁面。
  CHARACTER_DETAIL: (id: string) => `/characters/${id}`,
  // 週邊系列，例如： ufotable cafe 第一期、2026 生日系列、2022 星座系列等等
  SERIES: '/series',
  // 某系列週邊，這頁會顯示這個系列所有商品，裡面可能會有壓克力立牌、徽章、小卡
  SERIES_DETAIL: (id: string) => `/series/${id}`,
  // ❤️ 收藏商品清單，這頁顯示我的收藏，儲存在 localStorage
  FAVORITES: '/favorites',
  ABOUT: '/about',
};

// 給 React Router 定義路由
export const ROUTE_PATTERNS = {
  HOME: '/',
  ITEMS: '/items',
  ITEM_DETAIL: '/items/:slug',
  CHARACTERS: '/characters',
  CHARACTER_DETAIL: '/characters/:slug',
  FAVORITES: '/favorites',
  ABOUT: '/about',
};

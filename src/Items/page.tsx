import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router';
import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { WasujiHeading, LoadingState, ErrorState, EmptyState, Header } from '@/components';
import PageFooter from '@/components/PageFooter';
import { useCategories } from '@/hooks';
import {
  fetchFilteredItemIds,
  fetchItemsPage,
  fetchSearchPage,
  PAGE_SIZE,
  type ItemsPage,
  type PageCursor,
} from '@/services/items';
import { ItemCard } from './components/ItemCard';
import { ItemCardSkeleton } from './components/ItemCardSkeleton';

type CharacterFilter = 'all' | 'giyu' | 'shinobu' | 'both';
type CategoryFilter = 'all' | string;

const CHARACTER_FILTERS: { key: CharacterFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'giyu', label: '義勇' },
  { key: 'shinobu', label: '忍' },
  { key: 'both', label: '共同' },
];

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const isSearchMode = searchQuery.length > 0;

  const location = useLocation();
  const locationState = location.state as { character?: CharacterFilter; category?: CategoryFilter } | null;
  const [characterFilter, setCharacterFilter] = useState<CharacterFilter>(locationState?.character ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(locationState?.category ?? 'all');
  const activeCategoryRef = useRef<HTMLButtonElement>(null);

  const handleCharacterFilter = (key: CharacterFilter) => {
    setCharacterFilter(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (key: CategoryFilter) => {
    setCategoryFilter(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  // Browse mode
  const { data: filteredItemIds, isLoading: idsLoading } = useQuery({
    queryKey: ['item-ids', characterFilter],
    queryFn: () => fetchFilteredItemIds(characterFilter),
    staleTime: 5 * 60 * 1000,
    enabled: !isSearchMode && characterFilter !== 'all',
  });

  const browseQuery = useInfiniteQuery<
    ItemsPage,
    Error,
    InfiniteData<ItemsPage>,
    string[],
    PageCursor | null
  >({
    queryKey: ['items', characterFilter, categoryFilter],
    queryFn: ({ pageParam }) =>
      fetchItemsPage({
        itemIds: filteredItemIds ?? null,
        categoryKey: categoryFilter === 'all' ? null : categoryFilter,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !isSearchMode && !idsLoading,
  });

  // Search mode
  const searchQueryResult = useInfiniteQuery<
    ItemsPage,
    Error,
    InfiniteData<ItemsPage>,
    string[],
    PageCursor | null
  >({
    queryKey: ['search', searchQuery],
    queryFn: ({ pageParam }) => fetchSearchPage({ searchQuery, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isSearchMode,
  });

  const {
    data,
    isLoading: pageLoading,
    isError: pageError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = isSearchMode ? searchQueryResult : browseQuery;

  const isInitialLoading = isSearchMode ? pageLoading : idsLoading || pageLoading;
  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);

  // 用 ref 持有最新的 callback
  const intersectRef = useRef({ fetchNextPage, hasNextPage, isFetchingNextPage });
  intersectRef.current = { fetchNextPage, hasNextPage, isFetchingNextPage };

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const { fetchNextPage, hasNextPage, isFetchingNextPage } = intersectRef.current;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // 類別 filter 切換時，捲動 active tab 到可視範圍
  useEffect(() => {
    if (!categoriesLoading && categoryFilter !== 'all' && activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [categoriesLoading]);

  return (
    <div className='bg-washi text-ink font-mincho min-h-screen'>
      <Header />

      {/* 標題 */}
      <div className='max-w-[1200px] mx-auto pt-10 pb-8 px-8'>
        <WasujiHeading title='弐' label='周邊圖鑑' />
      </div>

      {/* 篩選列 / 搜尋狀態列 */}
      <div className='sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 bg-washi/92 backdrop-blur-sm border-y border-gold/15'>
        <div className='max-w-[1200px] mx-auto px-8 py-3'>
          {isSearchMode ? (
            /* 搜尋模式：顯示目前搜尋條件 + 清除按鈕 */
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2.5'>
                <Search size={12} className='text-gold-dim shrink-0' />
                <span className='text-[0.72rem] font-mincho tracking-widest text-ink truncate'>
                  「{searchQuery}」的搜尋結果
                </span>
                <button
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('search');
                      return next;
                    })
                  }
                  className='ml-auto shrink-0 flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] text-ink-faint hover:text-ink font-sans transition-colors cursor-pointer'
                >
                  清除
                  <X size={11} />
                </button>
              </div>
              <span className='pl-[calc(12px+0.625rem)] text-[0.58rem] text-ink-faint tracking-[0.25em] font-sans'>
                {isInitialLoading ? '—' : `共 ${items.length} 件`}
              </span>
            </div>
          ) : (
            /* 瀏覽模式：角色 + 類別篩選 */
            <div className='flex flex-col gap-2'>
              {/* 角色篩選 */}
              <div className='flex items-center gap-2'>
                {CHARACTER_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleCharacterFilter(key)}
                    className={`px-4 py-1 text-[0.68rem] tracking-[0.25em] border transition-colors duration-150 font-mincho cursor-pointer ${
                      characterFilter === key
                        ? 'border-gold/55 text-gold bg-[rgba(201,168,76,0.1)]'
                        : 'border-gold/20 text-ink-dim hover:border-gold/40 hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <span className='ml-auto text-[0.6rem] text-ink-faint tracking-[0.25em] font-sans'>
                  {isInitialLoading ? '—' : `${items.length} 件`}
                </span>
              </div>

              {/* 類別篩選（橫向捲動） */}
              <div className='flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden'>
                {categoriesLoading ? (
                  <LoadingState message='類別載入中' />
                ) : categoriesError ? (
                  <ErrorState message='類別載入失敗' />
                ) : (
                  <>
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      className={`shrink-0 px-3 py-0.5 text-[0.58rem] tracking-[0.2em] border transition-colors duration-150 font-sans cursor-pointer ${
                        categoryFilter === 'all'
                          ? 'border-gold/55 text-gold-dim bg-[rgba(201,168,76,0.08)]'
                          : 'border-gold/15 text-ink-faint hover:border-gold/30 hover:text-ink-dim'
                      }`}
                    >
                      全部類別
                    </button>
                    {categories.map(({ key, name_tw }) => (
                      <button
                        key={key}
                        ref={key === categoryFilter ? activeCategoryRef : null}
                        onClick={() => handleCategoryFilter(key)}
                        className={`shrink-0 px-3 py-0.5 text-[0.58rem] tracking-[0.2em] border transition-colors duration-150 font-sans cursor-pointer ${
                          categoryFilter === key
                            ? 'border-gold/55 text-gold-dim bg-[rgba(201,168,76,0.08)]'
                            : 'border-gold/15 text-ink-faint hover:border-gold/30 hover:text-ink-dim'
                        }`}
                      >
                        {name_tw}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 商品列表 */}
      <div className='px-8 py-10 max-w-[1200px] mx-auto'>
        {isInitialLoading ? (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4'>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : pageError ? (
          <ErrorState />
        ) : items.length === 0 ? (
          <EmptyState
            message={
              isSearchMode
                ? `找不到「${searchQuery}」相關的周邊呢…`
                : '目前還沒有相關的周邊呢…再去其他地方逛逛吧 🦋'
            }
          />
        ) : (
          <>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4'>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
              {isFetchingNextPage &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => <ItemCardSkeleton key={i} />)}
            </div>
            <div ref={sentinelRef} />
          </>
        )}
      </div>

      <PageFooter />
    </div>
  );
}

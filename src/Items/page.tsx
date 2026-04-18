import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { WasujiHeading, LoadingState, ErrorState, EmptyState, Header } from '@/components';
import PageFooter from '@/components/PageFooter';
import { useCategories } from '@/hooks';
import {
  fetchFilteredItemIds,
  fetchItemsPage,
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
  const location = useLocation();
  const locationState = location.state as { character?: CharacterFilter; category?: string } | null;
  const [characterFilter, setCharacterFilter] = useState<CharacterFilter>(
    locationState?.character ?? 'all',
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    locationState?.category ?? 'all',
  );
  const activeCategoryRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  // 取得符合角色篩選的 item IDs
  const { data: filteredItemIds, isLoading: idsLoading } = useQuery({
    queryKey: ['item-ids', characterFilter],
    queryFn: () => fetchFilteredItemIds(characterFilter),
    staleTime: 5 * 60 * 1000,
  });

  // 分頁查詢
  const {
    data,
    isLoading: pageLoading,
    isError: pageError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<ItemsPage, Error, InfiniteData<ItemsPage>, string[], PageCursor | null>({
    queryKey: ['items', characterFilter, categoryFilter],
    queryFn: ({ pageParam }) =>
      fetchItemsPage({
        itemIds: filteredItemIds ?? null,
        categoryKey: categoryFilter === 'all' ? null : categoryFilter,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !idsLoading,
  });

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const totalCount = items.length;

  // IntersectionObserver：滾到底觸發下一頁
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 類別 filter 切換時，捲動 active tab 到可視範圍
  useEffect(() => {
    if (!categoriesLoading && locationState?.category && activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [categoriesLoading]);

  const isInitialLoading = idsLoading || pageLoading;

  return (
    <div className='bg-washi text-ink font-mincho min-h-screen'>
      <Header />
      {/* 標題 */}
      <div className='max-w-[1200px] mx-auto pt-10 pb-8 px-8'>
        <WasujiHeading title='弐' label='周邊圖鑑' />
      </div>

      {/* 篩選列 */}
      <div className='sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 bg-washi/92 backdrop-blur-sm border-y border-gold/15'>
        <div className='max-w-[1200px] mx-auto px-8 py-3 flex flex-col gap-2'>
          {/* 角色篩選 */}
          <div className='flex items-center gap-2'>
            {CHARACTER_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCharacterFilter(key)}
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
              {isInitialLoading ? '—' : `${totalCount} 件`}
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
                  onClick={() => setCategoryFilter('all')}
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
                    onClick={() => setCategoryFilter(key)}
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
          <EmptyState message='目前還沒有相關的周邊呢…再去其他地方逛逛吧 🦋' />
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

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { WasujiHeading, LoadingState, ErrorState } from '@/components';
import { ITEMS, type Item, type ItemCharacter } from '@/constants/items';
import { SERIES } from '@/constants/series';
import { useCategories } from '@/hooks';
import type { Category } from '@/services/categories';

type CharacterFilter = 'all' | ItemCharacter;
type CategoryFilter = 'all' | string;

const CHARACTER_FILTERS: { key: CharacterFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'giyu', label: '義勇' },
  { key: 'shinobu', label: '忍' },
  { key: 'both', label: '共同' },
];

function ItemCard({ item, categories }: { item: Item; categories: Category[] }) {
  const seriesName = SERIES.find((s) => s.id === item.series_id)?.name_tw ?? item.series_id;
  const categoryLabel = categories.find((c) => c.key === item.category)?.name_tw ?? item.category;

  const accentCls = {
    giyu: 'border-t-giyu/50',
    shinobu: 'border-t-shinobu/50',
    both: 'border-t-gold/50',
  }[item.character];

  return (
    <div
      className={`relative bg-washi border border-gold/15 border-t-2 ${accentCls} flex flex-col`}
    >
      {/* 封面圖 */}
      <div className='relative overflow-hidden bg-washi-warm flex items-center justify-center aspect-square'>
        <img
          src={`/items/${item.character}/${item.image_cover}`}
          alt={item.name_jp}
          className='w-full h-full object-contain p-2'
          onError={(e) => {
            e.currentTarget.parentElement!.innerHTML = `<span class="text-[2rem] text-gold-dim/20 font-mincho select-none">無</span>`;
          }}
        />
      </div>

      {/* 內容 */}
      <div className='p-3 flex flex-col gap-1.5 flex-1'>
        <div className='flex items-center justify-between gap-1'>
          <span className='text-[0.55rem] tracking-[0.2em] text-ink-dim font-sans'>
            {categoryLabel}
          </span>
          {item.price_jpy === 0 ? (
            <span className='text-[0.58rem] text-shinobu-mid tracking-widest font-sans'>景品</span>
          ) : (
            <span className='text-[0.68rem] text-gold-dim font-mincho'>
              ¥{item.price_jpy.toLocaleString()}
            </span>
          )}
        </div>

        <p className='text-[0.72rem] text-ink leading-[1.7] font-mincho line-clamp-3 flex-1'>
          {item.name_jp}
        </p>

        <p className='text-[0.52rem] text-ink-faint tracking-widest border-t border-gold/10 pt-1.5 font-sans'>
          {seriesName}
        </p>
      </div>
    </div>
  );
}

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const initialCharacter = (searchParams.get('character') ?? 'all') as CharacterFilter;

  const [characterFilter, setCharacterFilter] = useState<CharacterFilter>(initialCharacter);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const usedCategories = useMemo(() => {
    const keys = new Set<string>(ITEMS.map((i) => i.category));
    return categories.filter((c) => keys.has(c.key));
  }, [categories]);

  const filteredItems = useMemo(() => {
    return ITEMS.filter((item) => {
      if (characterFilter !== 'all' && item.character !== characterFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [characterFilter, categoryFilter]);

  return (
    <div className='bg-washi text-ink font-mincho min-h-screen'>
      {/* 標題 */}
      <div className='pt-16 pb-8 px-8'>
        <WasujiHeading title='弐' label='周邊圖鑑' />
      </div>

      {/* 篩選列 */}
      <div className='sticky top-0 z-20 bg-washi/92 backdrop-blur-sm border-y border-gold/15 px-8 py-3 flex flex-col gap-2'>
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
            {filteredItems.length} 件
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
              {usedCategories.map(({ key, name_tw }) => (
                <button
                  key={key}
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

      {/* 商品格列 */}
      <div className='px-8 py-10 max-w-[1200px] mx-auto'>
        {filteredItems.length === 0 ? (
          <div className='flex flex-col items-center py-24 gap-3'>
            <span className='text-[3rem] text-gold-dim/30 font-mincho leading-none'>無</span>
            <p className='text-[0.75rem] text-ink-dim tracking-[0.35em]'>沒有符合條件的商品</p>
          </div>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4'>
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className='px-8 pb-6'>
        <div className='h-px bg-[linear-gradient(to_right,transparent,var(--color-gold-dim),transparent)] opacity-30 mb-3' />
        <div className='text-center text-[0.5rem] tracking-[0.4em] text-ink-faint'>
          義忍同好製作委員會
        </div>
      </footer>
    </div>
  );
}

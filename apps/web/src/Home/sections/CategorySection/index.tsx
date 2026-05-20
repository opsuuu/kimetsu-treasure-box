import { Link } from 'react-router';
import { WasujiHeading, LoadingState, ErrorState, EmptyState } from '@/components';
import { ROUTES } from '@/routers/paths';
import { useCategories } from '@/hooks';

export default function CategorySection() {
  const { data: categories, isLoading, isError } = useCategories();

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (!categories || categories.length === 0) return <EmptyState message='暫無類別資料' />;

    return (
      <div className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px border border-gold/18 bg-gold/18'>
        {categories.map(({ key, name_tw, name_en, icon }) => (
          <Link
            key={key}
            to={`${ROUTES.ITEMS}?category=${key}`}
            className='bg-washi border-none px-4 py-8 cursor-pointer text-inherit text-center transition-[background] duration-[0.25s] no-underline block'
          >
            <div className='text-[1.1rem] text-gold-dim mb-[0.7rem]'>{icon}</div>
            <div className='text-[0.85rem] tracking-[0.15em] text-ink-mid mb-[0.35rem] font-mincho'>
              {name_tw}
            </div>
            <div className='text-[0.55rem] tracking-[0.3em] text-ink-dim uppercase font-sans'>
              {name_en}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <section className='py-16 px-8 max-w-[1100px] mx-auto'>
      <WasujiHeading title='参' label='周邊類別' />
      {renderContent()}
    </section>
  );
}

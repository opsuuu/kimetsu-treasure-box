import { WasujiHeading } from '@/components';
import { CATEGORIES } from '@/constants/categories';

export default function CategorySection() {
  return (
    <section className='py-16 px-8 max-w-[1100px] mx-auto'>
      <WasujiHeading title='参' label='周邊類別' />
      <div className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px border border-gold/18 bg-gold/18'>
        {CATEGORIES.map(({ label, sub, glyph }) => (
          <button
            key={label}
            className='bg-washi border-none px-4 py-8 cursor-pointer text-inherit text-center transition-[background] duration-[0.25s]'
          >
            <div className='text-[1.1rem] text-gold-dim mb-[0.7rem]'>{glyph}</div>
            <div className='text-[0.85rem] tracking-[0.15em] text-ink-mid mb-[0.35rem] font-mincho'>
              {label}
            </div>
            <div className='text-[0.55rem] tracking-[0.3em] text-ink-dim uppercase font-sans'>
              {sub}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

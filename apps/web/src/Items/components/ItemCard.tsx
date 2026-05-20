import { Link } from 'react-router';
import type { ItemDetail } from '@/services/items';
import { ROUTES } from '@/routers/paths';

const accentClsMap: Record<string, string> = {
  giyu: 'border-t-giyu/50',
  shinobu: 'border-t-shinobu/50',
  both: 'border-t-gold/50',
};

export function ItemCard({ item }: { item: ItemDetail }) {
  const seriesName = item.series?.name_tw ?? item.series?.name_jp ?? '';
  const categoryLabel = item.categories?.name_tw ?? '';
  const slugs = item.item_characters.map((ic) => ic.characters.slug);
  const accentCls =
    slugs.includes('giyu') && slugs.includes('shinobu')
      ? accentClsMap.both
      : slugs.includes('giyu')
        ? accentClsMap.giyu
        : slugs.includes('shinobu')
          ? accentClsMap.shinobu
          : 'border-t-gold/50';
  const characterLabel = item.item_characters.map((ic) => ic.characters.name).join('・');

  return (
    <Link
      to={ROUTES.ITEM_DETAIL(item.slug)}
      className={`relative bg-washi border border-gold/15 border-t-2 ${accentCls} flex flex-col no-underline text-inherit hover:border-gold/35 transition-colors duration-150`}
    >
      {/* 封面圖 */}
      <div className='relative overflow-hidden bg-washi-warm flex items-center justify-center aspect-square'>
        <img
          src={item.image_cover_url ?? ''}
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
          {item.price != null ? (
            <span className='text-[0.68rem] text-gold-dim font-mincho'>
              ¥{item.price.toLocaleString()}
            </span>
          ) : (
            <span className='text-[0.68rem] text-ink-faint font-mincho tracking-widest'>
              尚未記錄
            </span>
          )}
        </div>

        <p className='text-[0.72rem] text-ink leading-[1.7] font-mincho line-clamp-3 flex-1'>
          {item.name_jp}
        </p>

        <div className='flex items-center justify-between gap-1 border-t border-gold/10 pt-1.5'>
          <p className='text-[0.52rem] text-ink-faint tracking-widest font-sans truncate'>
            {seriesName}
          </p>
          {characterLabel && (
            <p className='text-[0.5rem] text-ink-faint/60 tracking-wider font-sans shrink-0'>
              {characterLabel}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

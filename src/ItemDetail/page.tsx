import { useParams } from 'react-router';
import { TraditionalDivider, LoadingState, ErrorState, Header } from '@/components';
import PageFooter from '@/components/PageFooter';
import { InfoRow, ItemGallery } from './components';
import { useItemBySlug, useItemImages } from '@/hooks';
import { characterThemes, defaultCharacterTheme } from '@/constants/characterThemes';
import { ROUTES } from '@/routers/paths';
import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function ItemDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: item, isLoading, isError } = useItemBySlug(slug);
  const { data: itemImages = [] } = useItemImages(item?.id ?? '');
  const extraImages = itemImages.map((img: { image_url: string }) => img.image_url);
  const images = useMemo(() => {
    return [item?.image_cover_url, ...extraImages].filter((s): s is string => s != null);
  }, [item?.image_cover_url, extraImages]);

  if (isLoading) return <LoadingState />;
  if (isError || !item) return <ErrorState />;

  const characters = item.item_characters.map((ic) => ic.characters);
  const characterSlug = characters.length === 1 ? characters[0].slug : '';
  const theme = characterThemes[characterSlug] ?? defaultCharacterTheme;
  const characterLabel = characters.map((c) => c.name).join('・');
  const hasExtraInfo = Boolean(item.specification || item.material || item.official_url);

  return (
    <div className='bg-washi text-ink font-mincho min-h-screen'>
      <Header back={{ to: ROUTES.ITEMS, label: '返回圖鑑' }} />

      {/* 主內容 */}
      <div className='px-8 pt-8 pb-16 max-w-[1200px] mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-10 lg:gap-16 items-start'>
          {/* 左：圖片輪播 */}
          <ItemGallery images={images} itemName={item.name_jp} />

          {/* 右：商品資訊 */}
          <div className='flex flex-col gap-6 pt-2 min-w-0'>
            {/* 角色 ＋ 類別 tags */}
            <div className='flex items-center gap-2 flex-wrap'>
              {characterLabel && (
                <span
                  className={cn(
                    'text-[0.58rem] tracking-[0.25em] px-3 py-1 border font-sans',
                    theme.cardBorder,
                    theme.nameCls,
                  )}
                >
                  {characterLabel}
                </span>
              )}
              {item.categories && (
                <span className='text-[0.58rem] tracking-[0.25em] px-3 py-1 border border-gold/20 text-gold-dim font-sans'>
                  {item.categories.name_tw}
                </span>
              )}
            </div>

            {/* 商品名稱 */}
            <div>
              <h1 className='text-[1.4rem] font-normal tracking-[0.15em] leading-[1.8] text-ink m-0'>
                {item.name_jp}
              </h1>
              {item.name_tw && (
                <p className='text-[0.75rem] tracking-[0.2em] text-ink-dim mt-1 font-sans'>
                  {item.name_tw}
                </p>
              )}
            </div>

            <TraditionalDivider />

            {/* 價格 ＋ 發售日 */}
            <dl className='flex flex-col gap-3'>
              <InfoRow
                label='金額'
                children={
                  <span className='text-[1.1rem] text-gold-dim font-mincho m-0'>
                    {item.price != null ? `¥${item.price.toLocaleString()}` : '¥ ???'}
                  </span>
                }
              />

              {item.release_date && <InfoRow label='發售日' children={item.release_date} />}

              {item.series && (
                <InfoRow label='系列' children={item.series.name_tw ?? item.series.name_jp} />
              )}
            </dl>

            {/* 說明 */}
            {item.description && (
              <>
                <TraditionalDivider />
                <p className='text-[0.78rem] text-ink-mid leading-[2.2] tracking-widest whitespace-pre-line'>
                  {item.description}
                </p>
              </>
            )}

            {/* 規格 ＋ 材質 ＋ 官方連結 */}
            {hasExtraInfo && (
              <>
                <TraditionalDivider />
                <dl className='flex flex-col gap-3'>
                  {item.specification && (
                    <InfoRow label='規格' align='start'>
                      {item.specification}
                    </InfoRow>
                  )}
                  {item.material && (
                    <InfoRow label='材質' align='start'>
                      {item.material}
                    </InfoRow>
                  )}
                  {item.official_url && (
                    <InfoRow label='官方連結'>
                      <a
                        href={item.official_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1.5 text-[0.72rem] tracking-widest text-ink-dim hover:text-gold-dim transition-colors duration-200 no-underline font-sans border-b border-gold/25 hover:border-gold/60 pb-px min-w-0'
                      >
                        <span className='truncate min-w-0'>{item.official_url}</span>
                        <ExternalLink size={11} className='shrink-0' />
                      </a>
                    </InfoRow>
                  )}
                </dl>
              </>
            )}
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}

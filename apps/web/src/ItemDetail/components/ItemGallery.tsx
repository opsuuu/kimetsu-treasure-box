import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, FreeMode, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { cn } from '@/lib/utils';

interface ItemGalleryProps {
  images: string[];
  itemName: string;
}

export default function ItemGallery({ images, itemName }: ItemGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  return (
    <div className={cn('grid grid-cols-1 gap-3', images.length > 1 && 'lg:grid-cols-[80px_1fr]')}>
      {/* 縮圖 — 桌機垂直左側 / 手機水平下方 */}
      {images.length > 1 && (
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView='auto'
          freeMode
          watchSlidesProgress
          breakpoints={{
            0: { direction: 'horizontal' },
            1024: { direction: 'vertical' },
          }}
          className='order-2 lg:order-1 w-full lg:h-full'
        >
          {images.map((src, i) => (
            <SwiperSlide
              key={i}
              className='w-[80px]! h-[80px]! overflow-hidden transition-opacity duration-200 opacity-45 hover:opacity-75 cursor-pointer [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:ring-1 [&.swiper-slide-thumb-active]:ring-gold/60'
            >
              <img src={src} alt={`縮圖 ${i + 1}`} className='w-full h-full object-cover' />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 主圖 */}
      <div className='order-1 lg:order-2 relative min-w-0'>
        {/* 角落 L 型線條 */}
        <span className='pointer-events-none absolute top-0 left-0 w-5 h-5 border-t border-l border-gold/40 z-10' />
        <span className='pointer-events-none absolute top-0 right-0 w-5 h-5 border-t border-r border-gold/40 z-10' />
        <span className='pointer-events-none absolute bottom-0 left-0 w-5 h-5 border-b border-l border-gold/40 z-10' />
        <span className='pointer-events-none absolute bottom-0 right-0 w-5 h-5 border-b border-r border-gold/40 z-10' />

        {images.length > 0 ? (
          <Swiper
            modules={[Pagination, Thumbs]}
            thumbs={{ swiper: thumbsSwiper }}
            pagination={images.length > 1 ? { clickable: true } : false}
            className='aspect-square w-full item-detail-swiper'
          >
            {images.map((src, i) => (
              <SwiperSlide key={i}>
                <div className='w-full h-full flex items-center justify-center p-4'>
                  <img
                    src={src}
                    alt={`${itemName} ${i + 1}`}
                    className='w-full h-full object-contain'
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className='aspect-square flex items-center justify-center'>
            <span className='text-[4rem] text-gold-dim/20 font-mincho select-none'>無</span>
          </div>
        )}
      </div>
    </div>
  );
}

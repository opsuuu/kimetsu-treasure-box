import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Heart, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/routers/paths';
import SearchModal from './SearchModal';

interface SiteHeaderProps {
  back?: { to: string; label: string };
}

export default function SiteHeader({ back }: SiteHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <header className='sticky top-0 z-50 bg-washi/90 backdrop-blur-sm border-b border-gold/10 pt-[env(safe-area-inset-top)]'>
      <div className='max-w-[1200px] mx-auto px-8 h-14 flex items-center justify-between sm:grid sm:grid-cols-3'>
        {/* 左欄：返回按鈕（桌機）/ 空白（手機無返回時） */}
        <div className='hidden sm:block'>
          {back && (
            <Link
              to={back.to}
              className='inline-flex items-center gap-2 text-[0.65rem] tracking-[0.3em] text-ink-dim hover:text-ink transition-colors no-underline font-sans'
            >
              ← {back.label}
            </Link>
          )}
        </div>

        {/* 中欄（桌機置中）/ 左側（手機） */}
        <div className='flex sm:justify-center'>
          <Link to={ROUTES.HOME} className='no-underline flex items-center gap-2.5'>
            <img src='/logo.png' alt='義忍圖鑑' className='h-8' />
            <span className='font-mincho text-[0.8rem] tracking-[0.4em] text-ink-dim leading-none'>
              義忍<span className='mx-1 text-gold-dim/60'>×</span>圖鑑
            </span>
          </Link>
        </div>

        {/* 右欄：功能按鈕 */}
        <div className='flex sm:justify-end items-center gap-5'>
          <button
            aria-label='搜尋'
            onClick={() => setIsSearchOpen(true)}
            className='text-ink-dim hover:text-ink transition-colors cursor-pointer'
          >
            <Search size={15} />
          </button>
          <button
            aria-label='收藏清單'
            className='text-ink-dim cursor-not-allowed opacity-40'
            disabled
          >
            <Heart size={15} />
          </button>
          {/* 返回按鈕（手機版：只顯示 icon，愛心右側） */}
          {back && (
            <Link
              to={back.to}
              aria-label={back.label}
              className='sm:hidden text-ink-dim hover:text-ink transition-colors no-underline'
            >
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </header>
    </>
  );
}

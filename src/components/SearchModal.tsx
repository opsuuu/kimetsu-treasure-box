import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ItemCard } from '@/Items/components/ItemCard';
import type { ItemDetail } from '@/services/items';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // TODO: 串接搜尋 API
  const isLoading = false;
  const results: ItemDetail[] = [];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className='fixed inset-0 z-100 bg-washi/96 backdrop-blur-sm overflow-y-auto'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='max-w-[1200px] mx-auto px-8 pt-20 pb-16'>
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          aria-label='關閉搜尋'
          className='absolute top-5 right-8 text-ink-dim hover:text-ink transition-colors cursor-pointer'
        >
          <X size={18} />
        </button>

        {/* 搜尋輸入框 */}
        <div className='max-w-[560px] mx-auto mb-12'>
          <div className='flex items-center gap-3 border-b border-gold/40 pb-3'>
            <Search size={15} className='text-gold-dim shrink-0' />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='搜尋日文或中文品名⋯'
              className='flex-1 bg-transparent text-ink font-mincho text-[0.9rem] tracking-[0.15em] placeholder:text-ink-faint outline-none'
            />
            {hasQuery && (
              <button
                onClick={() => setQuery('')}
                aria-label='清除'
                className='text-ink-faint hover:text-ink-dim transition-colors cursor-pointer'
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 結果區 */}
        {!hasQuery ? (
          <p className='text-center text-[0.58rem] tracking-[0.45em] text-ink-faint font-mincho py-16'>
            請輸入品名關鍵字
          </p>
        ) : isLoading ? (
          <p className='text-center text-[0.58rem] tracking-[0.45em] text-ink-faint font-mincho py-16'>
            搜尋中⋯
          </p>
        ) : results.length === 0 ? (
          <p className='text-center text-[0.58rem] tracking-[0.45em] text-ink-faint font-mincho py-16'>
            無相符結果
          </p>
        ) : (
          <>
            <p className='text-[0.55rem] tracking-[0.35em] text-ink-faint font-sans mb-4'>
              共 {results.length} 件
            </p>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4'>
              {results.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

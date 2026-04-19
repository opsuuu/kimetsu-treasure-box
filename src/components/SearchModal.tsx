import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import { ROUTES } from '@/routers/paths';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`${ROUTES.ITEMS}?search=${encodeURIComponent(q)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-100 bg-washi/96 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='max-w-[560px] mx-auto px-8 pt-32'>
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          aria-label='關閉搜尋'
          className='absolute top-5 right-8 text-ink-dim hover:text-ink transition-colors cursor-pointer'
        >
          <X size={18} />
        </button>

        {/* 搜尋輸入框 */}
        <div className='flex items-center gap-3 border-b border-gold/40 pb-3'>
          <Search size={15} className='text-gold-dim shrink-0' />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder='搜尋日文或中文品名⋯'
            className='flex-1 bg-transparent text-ink font-mincho text-[0.9rem] tracking-[0.15em] placeholder:text-ink-faint outline-none'
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label='清除'
              className='text-ink-faint hover:text-ink-dim transition-colors cursor-pointer'
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* 提示文字 */}
        <p className='mt-4 text-center text-[0.55rem] tracking-[0.35em] text-ink-faint font-sans'>
          {query.trim() ? '按 Enter 搜尋' : '請輸入品名關鍵字'}
        </p>
      </div>
    </div>
  );
}

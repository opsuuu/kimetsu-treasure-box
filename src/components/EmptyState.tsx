interface EmptyStateProps {
  message?: string;
  sub?: string;
}

export default function EmptyState({
  message = '尚未尋得此物',
  sub = '也許還在某處靜靜等待被發現',
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center py-24 gap-4'>
      <span className='text-[4.5rem] text-gold-dim/20 font-mincho leading-none select-none'>
        無
      </span>
      <p className='text-[0.85rem] text-ink-dim tracking-[0.3em] font-mincho'>{message}</p>
      <p className='text-[0.65rem] text-ink-faint tracking-[0.2em] font-mincho'>{sub}</p>
    </div>
  );
}

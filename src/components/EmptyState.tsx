export default function EmptyState({ message = '目前沒有資料' }: { message?: string }) {
  return (
    <div className='py-12 text-center text-ink-dim text-[0.85rem] tracking-[0.2em] font-mincho'>
      {message}
    </div>
  );
}

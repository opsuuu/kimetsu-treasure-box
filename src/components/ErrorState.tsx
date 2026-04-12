export default function ErrorState({ message = '載入失敗，請稍後再試' }: { message?: string }) {
  return (
    <div className='py-12 text-center text-ink-dim text-[0.85rem] tracking-[0.2em] font-mincho'>
      {message}
    </div>
  );
}

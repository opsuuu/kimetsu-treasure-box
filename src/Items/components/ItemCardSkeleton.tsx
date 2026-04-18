export function ItemCardSkeleton() {
  return (
    <div className='bg-washi border border-gold/15 border-t-2 border-t-gold/20 flex flex-col animate-pulse'>
      {/* 封面圖佔位 */}
      <div className='aspect-square bg-washi-warm' />

      {/* 內容佔位 */}
      <div className='p-3 flex flex-col gap-1.5 flex-1'>
        <div className='flex items-center justify-between gap-1'>
          <div className='h-2 w-10 bg-gold/10 rounded-sm' />
          <div className='h-2 w-8 bg-gold/10 rounded-sm' />
        </div>

        <div className='flex flex-col gap-1 flex-1 pt-0.5'>
          <div className='h-2.5 w-full bg-gold/10 rounded-sm' />
          <div className='h-2.5 w-4/5 bg-gold/10 rounded-sm' />
          <div className='h-2.5 w-3/5 bg-gold/10 rounded-sm' />
        </div>

        <div className='flex items-center justify-between gap-1 border-t border-gold/10 pt-1.5'>
          <div className='h-2 w-16 bg-gold/10 rounded-sm' />
          <div className='h-2 w-8 bg-gold/10 rounded-sm' />
        </div>
      </div>
    </div>
  );
}

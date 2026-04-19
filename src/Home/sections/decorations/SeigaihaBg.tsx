/** 青海波紋 — visible on light background */
export default function SeigaihaBg() {
  return (
    <svg aria-hidden className='absolute inset-0 w-full h-full pointer-events-none'>
      <defs>
        <pattern id='seigaiha' x='0' y='0' width='48' height='24' patternUnits='userSpaceOnUse'>
          <path
            d='M 0 24 A 24 24 0 0 1 48 24'
            fill='none'
            stroke='rgba(90,140,180,0.22)'
            strokeWidth='0.7'
          />
          <path
            d='M 5 24 A 19 19 0 0 1 43 24'
            fill='none'
            stroke='rgba(90,140,180,0.16)'
            strokeWidth='0.5'
          />
          <path
            d='M 10 24 A 14 14 0 0 1 38 24'
            fill='none'
            stroke='rgba(90,140,180,0.10)'
            strokeWidth='0.4'
          />
          <path
            d='M -24 12 A 24 24 0 0 1 24 12'
            fill='none'
            stroke='rgba(90,140,180,0.22)'
            strokeWidth='0.7'
          />
          <path
            d='M -19 12 A 19 19 0 0 1 19 12'
            fill='none'
            stroke='rgba(90,140,180,0.16)'
            strokeWidth='0.5'
          />
          <path
            d='M -14 12 A 14 14 0 0 1 14 12'
            fill='none'
            stroke='rgba(90,140,180,0.10)'
            strokeWidth='0.4'
          />
          <path
            d='M 24 12 A 24 24 0 0 1 72 12'
            fill='none'
            stroke='rgba(90,140,180,0.22)'
            strokeWidth='0.7'
          />
          <path
            d='M 29 12 A 19 19 0 0 1 67 12'
            fill='none'
            stroke='rgba(90,140,180,0.16)'
            strokeWidth='0.5'
          />
          <path
            d='M 34 12 A 14 14 0 0 1 62 12'
            fill='none'
            stroke='rgba(90,140,180,0.10)'
            strokeWidth='0.4'
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill='url(#seigaiha)' />
    </svg>
  );
}

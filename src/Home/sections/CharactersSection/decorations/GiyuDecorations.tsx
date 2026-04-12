import { JapanesePalette } from '@/constants/palette';

export default function GiyuDecorations() {
  return (
    <>
      {/* 幾何柄 (立方體幾何紋) watermark */}
      <svg
        aria-hidden
        viewBox='0 0 140 140'
        className='absolute left-0 bottom-0 w-[140px] h-[140px] pointer-events-none opacity-[0.13] overflow-hidden'
      >
        {Array.from({ length: 17 }, (_, b) =>
          (b % 2 === 0 ? [0, 56, 112] : [28, 84, 140]).map((cx) => ({
            cx,
            cy: 8 * (b + 2),
          })),
        )
          .flat()
          .flatMap(({ cx, cy }) => [
            <polygon
              key={`t${cx}${cy}`}
              points={`${cx},${cy - 16} ${cx + 14},${cy - 8} ${cx},${cy} ${cx - 14},${cy - 8}`}
              fill='#d07830'
              stroke='#7a3808'
              strokeWidth='0.6'
            />,
            <polygon
              key={`l${cx}${cy}`}
              points={`${cx - 14},${cy - 8} ${cx},${cy} ${cx - 14},${cy + 8} ${cx - 28},${cy}`}
              fill='#1a6850'
              stroke='#0a2820'
              strokeWidth='0.6'
            />,
            <polygon
              key={`r${cx}${cy}`}
              points={`${cx},${cy} ${cx + 14},${cy - 8} ${cx + 28},${cy} ${cx + 14},${cy + 8}`}
              fill='#2a8868'
              stroke='#0a2820'
              strokeWidth='0.6'
            />,
          ])}
      </svg>

      {/* 水紋 arc */}
      <svg
        aria-hidden
        viewBox='0 0 260 220'
        className='absolute top-[-5px] right-40 w-[260px] h-[220px] pointer-events-none overflow-visible'
      >
        <defs>
          <linearGradient id='cg1' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor={JapanesePalette.gBlue} stopOpacity='0' />
            <stop offset='40%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.45' />
            <stop offset='100%' stopColor={JapanesePalette.gBlueLight} stopOpacity='0.05' />
          </linearGradient>
          <linearGradient id='cg2' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
            <stop offset='50%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.28' />
            <stop offset='100%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
          </linearGradient>
        </defs>
        <path
          d='M 260 10 C 210 40, 180 80, 200 130 C 215 165, 240 185, 255 215'
          stroke='url(#cg1)'
          strokeWidth='2.4'
          fill='none'
          strokeLinecap='round'
          strokeDasharray='300'
          strokeDashoffset='300'
          style={{ animation: 'waterDraw 2.5s cubic-bezier(0.4,0,0.2,1) 0.8s forwards' }}
        />
        <path
          d='M 260 24 C 218 52, 192 90, 210 138 C 224 172, 248 192, 260 218'
          stroke='url(#cg2)'
          strokeWidth='1.3'
          fill='none'
          strokeLinecap='round'
          strokeDasharray='300'
          strokeDashoffset='300'
          style={{ animation: 'waterDraw 2.8s cubic-bezier(0.4,0,0.2,1) 1s forwards' }}
        />
        {(
          [
            [232, 70],
            [218, 108],
            [224, 148],
            [242, 182],
          ] as [number, number][]
        ).map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i % 2 === 0 ? 2.2 : 1.5}
            fill={JapanesePalette.gBlueMid}
            opacity='0'
            style={{ animation: `shimmer 2.5s ease-in-out ${0.8 + i * 0.3}s infinite` }}
          />
        ))}
      </svg>
    </>
  );
}

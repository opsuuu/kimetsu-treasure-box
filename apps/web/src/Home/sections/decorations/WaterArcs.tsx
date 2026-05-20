import { JapanesePalette } from '@/constants/palette';

/** 水流軌跡 — soft blue strokes on warm paper */
export default function WaterArcs() {
  return (
    <svg
      aria-hidden
      className='absolute inset-0 pointer-events-none w-full h-full'
      viewBox='0 0 1440 900'
      preserveAspectRatio='xMidYMid slice'
    >
      <defs>
        <linearGradient id='wg1' x1='0%' y1='100%' x2='80%' y2='0%'>
          <stop offset='0%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
          <stop offset='30%' stopColor={JapanesePalette.gBlue} stopOpacity='0.5' />
          <stop offset='70%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.35' />
          <stop offset='100%' stopColor={JapanesePalette.gBlueLight} stopOpacity='0' />
        </linearGradient>
        <linearGradient id='wg2' x1='0%' y1='100%' x2='80%' y2='0%'>
          <stop offset='0%' stopColor={JapanesePalette.gBlue} stopOpacity='0' />
          <stop offset='45%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.28' />
          <stop offset='100%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
        </linearGradient>
        <linearGradient id='wg3' x1='0%' y1='100%' x2='80%' y2='0%'>
          <stop offset='0%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
          <stop offset='50%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.18' />
          <stop offset='100%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
        </linearGradient>
      </defs>
      <path
        d='M -20 920 C 80 780, 160 620, 260 470 C 340 350, 430 240, 560 130 C 640 68, 720 30, 820 8'
        stroke='url(#wg1)'
        strokeWidth='3'
        fill='none'
        strokeLinecap='round'
        strokeDasharray='2000'
        strokeDashoffset='2000'
        style={{ animation: 'waterDraw 3.2s cubic-bezier(0.4,0,0.2,1) 0.4s forwards' }}
      />
      <path
        d='M -20 900 C 60 760, 140 600, 240 455 C 320 338, 415 228, 545 122 C 628 60, 710 24, 812 4'
        stroke='url(#wg2)'
        strokeWidth='1.8'
        fill='none'
        strokeLinecap='round'
        strokeDasharray='2000'
        strokeDashoffset='2000'
        style={{ animation: 'waterDraw 3.5s cubic-bezier(0.4,0,0.2,1) 0.6s forwards' }}
      />
      <path
        d='M -20 880 C 45 745, 120 585, 225 440 C 305 325, 400 218, 530 114 C 614 52, 698 18, 800 0'
        stroke='url(#wg3)'
        strokeWidth='1.1'
        fill='none'
        strokeLinecap='round'
        strokeDasharray='2000'
        strokeDashoffset='2000'
        style={{ animation: 'waterDraw 3.8s cubic-bezier(0.4,0,0.2,1) 0.8s forwards' }}
      />
      {(
        [
          [130, 680],
          [210, 560],
          [295, 430],
          [375, 315],
          [460, 210],
          [560, 125],
        ] as [number, number][]
      ).map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i % 2 === 0 ? 2.8 : 2}
          fill={JapanesePalette.gBlueMid}
          opacity='0'
          style={{ animation: `shimmer 2.4s ease-in-out ${i * 0.35}s infinite` }}
        />
      ))}
    </svg>
  );
}

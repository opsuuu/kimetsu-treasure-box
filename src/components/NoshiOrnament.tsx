import { JapanesePalette } from '@/constants/palette';

// 雙菱形裝飾
export default function NoshiOrnament({ size = 28 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      viewBox='0 0 28 56'
      width={size}
      height={size * 2}
      className='inline-block align-middle'
    >
      <path
        d='M 14 0 L 26 14 L 14 28 L 2 14 Z'
        fill='none'
        stroke={JapanesePalette.gold}
        strokeWidth='0.9'
        opacity='0.9'
      />
      <path
        d='M 14 28 L 26 42 L 14 56 L 2 42 Z'
        fill='none'
        stroke={JapanesePalette.goldDim}
        strokeWidth='0.9'
        opacity='0.7'
      />
      <line
        x1='14'
        y1='0'
        x2='14'
        y2='56'
        stroke={JapanesePalette.gold}
        strokeWidth='0.5'
        opacity='0.45'
      />
      <circle cx='14' cy='14' r='1.5' fill={JapanesePalette.gold} opacity='0.8' />
      <circle cx='14' cy='42' r='1.5' fill={JapanesePalette.goldDim} opacity='0.65' />
    </svg>
  );
}

import { JapanesePalette } from '@/constants/palette';

export default function TraditionalDivider() {
  return (
    <div className='relative w-full h-6 flex items-center justify-center'>
      <svg
        aria-hidden
        viewBox='0 0 600 24'
        preserveAspectRatio='xMidYMid meet'
        className='w-full max-w-[600px] h-6'
      >
        <line
          x1='0'
          y1='12'
          x2='252'
          y2='12'
          stroke={JapanesePalette.goldDim}
          strokeWidth='0.5'
          opacity='0.5'
        />
        <line
          x1='220'
          y1='12'
          x2='252'
          y2='12'
          stroke={JapanesePalette.gold}
          strokeWidth='0.9'
          opacity='0.7'
        />
        <path
          d='M 300 4 L 312 12 L 300 20 L 288 12 Z'
          fill='none'
          stroke={JapanesePalette.gold}
          strokeWidth='0.9'
          opacity='0.85'
        />
        <circle cx='300' cy='12' r='1.5' fill={JapanesePalette.gold} opacity='0.9' />
        <circle cx='268' cy='12' r='1.2' fill={JapanesePalette.goldDim} opacity='0.65' />
        <circle cx='332' cy='12' r='1.2' fill={JapanesePalette.goldDim} opacity='0.65' />
        <line
          x1='348'
          y1='12'
          x2='380'
          y2='12'
          stroke={JapanesePalette.gold}
          strokeWidth='0.9'
          opacity='0.7'
        />
        <line
          x1='348'
          y1='12'
          x2='600'
          y2='12'
          stroke={JapanesePalette.goldDim}
          strokeWidth='0.5'
          opacity='0.5'
        />
      </svg>
    </div>
  );
}

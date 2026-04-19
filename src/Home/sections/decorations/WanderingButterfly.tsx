/** 遊蝶 — CSS-animated butterfly div that wanders across the hero */
export default function WanderingButterfly({
  animName,
  duration,
  delay,
  size = 38,
}: {
  animName: string;
  duration: string;
  delay: string;
  size?: number;
}) {
  const gid = `wbf-${animName}`;
  return (
    <div
      className='absolute top-0 left-0 pointer-events-none will-change-[transform,opacity]'
      style={{ animation: `${animName} ${duration} ease-in-out ${delay} infinite` }}
    >
      <svg
        width={size * 2.2}
        height={size * 2.2}
        viewBox='-40 -40 80 80'
        className='overflow-visible'
      >
        <defs>
          <linearGradient id={gid} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#c0a0e0' stopOpacity='0.9' />
            <stop offset='55%' stopColor='#9060c8' stopOpacity='0.65' />
            <stop offset='100%' stopColor='#e8d8ff' stopOpacity='0.38' />
          </linearGradient>
          <linearGradient id={`${gid}lo`} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#a880d0' stopOpacity='0.7' />
            <stop offset='100%' stopColor='#ddc8f8' stopOpacity='0.28' />
          </linearGradient>
        </defs>
        <path d='M 0 0 C -18 -18, -38 -8, -28 8 C -20 20, -6 12, 0 0' fill={`url(#${gid})`} />
        <path d='M 0 0 C 18 -18, 38 -8, 28 8 C 20 20, 6 12, 0 0' fill={`url(#${gid})`} />
        <path
          d='M 0 0 C -12 -10, -22 -4, -18 4'
          stroke='#c8a8f0'
          strokeWidth='0.7'
          fill='none'
          opacity='0.45'
        />
        <path
          d='M 0 0 C 12 -10, 22 -4, 18 4'
          stroke='#c8a8f0'
          strokeWidth='0.7'
          fill='none'
          opacity='0.45'
        />
        <path d='M 0 3 C -14 0, -30 12, -22 26 C -14 36, -3 24, 0 3' fill={`url(#${gid}lo)`} />
        <path d='M 0 3 C 14 0, 30 12, 22 26 C 14 36, 3 24, 0 3' fill={`url(#${gid}lo)`} />
        <ellipse cx='0' cy='9' rx='1.5' ry='8.5' fill='#a880c8' opacity='0.75' />
        <path d='M -1 -1 Q -9 -14 -8 -20' stroke='#b898d8' strokeWidth='0.9' fill='none' />
        <path d='M 1 -1 Q 9 -14 8 -20' stroke='#b898d8' strokeWidth='0.9' fill='none' />
        <circle cx='-8' cy='-20' r='1.8' fill='#b898d8' />
        <circle cx='8' cy='-20' r='1.8' fill='#b898d8' />
      </svg>
    </div>
  );
}

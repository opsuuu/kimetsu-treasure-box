/** 蝴蝶 butterfly */
export default function Butterfly({
  x,
  y,
  scale = 1,
  delay = 0,
  opacity = 0.75,
  rotate = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
  opacity?: number;
  rotate?: number;
}) {
  const gid = `bf${x}${y}`;
  return (
    <g
      transform={`translate(${x},${y}) scale(${scale}) rotate(${rotate})`}
      style={{ animation: `float 4.5s ease-in-out ${delay}s infinite`, opacity }}
    >
      <defs>
        <linearGradient id={gid} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#c0a0e0' stopOpacity='0.88' />
          <stop offset='55%' stopColor='#9870c8' stopOpacity='0.65' />
          <stop offset='100%' stopColor='#e8d8ff' stopOpacity='0.4' />
        </linearGradient>
        <linearGradient id={`${gid}lo`} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#b090d0' stopOpacity='0.7' />
          <stop offset='100%' stopColor='#ddc8f8' stopOpacity='0.3' />
        </linearGradient>
      </defs>
      <path d='M 0 0 C -18 -18, -38 -8, -28 8 C -20 20, -6 12, 0 0' fill={`url(#${gid})`} />
      <path d='M 0 0 C 18 -18, 38 -8, 28 8 C 20 20, 6 12, 0 0' fill={`url(#${gid})`} />
      <path
        d='M 0 0 C -12 -10, -22 -4, -18 4'
        stroke='#c8a8f0'
        strokeWidth='0.7'
        fill='none'
        opacity='0.5'
      />
      <path
        d='M 0 0 C 12 -10, 22 -4, 18 4'
        stroke='#c8a8f0'
        strokeWidth='0.7'
        fill='none'
        opacity='0.5'
      />
      <path d='M 0 3 C -14 0, -30 12, -22 26 C -14 36, -3 24, 0 3' fill={`url(#${gid}lo)`} />
      <path d='M 0 3 C 14 0, 30 12, 22 26 C 14 36, 3 24, 0 3' fill={`url(#${gid}lo)`} />
      <ellipse cx='0' cy='9' rx='1.5' ry='8.5' fill='#a880c8' opacity='0.75' />
      <path d='M -1 -1 Q -9 -14 -8 -20' stroke='#b898d8' strokeWidth='0.9' fill='none' />
      <path d='M 1 -1 Q 9 -14 8 -20' stroke='#b898d8' strokeWidth='0.9' fill='none' />
      <circle cx='-8' cy='-20' r='1.8' fill='#b898d8' />
      <circle cx='8' cy='-20' r='1.8' fill='#b898d8' />
    </g>
  );
}

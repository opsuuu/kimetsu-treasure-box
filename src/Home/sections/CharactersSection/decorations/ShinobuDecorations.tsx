import { Butterfly } from '../../decorations';

export default function ShinobuDecorations() {
  return (
    <>
      {/* 紫藤花 */}
      <svg
        aria-hidden
        viewBox='0 0 260 160'
        className='absolute top-0 right-0 w-[260px] h-[160px] pointer-events-none overflow-visible'
      >
        <path
          d='M 80 2 C 130 6, 190 3, 260 5'
          stroke='#8050a0'
          strokeWidth='1.2'
          fill='none'
          opacity='0.45'
        />
        {(
          [
            [90, 4, 55],
            [118, 2, 72],
            [145, 5, 48],
            [172, 3, 65],
            [198, 4, 58],
            [224, 2, 70],
            [248, 5, 44],
          ] as [number, number, number][]
        ).map(([bx, by, len], ci) => {
          const count = Math.floor(len / 9);
          return (
            <g key={ci}>
              <path
                d={`M ${bx} ${by} Q ${bx + (ci % 2 === 0 ? 3 : -3)} ${by + len * 0.5} ${bx} ${by + len}`}
                stroke='#9060b8'
                strokeWidth='0.7'
                fill='none'
                opacity='0.45'
              />
              {Array.from({ length: count }).map((_, fi) => {
                const t = (fi + 0.5) / count;
                const r = Math.max(2.8 - t * 1.0, 0.7);
                const clrs = ['#8a5eba', '#a07ad0', '#bca0e4', '#d8c4f4'];
                return (
                  <circle
                    key={fi}
                    cx={bx + Math.sin(t * Math.PI) * 3}
                    cy={by + t * len}
                    r={r}
                    fill={clrs[Math.min(fi, clrs.length - 1)]}
                    opacity={0.75 - t * 0.2}
                    style={{
                      animation: `shimmer 3s ease-in-out ${ci * 0.18 + fi * 0.08}s infinite`,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* 蝴蝶 watermarks */}
      <svg
        aria-hidden
        viewBox='0 0 100 100'
        className='absolute right-[1.2rem] bottom-[1.8rem] w-[90px] h-[90px] opacity-[0.18] pointer-events-none overflow-visible'
      >
        <Butterfly x={50} y={50} scale={2.0} delay={0} opacity={1} rotate={-5} />
      </svg>
      <svg
        aria-hidden
        viewBox='0 0 60 60'
        className='absolute left-6 top-14 w-[50px] h-[50px] opacity-[0.12] pointer-events-none overflow-visible'
      >
        <Butterfly x={30} y={30} scale={1.2} delay={1.5} opacity={1} rotate={10} />
      </svg>
    </>
  );
}

/** 紫藤花 — left-side vertical accent */
export default function WisteriaLeft() {
  const branchlets: [number, number, number][] = [
    [0, 80, 70],
    [0, 130, 55],
    [0, 185, 80],
    [0, 240, 62],
    [0, 295, 75],
    [0, 350, 58],
    [0, 405, 82],
    [0, 460, 65],
    [0, 520, 72],
    [0, 575, 52],
  ];
  return (
    <g style={{ animation: 'sway 7s ease-in-out 1s infinite', transformOrigin: '0px 300px' }}>
      <path
        d='M 0 60 C 8 200, 4 380, 0 580'
        stroke='#7040a0'
        strokeWidth='1.5'
        fill='none'
        opacity='0.4'
      />
      {branchlets.map(([_bx, by, len], ci) => {
        const count = Math.floor(len / 9);
        const branchEndX = 18 + (ci % 3) * 6;
        return (
          <g key={ci}>
            <path
              d={`M 0 ${by} Q ${branchEndX / 2} ${by - 4} ${branchEndX} ${by}`}
              stroke='#8050a8'
              strokeWidth='0.8'
              fill='none'
              opacity='0.45'
            />
            <path
              d={`M ${branchEndX} ${by} Q ${branchEndX + (ci % 2 === 0 ? 4 : -4)} ${by + len * 0.5} ${branchEndX} ${by + len}`}
              stroke='#9060b8'
              strokeWidth='0.8'
              fill='none'
              opacity='0.42'
            />
            {Array.from({ length: count }).map((_, fi) => {
              const t = (fi + 0.5) / count;
              const r = Math.max(3.0 - t * 1.0, 0.8);
              const clrs = ['#7a50b0', '#9570cc', '#b090e0', '#ccb4f0'];
              return (
                <circle
                  key={fi}
                  cx={branchEndX + Math.sin(t * Math.PI) * 3}
                  cy={by + t * len}
                  r={r}
                  fill={clrs[Math.min(fi, clrs.length - 1)]}
                  opacity={0.78 - t * 0.2}
                  style={{
                    animation: `shimmer 3.2s ease-in-out ${ci * 0.2 + fi * 0.08}s infinite`,
                  }}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** 紫藤花 wisteria — top banner, lush long clusters */
export default function WisteriaCorner() {
  const mainClusters: [number, number, number][] = [
    [10, 18, 130],
    [38, 12, 160],
    [68, 8, 145],
    [98, 14, 175],
    [128, 9, 155],
    [158, 13, 140],
    [188, 7, 180],
    [218, 11, 160],
    [248, 15, 135],
    [278, 8, 170],
    [308, 13, 150],
    [338, 10, 185],
    [368, 6, 165],
    [398, 14, 145],
    [428, 9, 178],
    [458, 12, 158],
    [488, 7, 190],
    [518, 14, 168],
    [548, 9, 148],
    [578, 11, 182],
    [608, 7, 162],
    [638, 13, 145],
    [668, 9, 175],
    [698, 11, 155],
    [728, 8, 185],
    [758, 13, 162],
    [788, 9, 145],
    [818, 12, 178],
    [848, 7, 158],
    [878, 14, 168],
    [908, 9, 185],
    [938, 11, 148],
    [968, 13, 172],
    [998, 8, 160],
    [1028, 12, 182],
    [1058, 9, 145],
    [1088, 14, 168],
    [1118, 7, 175],
    [1148, 11, 152],
    [1178, 13, 165],
    [1208, 8, 180],
    [1238, 12, 148],
    [1268, 9, 162],
    [1298, 14, 135],
    [1328, 8, 155],
    [1358, 11, 140],
    [1388, 9, 125],
    [1418, 13, 112],
    [1445, 7, 98],
  ];
  const subClusters: [number, number, number][] = [
    [24, 38, 80],
    [62, 34, 95],
    [100, 40, 75],
    [138, 32, 105],
    [176, 38, 85],
    [214, 30, 110],
    [252, 36, 90],
    [290, 32, 100],
    [328, 38, 82],
    [366, 28, 108],
    [404, 34, 92],
    [442, 30, 115],
    [480, 36, 88],
    [518, 28, 105],
    [556, 34, 92],
    [594, 30, 112],
    [632, 38, 82],
    [670, 28, 100],
    [708, 34, 90],
    [746, 32, 108],
    [784, 36, 80],
    [822, 28, 102],
    [860, 34, 88],
    [898, 30, 105],
    [936, 38, 78],
    [974, 26, 98],
    [1012, 32, 86],
    [1050, 28, 104],
    [1088, 36, 76],
    [1126, 24, 96],
    [1164, 30, 85],
    [1202, 28, 98],
    [1240, 34, 74],
    [1278, 22, 90],
    [1316, 28, 80],
    [1354, 26, 70],
    [1392, 30, 62],
    [1430, 24, 55],
  ];

  const renderCluster = (bx: number, by: number, len: number, ci: number, small = false) => {
    const count = Math.floor(len / (small ? 10 : 8));
    return (
      <g key={`${bx}-${by}`}>
        <path
          d={`M ${bx} ${by} Q ${bx + ((ci % 3) - 1) * 6} ${by + len * 0.5} ${bx + ((ci % 2) - 0.5) * 3} ${by + len}`}
          stroke='#9060b8'
          strokeWidth={small ? 0.6 : 1.0}
          fill='none'
          opacity={small ? 0.42 : 0.58}
        />
        {Array.from({ length: count }).map((_, fi) => {
          const t = (fi + 0.5) / count;
          const r = Math.max((small ? 2.2 : 3.4) - t * 1.0, 0.8);
          const clrs = ['#7a50b0', '#9570cc', '#b090e0', '#ccb4f0', '#e8dcff'];
          return (
            <circle
              key={fi}
              cx={bx + Math.sin(t * Math.PI) * (small ? 2.5 : 4.5)}
              cy={by + t * len}
              r={r}
              fill={clrs[Math.min(fi, clrs.length - 1)]}
              opacity={0.82 - t * 0.22}
              style={{ animation: `shimmer 2.8s ease-in-out ${ci * 0.12 + fi * 0.06}s infinite` }}
            />
          );
        })}
      </g>
    );
  };

  return (
    <g style={{ animation: 'sway 6s ease-in-out infinite', transformOrigin: '720px 0px' }}>
      <path
        d='M -10 16 C 200 6, 480 14, 720 8 C 960 3, 1200 12, 1460 6'
        stroke='#7040a0'
        strokeWidth='2.2'
        fill='none'
        opacity='0.55'
      />
      <path
        d='M 0 32 C 200 24, 450 36, 700 28 C 940 22, 1180 32, 1460 26'
        stroke='#6030a0'
        strokeWidth='1.2'
        fill='none'
        opacity='0.35'
      />
      <path
        d='M 60 12 C 280 6, 560 16, 840 10 C 1080 5, 1300 14, 1460 8'
        stroke='#5020a0'
        strokeWidth='0.6'
        fill='none'
        opacity='0.22'
      />
      {mainClusters.map(([bx, by, len], ci) => renderCluster(bx, by, len, ci, false))}
      {subClusters.map(([bx, by, len], ci) => renderCluster(bx, by, len, ci + 8, true))}
    </g>
  );
}

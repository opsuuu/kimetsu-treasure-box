/** 蝴蝶飛行弧線 */
export default function ButterflyArcs() {
  const arcs = [
    { d: 'M 750 500 C 820 420, 900 390, 980 430 C 1040 460, 1090 410, 1140 340', delay: 0 },
    { d: 'M 840 300 C 880 250, 940 240, 1000 270 C 1050 295, 1100 265, 1160 220', delay: 0.8 },
    { d: 'M 650 620 C 720 570, 800 555, 880 580 C 940 600, 990 565, 1060 510', delay: 1.5 },
    { d: 'M 920 650 C 970 600, 1040 585, 1110 610', delay: 0.4 },
    { d: 'M 600 380 C 660 340, 720 335, 790 355 C 840 370, 880 345, 930 300', delay: 2.0 },
  ];
  return (
    <>
      {arcs.map(({ d, delay }, i) => (
        <path
          key={i}
          d={d}
          stroke='rgba(160,120,210,0.2)'
          strokeWidth='1.3'
          fill='none'
          strokeDasharray='4 10'
          strokeLinecap='round'
          style={{ animation: `shimmer 4s ease-in-out ${delay}s infinite` }}
        />
      ))}
    </>
  );
}

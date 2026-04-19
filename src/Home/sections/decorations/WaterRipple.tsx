/** 水面漣漪 — concentric rings that expand from butterfly touch points. */
export default function WaterRipple({
  left,
  top,
  delays,
  color = 'rgba(100,160,200,0.55)',
}: {
  left: string;
  top: string;
  delays: number[];
  color?: string;
}) {
  return (
    <div
      className='absolute pointer-events-none -translate-x-1/2 -translate-y-1/2'
      style={{ left, top }}
    >
      {delays.map((d, i) => (
        <div
          key={i}
          className='absolute w-[10px] h-[10px] -mt-[5px] -ml-[5px] rounded-full origin-center'
          style={{
            border: `1.5px solid ${color}`,
            animation: `${i % 2 === 0 ? 'rippleExpand' : 'rippleExpand2'} 3.8s ease-out ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

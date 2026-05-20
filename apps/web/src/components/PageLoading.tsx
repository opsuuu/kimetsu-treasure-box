import { JapanesePalette } from '@/constants/palette';

export default function PageLoadingState() {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center gap-6 bg-washi'>
      <svg viewBox='0 0 100 28' width='100' height='28' aria-hidden>
        {([0, 38, 76] as const).map((x, i) => (
          <g key={x}>
            <path
              d={`M ${x + 12} 0 L ${x + 24} 14 L ${x + 12} 28 L ${x} 14 Z`}
              fill='none'
              stroke={JapanesePalette.gold}
              strokeWidth='0.9'
            >
              <animate
                attributeName='opacity'
                values='0.15;0.95;0.15'
                dur='1.6s'
                begin={`${i * 0.3}s`}
                repeatCount='indefinite'
              />
            </path>
            <circle cx={x + 12} cy={14} r='1.8' fill={JapanesePalette.gold}>
              <animate
                attributeName='opacity'
                values='0.1;0.85;0.1'
                dur='1.6s'
                begin={`${i * 0.3}s`}
                repeatCount='indefinite'
              />
            </circle>
          </g>
        ))}
      </svg>
      <span className='text-ink-dim text-[0.7rem] tracking-[0.5em] font-mincho'>載入中</span>
    </div>
  );
}

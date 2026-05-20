import { JapanesePalette } from '@/constants/palette';

export default function LoadingState({ message = '載入中' }: { message?: string }) {
  return (
    <div className='py-12 flex flex-col items-center gap-5'>
      <svg viewBox='0 0 60 16' width='60' height='16' aria-hidden>
        {([0, 23, 46] as const).map((x, i) => (
          <g key={x}>
            <path
              d={`M ${x + 7} 0 L ${x + 14} 8 L ${x + 7} 16 L ${x} 8 Z`}
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
            <circle cx={x + 7} cy={8} r='1.2' fill={JapanesePalette.gold}>
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
      <span className='text-ink-dim text-[0.7rem] tracking-[0.4em] font-mincho'>{message}</span>
    </div>
  );
}

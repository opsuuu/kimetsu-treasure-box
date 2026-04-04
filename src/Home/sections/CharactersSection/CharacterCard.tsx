import { cn } from '@/lib/utils';
import { JapanesePalette } from '@/constants/palette';
import type { Character } from '@/constants/characters';
import { Butterfly } from '../decorations';

const themeConfig = {
  giyu: {
    cardBg: 'bg-[linear-gradient(150deg,var(--color-washi-giyu),rgba(200,225,242,0.6))]',
    cardBorder: 'border-giyu/30',
    cardShadow: 'shadow-[0_2px_24px_rgba(100,165,210,0.1),0_1px_4px_rgba(0,0,0,0.04)]',
    nameCls: 'text-giyu',
    btnCls: 'bg-[rgba(180,220,240,0.35)] border-giyu/40 text-giyu',
    index: '壱',
    breath: '水の呼吸',
  },
  shinobu: {
    cardBg: 'bg-[linear-gradient(150deg,var(--color-washi-shinobu),rgba(230,210,250,0.6))]',
    cardBorder: 'border-shinobu/30',
    cardShadow: 'shadow-[0_2px_24px_rgba(160,130,210,0.1),0_1px_4px_rgba(0,0,0,0.04)]',
    nameCls: 'text-shinobu',
    btnCls: 'bg-[rgba(220,200,248,0.35)] border-shinobu/40 text-shinobu',
    index: '弐',
    breath: '蟲の呼吸',
  },
} as const;

type Theme = keyof typeof themeConfig;

interface CharacterCardProps {
  character: Character;
}

function GiyuDecorations() {
  return (
    <>
      {/* 幾何柄 (立方體幾何紋) watermark */}
      <svg
        aria-hidden
        viewBox='0 0 140 140'
        className='absolute left-0 bottom-0 w-[140px] h-[140px] pointer-events-none opacity-[0.13] overflow-hidden'
      >
        {Array.from({ length: 17 }, (_, b) =>
          (b % 2 === 0 ? [0, 56, 112] : [28, 84, 140]).map((cx) => ({
            cx,
            cy: 8 * (b + 2),
          })),
        )
          .flat()
          .flatMap(({ cx, cy }) => [
            <polygon
              key={`t${cx}${cy}`}
              points={`${cx},${cy - 16} ${cx + 14},${cy - 8} ${cx},${cy} ${cx - 14},${cy - 8}`}
              fill='#d07830'
              stroke='#7a3808'
              strokeWidth='0.6'
            />,
            <polygon
              key={`l${cx}${cy}`}
              points={`${cx - 14},${cy - 8} ${cx},${cy} ${cx - 14},${cy + 8} ${cx - 28},${cy}`}
              fill='#1a6850'
              stroke='#0a2820'
              strokeWidth='0.6'
            />,
            <polygon
              key={`r${cx}${cy}`}
              points={`${cx},${cy} ${cx + 14},${cy - 8} ${cx + 28},${cy} ${cx + 14},${cy + 8}`}
              fill='#2a8868'
              stroke='#0a2820'
              strokeWidth='0.6'
            />,
          ])}
      </svg>

      {/* 水紋 arc */}
      <svg
        aria-hidden
        viewBox='0 0 260 220'
        className='absolute top-[-5px] right-40 w-[260px] h-[220px] pointer-events-none overflow-visible'
      >
        <defs>
          <linearGradient id='cg1' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor={JapanesePalette.gBlue} stopOpacity='0' />
            <stop offset='40%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.45' />
            <stop offset='100%' stopColor={JapanesePalette.gBlueLight} stopOpacity='0.05' />
          </linearGradient>
          <linearGradient id='cg2' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
            <stop offset='50%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0.28' />
            <stop offset='100%' stopColor={JapanesePalette.gBlueMid} stopOpacity='0' />
          </linearGradient>
        </defs>
        <path
          d='M 260 10 C 210 40, 180 80, 200 130 C 215 165, 240 185, 255 215'
          stroke='url(#cg1)'
          strokeWidth='2.4'
          fill='none'
          strokeLinecap='round'
          strokeDasharray='300'
          strokeDashoffset='300'
          style={{ animation: 'waterDraw 2.5s cubic-bezier(0.4,0,0.2,1) 0.8s forwards' }}
        />
        <path
          d='M 260 24 C 218 52, 192 90, 210 138 C 224 172, 248 192, 260 218'
          stroke='url(#cg2)'
          strokeWidth='1.3'
          fill='none'
          strokeLinecap='round'
          strokeDasharray='300'
          strokeDashoffset='300'
          style={{ animation: 'waterDraw 2.8s cubic-bezier(0.4,0,0.2,1) 1s forwards' }}
        />
        {(
          [
            [232, 70],
            [218, 108],
            [224, 148],
            [242, 182],
          ] as [number, number][]
        ).map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i % 2 === 0 ? 2.2 : 1.5}
            fill={JapanesePalette.gBlueMid}
            opacity='0'
            style={{ animation: `shimmer 2.5s ease-in-out ${0.8 + i * 0.3}s infinite` }}
          />
        ))}
      </svg>
    </>
  );
}

function ShinobuDecorations() {
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

export default function CharacterCard({ character }: CharacterCardProps) {
  const theme = character.theme as Theme;
  const t = themeConfig[theme];

  return (
    <div
      className={cn(
        'relative overflow-hidden border outline outline-gold/18 outline-offset-4',
        'px-[2.2rem] pt-[2.8rem] pb-[2.2rem]',
        t.cardBorder,
        t.cardBg,
        t.cardShadow,
      )}
    >
      {/* 上方金色線條 */}
      <div className='absolute top-0 left-0 right-0 h-px bg-[linear-gradient(to_right,transparent,var(--color-gold),transparent)] opacity-55' />

      {theme === 'giyu' ? <GiyuDecorations /> : <ShinobuDecorations />}

      {/* image */}
      <img
        src={character.image}
        alt={character.name}
        aria-hidden
        className='absolute right-0 bottom-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none opacity-30 mask-[linear-gradient(to_right,transparent,black_35%)]'
      />

      {/* 卡片內容 */}
      <div className='relative z-1'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-[0.55rem] text-gold font-mincho'>{t.index}</span>
          <div className='h-px w-6 bg-[linear-gradient(to_right,var(--color-gold-dim),transparent)]' />
          <span className='text-[0.55rem] tracking-[0.4em] text-gold-dim uppercase'>
            {t.breath}
          </span>
        </div>

        <h3
          className={cn(
            'text-[1.9rem] font-normal tracking-[0.22em] m-0 mb-[0.3rem] font-mincho',
            t.nameCls,
          )}
        >
          {character.name}
        </h3>

        <p className='text-[0.65rem] text-ink-dim tracking-[0.2em] mb-[1.8rem] font-sans'>
          {character.sub}
        </p>

        <p className='text-[0.78rem] text-ink-mid leading-[2.1] mb-8 font-mincho'>
          {character.description.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line.trim()}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>

        <button
          className={cn(
            'border outline outline-gold/18 outline-offset-3',
            'px-6 py-[0.6rem] rounded-none text-[0.72rem] tracking-[0.22em] cursor-pointer font-mincho',
            t.btnCls,
          )}
        >
          〔　查看周邊　〕
        </button>
      </div>
    </div>
  );
}

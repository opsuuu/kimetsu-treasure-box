import { useNavigate } from 'react-router';
import { NoshiOrnament, TraditionalDivider } from '@/components';
import Butterfly from '@/Home/sections/decorations/Butterfly';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='bg-washi text-ink font-mincho min-h-screen flex flex-col items-center justify-center relative overflow-hidden'>
      {/* 背景裝飾 — 水紋弧線 */}
      <svg
        aria-hidden
        className='absolute inset-0 w-full h-full pointer-events-none'
        viewBox='0 0 1440 900'
        preserveAspectRatio='xMidYMid slice'
      >
        <defs>
          <linearGradient id='nf-wg' x1='0%' y1='100%' x2='80%' y2='0%'>
            <stop offset='0%' stopColor='#6aa0c0' stopOpacity='0' />
            <stop offset='40%' stopColor='#3d7ca8' stopOpacity='0.18' />
            <stop offset='100%' stopColor='#b8d8ec' stopOpacity='0' />
          </linearGradient>
        </defs>
        <path
          d='M -20 920 C 80 780, 160 620, 260 470 C 340 350, 430 240, 560 130 C 640 68, 720 30, 820 8'
          stroke='url(#nf-wg)'
          strokeWidth='2.5'
          fill='none'
          strokeLinecap='round'
          opacity='0.6'
        />
        <path
          d='M -20 880 C 60 745, 140 585, 240 440 C 320 325, 415 218, 545 112'
          stroke='url(#nf-wg)'
          strokeWidth='1.4'
          fill='none'
          strokeLinecap='round'
          opacity='0.4'
        />
      </svg>

      {/* 右側漂浮蝴蝶 */}
      <svg
        aria-hidden
        viewBox='0 0 120 120'
        className='absolute right-16 top-1/3 w-[100px] h-[100px] pointer-events-none opacity-20'
      >
        <Butterfly x={60} y={60} scale={1.8} delay={0} opacity={1} rotate={-8} />
      </svg>
      <svg
        aria-hidden
        viewBox='0 0 80 80'
        className='absolute left-20 bottom-1/3 w-[64px] h-[64px] pointer-events-none opacity-15'
      >
        <Butterfly x={40} y={40} scale={1.2} delay={2} opacity={1} rotate={12} />
      </svg>

      {/* 主要內容 */}
      <div
        className='relative z-10 flex flex-col items-center text-center px-6'
        style={{ animation: 'fadeUp 1s ease 0.2s both' }}
      >
        {/* 眉標 */}
        <div className='flex items-center gap-[0.9rem] mb-6'>
          <NoshiOrnament size={16} />
          <span className='text-[0.58rem] tracking-[0.55em] text-gold-dim uppercase'>
            鬼滅之刃　周邊圖鑑
          </span>
          <NoshiOrnament size={16} />
        </div>

        {/* 四〇四 */}
        <p
          className='font-mincho font-normal tracking-[0.25em] leading-none text-gold m-0 mb-4'
          style={{ fontSize: 'clamp(4rem, 14vw, 9rem)' }}
        >
          四〇四
        </p>

        <div className='w-full max-w-[320px] mb-4'>
          <TraditionalDivider />
        </div>

        {/* 標題 */}
        <h1
          className='font-mincho font-normal tracking-[0.35em] text-ink m-0 mb-3'
          style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}
        >
          迷　途
        </h1>

        {/* 副標 */}
        <p className='text-[0.78rem] text-ink-mid leading-[2.2] mb-2 max-w-[300px]'>
          您尋訪的頁面已不存在
        </p>
        <p className='text-[0.62rem] text-ink-dim tracking-[0.3em] mb-10'>
          The page you were looking for could not be found.
        </p>

        <button
          onClick={() => navigate('/')}
          className='border border-gold/40 outline outline-gold/18 outline-offset-3 bg-[rgba(201,168,76,0.08)] text-gold-dim px-8 py-3 rounded-none text-[0.75rem] tracking-[0.3em] cursor-pointer font-mincho transition-colors duration-200 hover:bg-[rgba(201,168,76,0.16)]'
        >
          〔　返回首頁　〕
        </button>
      </div>

      {/* footer */}
      <div className='absolute bottom-6 w-full flex flex-col items-center gap-2 pointer-events-none'>
        <div className='h-px w-48 bg-[linear-gradient(to_right,transparent,var(--color-gold-dim),transparent)] opacity-40' />
        <span className='text-[0.5rem] tracking-[0.4em] text-ink-faint'>義忍同好製作委員會</span>
      </div>
    </div>
  );
}

import { Link } from 'react-router';
import { NoshiOrnament } from '@/components';
import { ROUTES } from '@/routers/paths';
import HeroVisual from './visuals/HeroVisual';

export default function HeroSection() {
  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center overflow-hidden'>
      <HeroVisual />

      {/* Hero content */}
      <div
        className='relative z-10 flex flex-col items-center px-6 text-center'
        style={{ animation: 'fadeUp 1.2s ease 0.4s both' }}
      >
        {/* Eyebrow + noshi */}
        <div className='flex items-center gap-[0.9rem] mb-[1.8rem]'>
          <NoshiOrnament size={18} />
          <span className='text-[0.62rem] tracking-[0.55em] text-gold-dim uppercase'>
            鬼滅之刃　周邊圖鑑
          </span>
          <NoshiOrnament size={18} />
        </div>

        {/* Title */}
        <div className='relative px-12 pt-8 pb-[1.8rem] mb-[1.2rem]'>
          <h1
            className='font-mincho font-normal tracking-[0.18em] leading-none m-0'
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)' }}
          >
            <span className='text-giyu'>義勇</span>
            <span className='text-gold mx-[0.5em] align-middle' style={{ fontSize: '0.38em' }}>
              ×
            </span>
            <span className='text-shinobu'>忍</span>
          </h1>
          <div className='flex items-center gap-[0.8rem] mt-4'>
            <div className='h-px flex-1 bg-[linear-gradient(to_right,transparent,var(--color-gold-dim))]' />
            <span className='text-[0.6rem] tracking-[0.35em] text-gold-dim whitespace-nowrap font-mincho'>
              富岡 義勇　·　胡蝶 忍
            </span>
            <div className='h-px flex-1 bg-[linear-gradient(to_left,transparent,var(--color-gold-dim))]' />
          </div>
        </div>

        {/* Subtitle */}
        <p className='text-[0.82rem] text-ink-mid leading-[2.4] mb-[2.4rem] max-w-[360px] font-mincho tracking-[2px]'>
          集結水柱與蟲柱的周邊收藏
          <br />
          <span className='text-[0.72rem] text-ink-dim tracking-[0.25em]'>
            壓克力立牌　徽章　吊飾　小卡
          </span>
        </p>

        {/* CTA buttons */}
        <div className='flex gap-[1.2rem] flex-wrap justify-center'>
          <Link
            to={ROUTES.ITEMS}
            state={{ character: 'giyu' }}
            className='min-w-56 text-center bg-[linear-gradient(135deg,rgba(200,225,240,0.7),rgba(170,210,235,0.5))] border border-giyu/45 outline outline-gold/18 outline-offset-3 text-giyu px-8 py-3 rounded-none text-[0.78rem] tracking-[0.25em] cursor-pointer backdrop-blur-[6px] font-mincho no-underline'
          >
            〔　探索義勇周邊　〕
          </Link>
          <Link
            to={ROUTES.ITEMS}
            state={{ character: 'shinobu' }}
            className='min-w-56 text-center bg-[linear-gradient(135deg,rgba(228,215,248,0.7),rgba(210,190,240,0.5))] border border-shinobu/45 outline outline-gold/18 outline-offset-3 text-shinobu px-8 py-3 rounded-none text-[0.78rem] tracking-[0.25em] cursor-pointer backdrop-blur-[6px] font-mincho no-underline'
          >
            〔　探索忍周邊　〕
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-8 flex flex-col items-center gap-2'>
        <span className='text-[0.55rem] tracking-[0.4em] text-ink-faint font-mincho'>下へ</span>
        <div
          className='w-px h-11 bg-[linear-gradient(to_bottom,var(--color-gold-dim),transparent)]'
          style={{ animation: 'scrollPulse 2.5s ease-in-out infinite' }}
        />
      </div>
    </section>
  );
}

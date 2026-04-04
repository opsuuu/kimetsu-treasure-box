import { TraditionalDivider } from '@/components';
import HeroSection from './sections/HeroSection';
import CharacterSection from './sections/CharactersSection';
import CategorySection from './sections/CategorySection';

export default function Home() {
  return (
    <div className='bg-washi text-ink font-mincho'>
      {/* 壱 HERO */}
      <HeroSection />
      {/* 弐 CHARACTER CARDS */}
      <CharacterSection />
      <div className='px-8'>
        <TraditionalDivider />
      </div>
      {/* 参 CATEGORIES */}
      <CategorySection />
      {/* Footer divider */}
      <footer>
        <div className='h-px mx-8 mb-3 bg-[linear-gradient(to_right,transparent,var(--color-gold-dim),#b08ad855,transparent)] text-center' />
        <div className='text-center pb-3 text-sm text-ink-faint'>
          Copyright © 2026 義忍同好製作委員會
        </div>
      </footer>
    </div>
  );
}

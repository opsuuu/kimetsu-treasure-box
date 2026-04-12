import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import type { Character } from '@/services/characters';
import { ROUTES } from '@/routers/paths';
import { characterThemes, defaultCharacterTheme, KANJI_ORDINALS } from '@/constants/characterThemes';
import { GiyuDecorations, ShinobuDecorations } from './decorations';

interface CharacterCardProps {
  character: Character;
}

const decorationMap: Record<string, React.FC> = {
  giyu: GiyuDecorations,
  shinobu: ShinobuDecorations,
};

export default function CharacterCard({ character }: CharacterCardProps) {
  const slug = character.slug;
  const t = characterThemes[slug] ?? defaultCharacterTheme;
  const Decoration = decorationMap[slug] ?? null;
  const ordinal = KANJI_ORDINALS[character.display_order ?? 0] ?? '';

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

      {Decoration && <Decoration />}

      {/* image */}
      <img
        src={character.image_url ?? ''}
        alt={character.name}
        aria-hidden
        className='absolute right-0 bottom-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none opacity-30 mask-[linear-gradient(to_right,transparent,black_35%)]'
      />

      {/* 卡片內容 */}
      <div className='relative z-1'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-[0.55rem] text-gold font-mincho'>{ordinal}</span>
          <div className='h-px w-6 bg-[linear-gradient(to_right,var(--color-gold-dim),transparent)]' />
          <span className='text-[0.55rem] tracking-[0.4em] text-gold-dim uppercase'>
            {character.sub_name}
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
          {character.name_en}
        </p>

        <p className='text-[0.78rem] text-ink-mid leading-[2.1] mb-8 font-mincho'>
          {(character.description ?? '').split('\n').map((line, i, arr) => (
            <span key={i}>
              {line.trim()}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>

        <Link
          to={ROUTES.ITEMS_BY_CHARACTER(character.slug)}
          className={cn(
            'border outline outline-gold/18 outline-offset-3 no-underline',
            'px-6 py-[0.6rem] rounded-none text-[0.72rem] tracking-[0.22em] cursor-pointer font-mincho',
            t.btnCls,
          )}
        >
          〔　查看周邊　〕
        </Link>
      </div>
    </div>
  );
}

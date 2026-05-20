export type CharacterTheme = {
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  nameCls: string;
  btnCls: string;
};

export const KANJI_ORDINALS: Record<number, string> = {
  1: '壱',
  2: '弐',
  3: '参',
  4: '肆',
  5: '伍',
  6: '陸',
  7: '柒',
  8: '捌',
  9: '玖',
  10: '拾',
};

export const defaultCharacterTheme: CharacterTheme = {
  cardBg: 'bg-[linear-gradient(150deg,var(--color-washi),rgba(220,215,205,0.6))]',
  cardBorder: 'border-gold/20',
  cardShadow: 'shadow-[0_2px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]',
  nameCls: 'text-ink',
  btnCls: 'bg-[rgba(201,168,76,0.12)] border-gold/35 text-gold-dim',
};

export const characterThemes: Record<string, CharacterTheme> = {
  giyu: {
    cardBg: 'bg-[linear-gradient(150deg,var(--color-washi-giyu),rgba(200,225,242,0.6))]',
    cardBorder: 'border-giyu/30',
    cardShadow: 'shadow-[0_2px_24px_rgba(100,165,210,0.1),0_1px_4px_rgba(0,0,0,0.04)]',
    nameCls: 'text-giyu',
    btnCls: 'bg-[rgba(180,220,240,0.35)] border-giyu/40 text-giyu',
  },
  shinobu: {
    cardBg: 'bg-[linear-gradient(150deg,var(--color-washi-shinobu),rgba(230,210,250,0.6))]',
    cardBorder: 'border-shinobu/30',
    cardShadow: 'shadow-[0_2px_24px_rgba(160,130,210,0.1),0_1px_4px_rgba(0,0,0,0.04)]',
    nameCls: 'text-shinobu',
    btnCls: 'bg-[rgba(220,200,248,0.35)] border-shinobu/40 text-shinobu',
  },
};

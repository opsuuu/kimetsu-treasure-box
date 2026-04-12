export const CHARACTERS = [
  {
    id: 'giyu',
    name: '富岡 義勇',
    sub: 'Tomioka Giyu',
    description: `水柱・冷靜沉默的劍士
  不要哭，不要絕望。憤怒吧！無法原諒的，那股強大又純粹的憤怒，是讓自己往前邁進，無可撼動的原動力。`,
    image: '/giyu/main-pic-removebg.png',
    theme: 'giyu',
  },
  {
    id: 'shinobu',
    name: '胡蝶 忍',
    sub: 'Kocho Shinobu',
    description: `蟲柱・帶著微笑的用毒劍士
  我原本深信幸福的道路會一直延伸到很遠的地方。當它遭到破壞之後才首次驚覺⋯那種幸福是放在很薄的玻璃之上。`,
    image: '/shinobu/main-pic-removebg.png',
    theme: 'shinobu',
  },
] as const satisfies readonly {
  id: string;
  theme: string;
  name: string;
  sub: string;
  description: string;
  image: string;
}[];

export type Character = (typeof CHARACTERS)[number];
export type CharacterId = (typeof CHARACTERS)[number]['id'];

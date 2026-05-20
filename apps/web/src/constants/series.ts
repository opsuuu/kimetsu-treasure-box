export interface Series {
  id: string;
  name_jp: string;
  name_tw: string;
  start_date: string;
  source: string;
}

export const SERIES: Series[] = [
  {
    id: 'ufotable-birthday-2024',
    name_jp: '2024 誕生祭系列',
    name_tw: '2024 生日系列',
    start_date: '2024',
    source: 'ufotable',
  },
  {
    id: 'ufotable-birthday-2025',
    name_jp: '2025 誕生祭系列',
    name_tw: '2025 生日系列',
    start_date: '2025',
    source: 'ufotable',
  },
  {
    id: 'ufotable-birthday-2026',
    name_jp: '2026 誕生祭系列',
    name_tw: '2026 生日系列',
    start_date: '2026',
    source: 'ufotable',
  },
  {
    id: 'kimetsu-no-yaiba-meiji-mura-special-mission-log',
    name_jp: '鬼滅の刃×博物館 明治村 明治村特別任務録',
    name_tw: '鬼滅之刃博物館 明治村 明治村特別任務日誌',
    start_date: '2026',
    source: '中外鉱業株式会社',
  },
];

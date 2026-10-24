type TagTheme = {
  border: string;
  bg: string;
  text: string;
};

export const CHARACTER_TAG_THEMES: Record<string, TagTheme> = {
  giyu:    { border: "border-giyu/30",    bg: "bg-giyu/10",    text: "text-giyu" },
  shinobu: { border: "border-shinobu/30", bg: "bg-shinobu/10", text: "text-shinobu" },
};

export const DEFAULT_TAG_THEME: TagTheme = {
  border: "border-gray-200",
  bg:     "bg-gray-50",
  text:   "text-gray-600",
};

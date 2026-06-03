import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { CHARACTER_TAG_THEMES, DEFAULT_TAG_THEME } from "@/config/characterThemes";
import type { AdminItem } from "@/services/items";

interface Props {
  characters: AdminItem["item_characters"];
}

export function CharacterTags({ characters }: Props) {
  if (characters.length === 0) return <span className="text-gray-300">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {characters.map(({ characters: char }) => {
        if (!char) return null;
        const theme = CHARACTER_TAG_THEMES[char.slug] ?? DEFAULT_TAG_THEME;
        return (
          <Badge
            key={char.id}
            variant="outline"
            className={cn(theme.border, theme.bg, theme.text)}
          >
            {char.name}
          </Badge>
        );
      })}
    </div>
  );
}

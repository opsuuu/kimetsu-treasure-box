const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 把搜尋詞在文字中的位置標成黃底 */
export function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        // split 搭配捕獲群組時，奇數位置是命中的部分
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-yellow-200/80 px-px text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

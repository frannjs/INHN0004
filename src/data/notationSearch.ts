import type { GlobalSymbolEntry } from './notation';

export function matchesNotation(entry: GlobalSymbolEntry, query: string): boolean {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = [entry.part, entry.tex, entry.name, entry.meaning, ...entry.aliases]
    .join(' ').toLocaleLowerCase();
  const tokens = text.match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.every((word) => {
    if (/^[a-z0-9]+$/.test(word)) {
      // Keep short names exact: "big U" must not match "ambiguous" and "use".
      return tokens.some((token) => word.length <= 2 ? token === word : token.startsWith(word));
    }
    return text.includes(word);
  });
}

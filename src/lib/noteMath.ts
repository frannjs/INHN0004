export interface NoteMath {
  start: number;
  end: number;
  math: string;
  display: boolean;
}

interface SourceRange { start: number; end: number }
type Delimiter = 'single-dollar' | 'double-dollar' | 'parentheses' | 'brackets';

function fencedCodeRanges(source: string): SourceRange[] {
  const ranges: SourceRange[] = [];
  let open: { start: number; marker: string; length: number } | undefined;
  for (const match of source.matchAll(/^ {0,3}(\x60{3,}|~{3,})([^\r\n]*)$/gm)) {
    const [line, marks, rest] = match;
    if (open) {
      if (marks[0] === open.marker && marks.length >= open.length && !rest.trim()) {
        ranges.push({ start: open.start, end: match.index + line.length });
        open = undefined;
      }
    } else if (marks[0] !== '\x60' || !rest.includes('\x60')) {
      open = { start: match.index, marker: marks[0], length: marks.length };
    }
  }
  if (open) ranges.push({ start: open.start, end: source.length });
  return ranges;
}

function inlineCodeEnds(source: string) {
  const ends = new Map<number, number>();
  const nextByLength = new Map<number, number>();
  // Pairs use runs of equal length. Compute links once, even for unmatched openers.
  const runs = [...source.matchAll(/\x60+|\r?\n[ \t]*\r?\n/g)];
  for (const match of runs.reverse()) {
    const run = match[0];
    if (run[0] !== '\x60') {
      nextByLength.clear();
      continue;
    }
    const next = nextByLength.get(run.length);
    if (next !== undefined) ends.set(match.index, next + run.length);
    nextByLength.set(run.length, match.index);
  }
  return ends;
}

/** Locate math delimited in pasted prose without modifying its source. */
export function findNoteMath(source: string): NoteMath[] {
  const candidates: NoteMath[] = [];
  const openers = new Map<Delimiter, number>();
  const fences = fencedCodeRanges(source);
  const codeEnds = inlineCodeEnds(source);
  const currencyAmount = /\d+(?:[.,]\d+)*(?=[ \t]+[A-Za-z]{2})/y;
  let fenceIndex = 0;

  function pair(kind: Delimiter, index: number, width: number, canOpen: boolean, canClose: boolean) {
    const start = openers.get(kind);
    if (canClose && start !== undefined) {
      openers.delete(kind);
      const math = source.slice(start + width, index).trim();
      if (math) {
        candidates.push({ start, end: index + width, math, display: kind === 'double-dollar' || kind === 'brackets' });
        return;
      }
    }
    if (canOpen) openers.set(kind, index);
  }

  for (let index = 0; index < source.length;) {
    const fence = fences[fenceIndex];
    if (fence && index >= fence.start) {
      openers.clear();
      index = fence.end;
      fenceIndex++;
      continue;
    }

    const char = source[index];
    const next = source[index + 1];
    if (char === '\\') {
      if (next === '(' || next === ')') pair('parentheses', index, 2, next === '(', next === ')');
      if (next === '[' || next === ']') pair('brackets', index, 2, next === '[', next === ']');
      index += 2;
      continue;
    }
    if (char === '\x60') {
      const end = codeEnds.get(index);
      if (end !== undefined && (!fence || end <= fence.start)) {
        openers.clear();
        index = end;
      } else {
        do { index++; } while (source[index] === '\x60');
      }
      continue;
    }
    if (char === '$') {
      let end = index + 1;
      while (source[end] === '$') end++;
      if (end - index === 2) pair('double-dollar', index, 2, true, true);
      if (end - index === 1) {
        const before = source[index - 1];
        currencyAmount.lastIndex = end;
        const canOpen = !!next && !/\s/u.test(next) && !currencyAmount.test(source);
        const canClose = !!before && !/\s/u.test(before) && !/\d/u.test(next ?? '');
        pair('single-dollar', index, 1, canOpen, canClose);
      }
      index = end;
      continue;
    }
    if (char === '\r' || char === '\n') {
      openers.delete('parentheses');
      openers.delete('single-dollar');
    }
    index++;
  }

  // A complete outer formula owns any delimiter-looking text inside it.
  const matches: NoteMath[] = [];
  for (const token of candidates.sort((a, b) => a.start - b.start)) {
    if (token.start >= (matches.at(-1)?.end ?? 0)) matches.push(token);
  }
  return matches;
}

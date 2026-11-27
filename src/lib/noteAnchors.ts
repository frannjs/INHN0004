export interface TextAnchor {
  quote: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
}

interface Point { node: Text; offset: number }
interface Character { start: Point; end: Point }
export interface ReadingText { text: string; characters: Character[] }

// Read the visible KaTeX HTML once, excluding its hidden MathML copy and controls.
export const ignoredReadingContent = 'button,input,textarea,select,option,script,style,svg,.katex-mathml,.sr-only,[hidden],[data-note-ui]';

export function indexReadingText(root: HTMLElement): ReadingText {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node.parentElement?.closest(ignoredReadingContent)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const characters: Character[] = [];
  const output: string[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    const value = text.data;
    for (let offset = 0; offset < value.length; offset++) {
      const character = /\s/u.test(value[offset]) ? ' ' : value[offset];
      if (character === ' ' && output[output.length - 1] === ' ') {
        characters[characters.length - 1].end = { node: text, offset: offset + 1 };
        continue;
      }
      output.push(character);
      characters.push({ start: { node: text, offset }, end: { node: text, offset: offset + 1 } });
    }
  }
  return { text: output.join(''), characters };
}

function lowerBound(length: number, predicate: (index: number) => boolean) {
  let left = 0;
  let right = length;
  while (left < right) {
    const middle = (left + right) >>> 1;
    if (predicate(middle)) right = middle;
    else left = middle + 1;
  }
  return left;
}

export function anchorFromRange(root: HTMLElement, range: Range, index = indexReadingText(root)): TextAnchor | null {
  if (range.collapsed || !root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  if (range.startContainer.parentElement?.closest(ignoredReadingContent) || range.endContainer.parentElement?.closest(ignoredReadingContent)) return null;
  const { text, characters } = index;
  let start = lowerBound(characters.length, (i) => range.comparePoint(characters[i].start.node, characters[i].start.offset) >= 0);
  let end = lowerBound(characters.length, (i) => range.comparePoint(characters[i].end.node, characters[i].end.offset) > 0);
  while (start < end && text[start] === ' ') start++;
  while (end > start && text[end - 1] === ' ') end--;
  if (end <= start) return null;
  return {
    quote: text.slice(start, end),
    prefix: Array.from(text.slice(0, start)).slice(-64).join(''),
    suffix: Array.from(text.slice(end)).slice(0, 64).join(''),
    start,
    end,
  };
}

function commonSuffixLength(a: string, b: string) {
  const left = Array.from(a);
  const right = Array.from(b);
  let matched = 0;
  while (matched < left.length && matched < right.length &&
    left[left.length - 1 - matched] === right[right.length - 1 - matched]) {
    matched++;
  }
  return matched;
}

function commonPrefixLength(a: string, b: string) {
  const left = Array.from(a);
  const right = Array.from(b);
  let matched = 0;
  while (matched < left.length && matched < right.length && left[matched] === right[matched]) {
    matched++;
  }
  return matched;
}

export function rangeFromAnchor(root: HTMLElement, anchor: TextAnchor, index = indexReadingText(root)): Range | null {
  if (!anchor.quote) return null;
  const candidates: number[] = [];
  for (let at = index.text.indexOf(anchor.quote); at >= 0; at = index.text.indexOf(anchor.quote, at + 1)) candidates.push(at);
  if (!candidates.length) return null;
  const matchesPrefix = (start: number) =>
    index.text.slice(Math.max(0, start - anchor.prefix.length), start) === anchor.prefix;
  const matchesSuffix = (start: number) =>
    index.text.slice(start + anchor.quote.length, start + anchor.quote.length + anchor.suffix.length) === anchor.suffix;
  const contextual = candidates.filter((start) => matchesPrefix(start) && matchesSuffix(start));
  // Never silently highlight the wrong occurrence of a repeated phrase.
  let start: number | null = contextual.length === 1 ? contextual[0]
    : contextual.includes(anchor.start) ? anchor.start
    : candidates.length === 1 ? candidates[0] : null;
  if (start === null && candidates.length > 1) {
    const prefixOnly = anchor.prefix.length >= 16 ? candidates.filter(matchesPrefix) : [];
    const suffixOnly = anchor.suffix.length >= 16 ? candidates.filter(matchesSuffix) : [];
    if (prefixOnly.length === 1) start = prefixOnly[0];
    else if (prefixOnly.includes(anchor.start)) start = anchor.start;
    else if (suffixOnly.length === 1) start = suffixOnly[0];
    else if (suffixOnly.includes(anchor.start)) start = anchor.start;
    else {
      const scored = candidates.map((candidate) => ({
        candidate,
        score: commonSuffixLength(index.text.slice(Math.max(0, candidate - 96), candidate), anchor.prefix) +
          commonPrefixLength(index.text.slice(candidate + anchor.quote.length, candidate + anchor.quote.length + 96), anchor.suffix),
      })).sort((a, b) => b.score - a.score);
      if (scored[0].score >= 24 && scored[0].score - scored[1].score >= 16) start = scored[0].candidate;
    }
  }
  if (start === null) return null;
  const first = index.characters[start];
  const last = index.characters[start + anchor.quote.length - 1];
  if (!first || !last) return null;
  const range = document.createRange();
  range.setStart(first.start.node, first.start.offset);
  range.setEnd(last.end.node, last.end.offset);
  return range;
}

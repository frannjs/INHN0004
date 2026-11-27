import { ignoredReadingContent } from './noteAnchors';

const textBlock = 'p,li,blockquote,h1,h2,h3,h4,h5,h6,td,th,figcaption';
const interactive = ignoredReadingContent + ',a,[contenteditable]';

/** KaTeX's layout can interrupt the browser's native word and paragraph boundaries. */
export function readingClickRange(article: HTMLElement, target: Element, clicks: number): Range | null {
  if (!article.contains(target) || target.closest(interactive)) return null;

  const unit = clicks === 2 ? target.closest('.katex')?.querySelector('.katex-html')
    : clicks === 3 ? target.closest(textBlock) : null;
  if (!unit || !article.contains(unit)) return null;

  const range = article.ownerDocument.createRange();
  range.selectNodeContents(unit);
  // A list item's label is its own unit. Nested items can be selected separately.
  const nestedList = unit.matches('li') && Array.from(unit.children).find((element) => element.matches('ul,ol'));
  if (nestedList) range.setEndBefore(nestedList);
  return range.collapsed ? null : range;
}

export function readingCaretAtPoint(article: HTMLElement, x: number, y: number) {
  const document = article.ownerDocument;
  const hit = document.elementFromPoint(x, y);
  if (!hit || !article.contains(hit) || hit.closest(interactive)) return null;
  const position = document.caretPositionFromPoint?.(x, y);
  const range = position ? null : document.caretRangeFromPoint?.(x, y);
  const node = position?.offsetNode ?? range?.startContainer;
  if (!node || !article.contains(node) || node.parentElement?.closest(interactive)) return null;
  return { node, offset: position?.offset ?? range?.startOffset ?? 0 };
}

import { ignoredReadingContent } from './noteAnchors';

interface Edges { left: number; top: number; right: number; bottom: number }
export interface NoteBand { left: number; top: number; width: number; height: number }

const clips = (overflow: string) => /^(auto|scroll|hidden|clip|overlay)$/.test(overflow);

function coversMathBase(range: Range, base: Element) {
  const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const start = text.data.search(/\S/u);
    if (start < 0 || text.parentElement?.closest(ignoredReadingContent)) continue;
    if (range.comparePoint(text, start) !== 0 || range.comparePoint(text, text.data.trimEnd().length) !== 0) return false;
  }
  return true;
}

export function measureNoteBands(article: HTMLElement, range: Range): NoteBand[] {
  const articleBox = article.getBoundingClientRect();
  const articleBounds = { left: articleBox.left, right: articleBox.right, top: articleBox.top, bottom: articleBox.bottom };
  const styles = new Map<HTMLElement, CSSStyleDeclaration>();
  const bounds = new Map<HTMLElement, Edges>();
  const flows = new Map<HTMLElement, HTMLElement>();
  const fragments = new Map<HTMLElement, { box: Edges; clip: Edges }[]>();
  const formulaBoxes = new Map<Element, { box: DOMRect; whole: boolean }>();
  const leaf = document.createRange();

  function styleOf(element: HTMLElement) {
    const cached = styles.get(element);
    if (cached) return cached;
    const style = getComputedStyle(element);
    styles.set(element, style);
    return style;
  }

  function clipAt(element: HTMLElement): Edges {
    if (element === article || !element.parentElement) return articleBounds;
    const cached = bounds.get(element);
    if (cached) return cached;
    const outer = clipAt(element.parentElement);
    const style = styleOf(element);
    const clipX = clips(style.overflowX);
    const clipY = clips(style.overflowY);
    if (!clipX && !clipY) {
      bounds.set(element, outer);
      return outer;
    }
    const box = element.getBoundingClientRect();
    const left = box.left + element.clientLeft;
    const top = box.top + element.clientTop;
    const clipped = {
      left: clipX ? Math.max(outer.left, left) : outer.left,
      right: clipX ? Math.min(outer.right, left + element.clientWidth) : outer.right,
      top: clipY ? Math.max(outer.top, top) : outer.top,
      bottom: clipY ? Math.min(outer.bottom, top + element.clientHeight) : outer.bottom,
    };
    bounds.set(element, clipped);
    return clipped;
  }

  function flowAt(element: HTMLElement): HTMLElement {
    if (element === article || !element.parentElement) return article;
    const cached = flows.get(element);
    if (cached) return cached;
    const display = styleOf(element).display;
    const flow = display.startsWith('inline') || display === 'contents' ? flowAt(element.parentElement) : element;
    flows.set(element, flow);
    return flow;
  }

  function collect(text: Text) {
    const parent = text.parentElement;
    if (!parent || parent.closest(ignoredReadingContent) || !range.intersectsNode(text)) return;
    leaf.setStart(text, text === range.startContainer ? range.startOffset : 0);
    leaf.setEnd(text, text === range.endContainer ? range.endOffset : text.length);
    if (leaf.collapsed) return;

    const formula = parent.closest<HTMLElement>('.katex');
    const base = formula && parent.closest('.katex-html > .base');
    const outer = formula?.parentElement ?? parent;
    const flow = flowAt(outer);
    const clip = clipAt(outer);
    // KaTeX lays scripts and operators out in separate spans on one visual row.
    let group = base && formulaBoxes.get(base);
    if (group?.whole) return;
    if (base && !group) {
      const box = base.getBoundingClientRect();
      group = { box, whole: box.width > 0 && box.height > 0 && coversMathBase(range, base) };
      formulaBoxes.set(base, group);
    }
    // A complete formula also includes spacing and rules drawn as SVG or CSS.
    const rects = group?.whole ? [group.box] : leaf.getClientRects();
    const bands = fragments.get(flow) ?? [];
    for (const rect of rects) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      const box = {
        left: Math.max(clip.left, rect.left),
        right: Math.min(clip.right, rect.right),
        top: Math.max(clip.top, Math.min(rect.top, group?.box.top ?? rect.top)),
        bottom: Math.min(clip.bottom, Math.max(rect.bottom, group?.box.bottom ?? rect.bottom)),
      };
      if (box.left < box.right && box.top < box.bottom) bands.push({ box, clip });
    }
    if (bands.length) fragments.set(flow, bands);
  }

  const root = range.commonAncestorContainer;
  if (root instanceof Text) collect(root);
  else {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) collect(node as Text);
  }

  const result: NoteBand[] = [];
  for (const group of fragments.values()) {
    group.sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
    let row: Edges | undefined;
    for (const { box, clip } of group) {
      const overlap = row && Math.min(row.bottom, box.bottom) - Math.max(row.top, box.top);
      const padded = {
        left: Math.max(clip.left, box.left - 2),
        right: Math.min(clip.right, box.right + 2),
        top: Math.max(clip.top, box.top - 1),
        bottom: Math.min(clip.bottom, box.bottom + 1),
      };
      if (row && overlap !== undefined && overlap >= Math.min(row.bottom - row.top, box.bottom - box.top) / 2) {
        row.left = Math.min(row.left, padded.left);
        row.right = Math.max(row.right, padded.right);
        row.top = Math.min(row.top, padded.top);
        row.bottom = Math.max(row.bottom, padded.bottom);
      } else {
        if (row) result.push(toDocumentBand(row));
        row = padded;
      }
    }
    if (row) result.push(toDocumentBand(row));
  }
  return result.sort((a, b) => a.top - b.top || a.left - b.left);
}

function toDocumentBand({ left, top, right, bottom }: Edges): NoteBand {
  return { left: left + window.scrollX, top: top + window.scrollY, width: right - left, height: bottom - top };
}

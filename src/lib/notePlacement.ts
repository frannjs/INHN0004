interface Rect { left: number; right: number; top: number; bottom: number }
interface Viewport { width: number; height: number; left?: number; top?: number; headerBottom?: number }

/** Keep the selected line visible; use the outer margin when there is room. */
export function placeNotePopover(anchor: Rect, viewport: Viewport, cardHeight: number, articleRight?: number, preferred?: 'side' | 'above' | 'below') {
  const edge = 12;
  const originX = viewport.left ?? 0;
  const originY = viewport.top ?? 0;
  const width = Math.min(320, viewport.width - edge * 2);
  const topInset = viewport.height > 300 ? Math.max(edge, (viewport.headerBottom ?? originY + 92) - originY) : edge;
  const ceiling = originY + topInset;
  const maxHeight = Math.max(1, viewport.height - topInset - edge);
  const height = Math.min(cardHeight || 220, maxHeight);
  const floor = originY + viewport.height - height - edge;
  const clampX = (x: number) => Math.max(originX + edge, Math.min(originX + viewport.width - width - edge, x));
  const clampY = (y: number) => Math.max(ceiling, Math.min(floor, y));
  if (articleRight !== undefined && articleRight + 20 + width <= originX + viewport.width - edge) {
    return { left: articleRight + 20, top: clampY(anchor.top - 16), width, maxHeight, placement: 'side' as const };
  }
  const below = anchor.bottom + 12;
  const above = anchor.top - height - 12;
  if (preferred === 'above' || preferred === 'below') {
    return { left: clampX(anchor.left), top: clampY(preferred === 'above' ? above : below), width, maxHeight, placement: preferred };
  }
  const top = below <= floor ? Math.max(ceiling, below) : above >= ceiling ? above : clampY(below);
  return { left: clampX(anchor.left), top, width, maxHeight, placement: top < anchor.top ? 'above' as const : 'below' as const };
}

import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../../data/syllabus';
import { anchorFromRange, indexReadingText, rangeFromAnchor, type ReadingText, type TextAnchor } from '../../lib/noteAnchors';
import { measureNoteBands, type NoteBand } from '../../lib/noteHighlight';
import { placeNotePopover } from '../../lib/notePlacement';
import { createReaderHighlight, deleteReaderHighlight, loadReaderHighlights, updateReaderHighlight, type HighlightColor, type ReaderHighlight } from '../../lib/readerHighlights';
import { createReaderNote, deleteReaderNote, loadReaderNotes, updateReaderNote, type ReaderNote } from '../../lib/readerNotes';
import { readingCaretAtPoint, readingClickRange } from '../../lib/readingSelection';
import { copySelectionWithMath } from './noteEditableSelection';
import { NoteBody, NOTE_BODY_LIMIT, notePlainText } from './NoteBody';

const NoteEditor = lazy<typeof import('./NoteEditor').NoteEditor>(() => import('./NoteEditor').then(
  ({ NoteEditor }) => ({ default: NoteEditor }),
  () => ({
    default: ({ value, onChange, disabled, onSave }) => <textarea
      className="note-editor-input" aria-label="Your note" placeholder="Write a note…"
      value={notePlainText(value)} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); onSave(); }
      }} />,
  }),
));

export type NotesView = 'list' | 'passage' | null;
interface Props {
  userId: string;
  pageKey: string;
  articleContainer: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  view: NotesView;
  onViewChange: (view: NotesView) => void;
  onNavigate: (pageKey: string) => void;
}
interface Editor { id?: string; pageKey: string; anchor: TextAnchor; body: string }
interface SelectionPrompt { anchor: TextAnchor; pageKey: string; x: number; y: number; paletteX: number; above: boolean }
type Paint = NoteBand & ({ kind: 'active' | 'saved' | 'draft' } | { kind: 'highlight'; id: string; color: HighlightColor });
interface Marker { id: string; left: number; top: number }
interface NoteOverlay { pageKey: string; paint: Paint[]; markers: Marker[] }

const highlightColors = [
  ['peach', 'Peach'], ['lavender', 'Lavender'], ['ice-blue', 'Ice blue'], ['mint', 'Mint'],
] as const satisfies ReadonlyArray<readonly [HighlightColor, string]>;

function placeSelectionPrompt(anchor: TextAnchor, pageKey: string, rect: Pick<DOMRect, 'left' | 'width' | 'top' | 'bottom'>, headerBottom: number): SelectionPrompt | null {
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const right = left + (viewport?.width ?? window.innerWidth);
  const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
  if (rect.bottom < headerBottom || rect.top > bottom - 16) return null;
  const above = rect.top - 52 >= headerBottom;
  const x = Math.max(left + 12, Math.min(right - 118, rect.left + rect.width / 2 - 48));
  const y = Math.min(bottom - 52, above ? rect.top - 52 : rect.bottom + 8);
  return { anchor, pageKey, x, y, paletteX: Math.max(left + 12, Math.min(right - 182, x)), above: above && y >= headerBottom + 44 };
}

function samePassage(left: TextAnchor, right: TextAnchor) {
  return left.quote === right.quote && left.start === right.start && left.end === right.end;
}

function pageTitle(key: string) {
  return CHAPTERS.find((item) => item.id === key)?.number
    ?? ({ overview: 'Syllabus', symbols: 'Symbol Dictionary', exams: 'Past Exams' }[key] || key);
}
const NoteIcon = () => <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 4h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
const EditIcon = () => <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12.5 4 3.5 3.5M4 16l3.6-.8L16 6.8a1.8 1.8 0 0 0-2.6-2.6L5 12.6 4 16Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DeleteIcon = () => <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6h12M8 3.5h4M6 6l.7 10h6.6L14 6M8.5 9v4M11.5 9v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CloseIcon = () => <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;

export const ReaderNotes: React.FC<Props> = ({ userId, pageKey, articleContainer, triggerRef, view, onViewChange, onNavigate }) => {
  const [notes, setNotes] = useState<ReaderNote[]>([]);
  const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [prompt, setPrompt] = useState<SelectionPrompt | null>(null);
  const [selectionPaint, setSelectionPaint] = useState<{ pageKey: string; bands: NoteBand[] } | null>(null);
  const [palette, setPalette] = useState<(SelectionPrompt & { highlightId?: string }) | null>(null);
  const [highlightBusy, setHighlightBusy] = useState(false);
  const [highlightError, setHighlightError] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ReaderNote | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [position, setPosition] = useState<ReturnType<typeof placeNotePopover> | null>(null);
  const [overlay, setOverlay] = useState<NoteOverlay | null>(null);
  const [anchorVersion, setAnchorVersion] = useState(0);
  const [lastView, setLastView] = useState<Exclude<NotesView, null>>(view ?? 'list');
  const [dragging, setDragging] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [contentHeight, setContentHeight] = useState(224);
  const generation = useRef(0);
  const highlightGeneration = useRef(0);
  const ranges = useRef(new Map<string, Range>());
  const noteBands = useRef(new Map<string, NoteBand[]>());
  const jumpTo = useRef<string | null>(null);
  const previousPage = useRef(pageKey);
  const editorRef = useRef(editor);
  const popup = useRef<HTMLDivElement>(null);
  const selectionActions = useRef<HTMLDivElement>(null);
  const highlightTrigger = useRef<HTMLButtonElement>(null);
  const popupContent = useRef<HTMLDivElement>(null);
  const manualPosition = useRef<{ left: number; top: number } | null>(null);
  const preferredPlacement = useRef<'side' | 'above' | 'below' | undefined>(undefined);
  const readingIndex = useRef<{ root: HTMLElement; index: ReadingText } | null>(null);
  const moveFrame = useRef(0);
  const pendingMove = useRef<{ left: number; top: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const bodyInput = useRef<HTMLDivElement>(null);
  const selected = notes.find((note) => note.id === selectedId) ?? (selectedSnapshot?.id === selectedId ? selectedSnapshot : undefined);
  const activeAnchor = editor?.anchor ?? selected?.anchor;
  const activePage = editor?.pageKey ?? selected?.page_key;
  const shownView = view ?? lastView;
  const bodyTooLong = (editor?.body.length ?? 0) > NOTE_BODY_LIMIT;
  const canSave = Boolean(editor && notePlainText(editor.body).trim() && !bodyTooLong && !busy);
  const anchorKey = `${activePage}:${activeAnchor?.start}:${activeAnchor?.end}`;
  editorRef.current = editor;

  useEffect(() => {
    if (view === 'passage' && !editor && !selected) onViewChange(null);
  }, [view, editor, selected, onViewChange]);

  useLayoutEffect(() => { if (view) setLastView(view); }, [view]);

  useLayoutEffect(() => {
    manualPosition.current = null;
    preferredPlacement.current = undefined;
    setDragging(false);
    setDeletePending(false);
  }, [view, anchorKey]);

  useLayoutEffect(() => {
    const content = popupContent.current;
    if (!content) return;
    const measure = () => setContentHeight(content.getBoundingClientRect().height + 2);
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [shownView]);

  const getReadingIndex = useCallback((root: HTMLElement) => {
    if (readingIndex.current?.root !== root) readingIndex.current = { root, index: indexReadingText(root) };
    return readingIndex.current.index;
  }, []);

  useEffect(() => () => cancelAnimationFrame(moveFrame.current), []);

  useEffect(() => {
    const onCopy = (event: ClipboardEvent) => {
      if (!event.defaultPrevented) copySelectionWithMath(event, document.body);
    };
    document.addEventListener('copy', onCopy);
    return () => document.removeEventListener('copy', onCopy);
  }, []);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setLoadError(false);
    try {
      const result = await loadReaderNotes(userId);
      if (request === generation.current) setNotes(result);
    } catch {
      if (request === generation.current) setLoadError(true);
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
    const onFocus = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { generation.current++; window.removeEventListener('focus', onFocus); };
  }, [refresh]);

  useEffect(() => {
    const refreshHighlights = async () => {
      const request = ++highlightGeneration.current;
      try {
        const result = await loadReaderHighlights(userId);
        if (request === highlightGeneration.current) setHighlights(result);
      } catch { /* Keep the last loaded highlights available if the connection drops. */ }
    };
    void refreshHighlights();
    const onFocus = () => { if (document.visibilityState === 'visible') void refreshHighlights(); };
    window.addEventListener('focus', onFocus);
    return () => { highlightGeneration.current++; window.removeEventListener('focus', onFocus); };
  }, [userId]);

  useEffect(() => {
    if (previousPage.current === pageKey) return;
    previousPage.current = pageKey;
    setPrompt(null);
    setSelectionPaint(null);
    setPalette(null);
    setHighlightError('');
    if (!jumpTo.current) onViewChange(null);
  }, [pageKey, onViewChange]);

  const beginNote = useCallback((anchor: TextAnchor) => {
    if (editorRef.current && notePlainText(editorRef.current.body).trim()) setError('Save or cancel the current note first.');
    else {
      setEditor({ pageKey, anchor, body: '' });
      setSelectedId(null);
      setSelectedSnapshot(null);
      setError('');
      setMessage('');
    }
    window.getSelection()?.removeAllRanges();
    setPrompt(null);
    setPalette(null);
    onViewChange('passage');
  }, [pageKey, onViewChange]);

  useEffect(() => {
    if (!position) return;
    if (view === 'passage' && editor) bodyInput.current?.focus({ preventScroll: true });
    else if (view) popup.current?.focus({ preventScroll: true });
  }, [view, editor?.id, editor?.anchor, !!position]);

  useEffect(() => {
    if (!view) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (view === 'list' && !popup.current?.contains(target) && !triggerRef.current?.contains(target)) onViewChange(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onViewChange(null); triggerRef.current?.focus({ preventScroll: true }); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [view, onViewChange, triggerRef]);

  useEffect(() => {
    let frame = 0;
    let draggingSelection = false;
    let dragOrigin: { x: number; y: number; article: HTMLElement; point: ReturnType<typeof readingCaretAtPoint> } | null = null;
    const container = articleContainer.current;
    const clearSelection = () => { setPrompt(null); setSelectionPaint(null); return null; };
    const readSelection = () => {
      const article = container?.querySelector<HTMLElement>('.chapter-article');
      const selection = window.getSelection();
      if (!article || !selection?.rangeCount || selection.isCollapsed) return clearSelection();
      const range = selection.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer)) return clearSelection();
      const anchor = anchorFromRange(article, range, getReadingIndex(article));
      if (!anchor) return clearSelection();
      const bands = measureNoteBands(article, range);
      setSelectionPaint(bands.length ? { pageKey, bands } : null);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      const rect = rects.at(-1);
      const headerBottom = (triggerRef.current?.closest('header')?.getBoundingClientRect().bottom ?? 82) + 10;
      const next = rect ? placeSelectionPrompt(anchor, pageKey, { left: rect.left, width: rect.width,
        top: bands.length ? bands[0].top - window.scrollY : rects[0].top, bottom: rect.bottom }, headerBottom) : null;
      setPrompt(next);
      return next;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      if (!draggingSelection) frame = requestAnimationFrame(readSelection);
    };
    const onReadingClick = (event: MouseEvent) => {
      if (event.button || !(event.target instanceof Element)) return;
      const article = container?.querySelector<HTMLElement>('.chapter-article');
      const modified = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
      if (event.type === 'mousedown') {
        draggingSelection = true;
        const { clientX: x, clientY: y } = event;
        dragOrigin = !modified && article && event.detail === 1 ? { x, y, article, point: readingCaretAtPoint(article, x, y) } : null;
        if (event.detail !== 3) return;
      }
      if (modified) return;
      const range = article && readingClickRange(article, event.target, event.detail);
      const selection = window.getSelection();
      if (!range || !selection) return;
      event.preventDefault();
      selection.removeAllRanges();
      selection.addRange(range);
      setPalette(null);
      schedule();
    };
    const releaseSelection = (event: Event) => {
      if (!draggingSelection) return;
      draggingSelection = false;
      const selection = window.getSelection();
      const origin = dragOrigin;
      dragOrigin = null;
      if (origin?.point && selection?.isCollapsed && event instanceof MouseEvent && event.button === 0
        && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) >= 6) {
        const end = readingCaretAtPoint(origin.article, event.clientX, event.clientY);
        if (end && origin.article.contains(origin.point.node)) {
          const { node, offset } = origin.point;
          const limit = node instanceof Text ? node.length : node.childNodes.length;
          selection.setBaseAndExtent(node, Math.min(offset, limit), end.node, end.offset);
          if (!selection.isCollapsed) setPalette(null);
        }
      }
      schedule();
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'm') {
        const selection = readSelection();
        if (selection) { event.preventDefault(); beginNote(selection.anchor); }
      }
      if (event.key === 'Escape') setPrompt(null);
    };
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('keydown', shortcut);
    container?.addEventListener('dblclick', onReadingClick);
    container?.addEventListener('mousedown', onReadingClick);
    container?.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('mouseup', releaseSelection);
    window.addEventListener('blur', releaseSelection);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('selectionchange', schedule);
      document.removeEventListener('keydown', shortcut);
      container?.removeEventListener('dblclick', onReadingClick);
      container?.removeEventListener('mousedown', onReadingClick);
      container?.removeEventListener('scroll', schedule, true);
      window.removeEventListener('mouseup', releaseSelection);
      window.removeEventListener('blur', releaseSelection);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [articleContainer, pageKey, beginNote, getReadingIndex, triggerRef]);

  useEffect(() => {
    if (!palette) return;
    const dismiss = () => setPalette(null);
    const outside = (event: PointerEvent) => {
      if (!selectionActions.current?.contains(event.target as Node)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPalette(null);
        highlightTrigger.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', dismiss, { passive: true });
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', dismiss);
      window.removeEventListener('resize', dismiss);
    };
  }, [palette]);

  // Scrolling repositions the popover without reindexing the book.
  useEffect(() => {
    const article = articleContainer.current?.querySelector<HTMLElement>('.chapter-article');
    if (!article) return;
    const pageNotes = notes.filter((note) => note.page_key === pageKey);
    const pageHighlights = highlights.filter((highlight) => highlight.page_key === pageKey);
    const draftAnchor = view === 'passage' && editor?.pageKey === pageKey ? editor.anchor : null;
    const hasHighlights = Boolean(pageNotes.length || pageHighlights.length || draftAnchor);
    let frame = 0;
    const rebuild = () => {
      const index = getReadingIndex(article);
      const next = new Map<string, Range>();
      const nextBands = new Map<string, NoteBand[]>();
      const nextPaint: Paint[] = [];
      const nextMarkers: Marker[] = [];
      const markerLeft = article.getBoundingClientRect().right + window.scrollX + 10;
      for (const { id, anchor, color } of pageHighlights) {
        const range = rangeFromAnchor(article, anchor, index);
        if (range) for (const band of measureNoteBands(article, range)) nextPaint.push({ ...band, kind: 'highlight', id, color });
      }
      for (const note of pageNotes) {
        const range = rangeFromAnchor(article, note.anchor, index);
        if (!range) continue;
        next.set(note.id, range);
        const bands = measureNoteBands(article, range);
        nextBands.set(note.id, bands);
        const kind = draftAnchor && editor?.id === note.id ? 'draft'
          : view === 'passage' && selectedId === note.id ? 'active' : 'saved';
        for (const band of bands) nextPaint.push({ ...band, kind });
        if (bands.length) nextMarkers.push({ id: note.id, left: markerLeft, top: bands[0].top });
      }
      ranges.current = next;
      noteBands.current = nextBands;
      if (draftAnchor && !editor?.id) {
        const range = rangeFromAnchor(article, draftAnchor, index);
        if (range) for (const band of measureNoteBands(article, range)) nextPaint.push({ ...band, kind: 'draft' });
      }
      nextMarkers.sort((a, b) => a.top - b.top);
      for (let i = 1; i < nextMarkers.length; i++) nextMarkers[i].top = Math.max(nextMarkers[i].top, nextMarkers[i - 1].top + 26);
      setOverlay({ pageKey, paint: nextPaint, markers: nextMarkers });
      setAnchorVersion((value) => value + 1);
      if (jumpTo.current) {
        const range = next.get(jumpTo.current);
        if (range) {
          window.scrollTo({ top: Math.max(0, window.scrollY + range.getBoundingClientRect().top - 220), behavior: 'smooth' });
          jumpTo.current = null;
        }
      }
    };
    const schedule = () => {
      if (!hasHighlights) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(rebuild);
    };
    const observer = new MutationObserver((records) => {
      if (records.every(({ target }) => (target instanceof Element ? target : target.parentElement)?.closest('button,[data-note-ui]'))) return;
      readingIndex.current = null;
      schedule();
    });
    observer.observe(article, { childList: true, subtree: true, characterData: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    window.addEventListener('resize', schedule);
    article.addEventListener('scroll', schedule, { capture: true, passive: true });
    let disposed = false;
    void document.fonts?.ready.then(() => { if (!disposed) schedule(); });
    if (hasHighlights) schedule();
    else setOverlay(null);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', schedule);
      article.removeEventListener('scroll', schedule, true);
      ranges.current.clear();
      noteBands.current.clear();
    };
  }, [articleContainer, pageKey, notes, highlights, selectedId, editor?.anchor, editor?.id, editor?.pageKey, view, getReadingIndex]);

  useLayoutEffect(() => {
    if (!view) return;
    let frame = 0;
    const article = articleContainer.current?.querySelector<HTMLElement>('.chapter-article');
    const range = view === 'passage' && activePage === pageKey && activeAnchor && article ? rangeFromAnchor(article, activeAnchor, getReadingIndex(article)) : null;
    const measure = () => {
      const trigger = triggerRef.current;
      const headerBottom = (trigger?.closest('header')?.getBoundingClientRect().bottom ?? 82) + 10;
      const rects = range && [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      const visible = rects && rects.filter((r) => r.bottom > headerBottom && r.top < window.innerHeight - 12);
      const anchor = visible?.at(-1) ?? rects?.[0] ?? trigger?.getBoundingClientRect() ?? { left: 12, right: 100, top: 80, bottom: 92 };
      const viewport = window.visualViewport;
      const next = placeNotePopover(anchor, { width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight, left: viewport?.offsetLeft, top: viewport?.offsetTop, headerBottom }, contentHeight, range ? article?.getBoundingClientRect().right : undefined, preferredPlacement.current);
      preferredPlacement.current = next.placement;
      if (manualPosition.current) Object.assign(next, clampManualPosition(manualPosition.current.left, manualPosition.current.top, next.width, Math.min(contentHeight, next.maxHeight)));
      setPosition((old) => old && Object.keys(next).every((key) => next[key as keyof typeof next] === old[key as keyof typeof old]) ? old : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    measure();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.visualViewport?.removeEventListener('resize', schedule); window.visualViewport?.removeEventListener('scroll', schedule); };
  }, [view, activeAnchor, activePage, pageKey, articleContainer, triggerRef, anchorVersion, contentHeight, getReadingIndex]);

  function clampManualPosition(left: number, top: number, width = popup.current?.offsetWidth || 320, height = popup.current?.offsetHeight || 220) {
    const viewport = window.visualViewport;
    const x = viewport?.offsetLeft ?? 0;
    const y = viewport?.offsetTop ?? 0;
    return {
      left: Math.max(x + 12, Math.min(x + (viewport?.width ?? window.innerWidth) - width - 12, left)),
      top: Math.max(y + 12, Math.min(y + (viewport?.height ?? window.innerHeight) - height - 12, top)),
    };
  }

  const moveTo = (left: number, top: number) => {
    const next = clampManualPosition(left, top);
    manualPosition.current = next;
    setPosition((previous) => previous ? { ...previous, ...next } : previous);
  };

  const scheduleMove = (left: number, top: number) => {
    pendingMove.current = { left, top };
    if (moveFrame.current) return;
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = 0;
      const next = pendingMove.current;
      pendingMove.current = null;
      if (next) moveTo(next.left, next.top);
    });
  };

  const showNote = useCallback((note: ReaderNote) => {
    if (editorRef.current && notePlainText(editorRef.current.body).trim()) { setError('Save or cancel the current note first.'); onViewChange('passage'); return; }
    setEditor(null); setSelectedId(note.id); setSelectedSnapshot(note); setError(''); setMessage(''); onViewChange('passage');
  }, [onViewChange]);

  useEffect(() => {
    const container = articleContainer.current;
    if (!container) return;
    const inspectHighlight = (event: MouseEvent) => {
      if (event.button !== 0 || !window.getSelection()?.isCollapsed) return;
      if (event.target instanceof Element && event.target.closest('a,button,input,select,textarea')) return;
      const x = event.clientX + window.scrollX;
      const y = event.clientY + window.scrollY;
      for (const [id, bands] of noteBands.current) {
        if (bands.some(({ left, top, width, height }) => x >= left && x <= left + width && y >= top && y <= top + height)) {
          const note = notes.find((item) => item.id === id);
          if (note) { showNote(note); return; }
        }
      }
      if (view === 'list' || overlay?.pageKey !== pageKey) return;
      const mark = overlay.paint.find((paint) => paint.kind === 'highlight' && x >= paint.left && x <= paint.left + paint.width
        && y >= paint.top && y <= paint.top + paint.height);
      if (mark?.kind !== 'highlight') return;
      const highlight = highlights.find(({ id }) => id === mark.id);
      if (!highlight) return;
      const headerBottom = (triggerRef.current?.closest('header')?.getBoundingClientRect().bottom ?? 82) + 10;
      const placement = placeSelectionPrompt(highlight.anchor, pageKey, { left: mark.left - window.scrollX, width: mark.width,
        top: mark.top - window.scrollY, bottom: mark.top + mark.height - window.scrollY }, headerBottom);
      if (placement) {
        setHighlightError('');
        setPalette({ ...placement, highlightId: highlight.id });
      }
    };
    container.addEventListener('mouseup', inspectHighlight);
    return () => container.removeEventListener('mouseup', inspectHighlight);
  }, [articleContainer, highlights, notes, overlay, pageKey, showNote, triggerRef, view]);

  const saveHighlight = async (color: HighlightColor | null) => {
    if (!palette || highlightBusy) return;
    const { anchor, pageKey: highlightedPage, highlightId } = palette;
    if (!color && !highlightId) return;
    setHighlightBusy(true);
    setHighlightError('');
    try {
      if (color) {
        const saved = highlightId ? await updateReaderHighlight(userId, highlightId, color)
          : await createReaderHighlight(userId, highlightedPage, anchor, color);
        highlightGeneration.current++;
        setHighlights((previous) => [saved, ...previous.filter(({ id }) => id !== saved.id)]);
      } else if (highlightId) {
        await deleteReaderHighlight(userId, highlightId);
        highlightGeneration.current++;
        setHighlights((previous) => previous.filter(({ id }) => id !== highlightId));
      }
      setPalette((current) => current === palette ? null : current);
      setPrompt((current) => current && current.pageKey === highlightedPage && samePassage(current.anchor, anchor) ? null : current);
      const selection = window.getSelection();
      const article = articleContainer.current?.querySelector<HTMLElement>('.chapter-article');
      if (previousPage.current === highlightedPage && article && selection?.rangeCount && !selection.isCollapsed) {
        const current = anchorFromRange(article, selection.getRangeAt(0), getReadingIndex(article));
        if (current && samePassage(current, anchor)) selection.removeAllRanges();
      }
    } catch {
      setHighlightError(color ? 'Could not save the highlight. Try again.' : 'Could not remove the highlight. Try again.');
    } finally {
      setHighlightBusy(false);
    }
  };

  const save = async () => {
    if (!editor || !canSave) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const note = editor.id ? await updateReaderNote(userId, editor.id, editor.body) : await createReaderNote(userId, editor.pageKey, editor.anchor, editor.body);
      generation.current++;
      setNotes((previous) => [note, ...previous.filter((item) => item.id !== note.id)]);
      setEditor(null); setSelectedId(note.id); setSelectedSnapshot(note); setMessage('Note saved.');
      void refresh();
    } catch { setError('Could not save. Your draft is still here. Try again.'); }
    finally { setBusy(false); }
  };

  const remove = async (note: ReaderNote) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await deleteReaderNote(userId, note.id);
      onViewChange(null);
      await new Promise((resolve) => window.setTimeout(resolve, 140));
      generation.current++;
      setNotes((previous) => previous.filter((item) => item.id !== note.id));
      setSelectedId(null); setSelectedSnapshot(null); setMessage(''); setDeletePending(false);
      void refresh();
    } catch { setError('Could not delete the note. Please try again.'); }
    finally { setBusy(false); }
  };

  const visit = (note: ReaderNote) => {
    if (editorRef.current && notePlainText(editorRef.current.body).trim()) { showNote(note); return; }
    jumpTo.current = note.id;
    if (note.page_key !== pageKey) onNavigate(note.page_key);
    else {
      const range = ranges.current.get(note.id);
      if (range) window.scrollTo({ top: Math.max(0, window.scrollY + range.getBoundingClientRect().top - 220), behavior: 'smooth' });
      else setMessage('The passage may be inside a closed answer.');
      jumpTo.current = null;
    }
    showNote(note);
  };

  const close = () => { onViewChange(null); setError(''); };
  const currentOverlay = overlay?.pageKey === pageKey ? overlay : null;
  const actions = view !== 'list' && (palette ?? prompt)?.pageKey === pageKey ? palette ?? prompt : null;
  const isPaletteOpen = Boolean(palette && actions);
  const currentColor = palette?.highlightId ? highlights.find(({ id }) => id === palette.highlightId)?.color : undefined;
  return <>
    <div className="note-paint-layer" aria-hidden="true" data-note-ui>{currentOverlay?.paint.map((paint, i) => {
      const { kind, left, top, width, height } = paint;
      return <span key={i} className={`note-paint ${kind}`} data-highlight-color={kind === 'highlight' ? paint.color : undefined}
        style={{ left, top, width, height }} />;
    })}{selectionPaint?.pageKey === pageKey && selectionPaint.bands.map((band, i) =>
      <span key={`selection-${i}`} className="note-paint selection" style={band} />)}</div>
    <div className="note-margin-layer" data-note-ui>{currentOverlay?.markers.map((marker) => <button key={marker.id} type="button" className="note-margin-mark" style={{ left: marker.left, top: marker.top }} aria-label="Open passage note" onClick={() => { const note = notes.find((item) => item.id === marker.id); if (note) showNote(note); }}><NoteIcon /></button>)}</div>
    {actions && <div className="reader-selection-actions" ref={selectionActions} style={{ left: actions.x, top: actions.y }} data-note-ui
      onPointerDown={(event) => event.preventDefault()}>
      <button className="add-note-prompt" type="button" aria-label="Add note" onClick={() => beginNote(actions.anchor)}><NoteIcon /><span>Note</span></button>
      <button className="reader-highlight-trigger" ref={highlightTrigger} type="button" aria-label="Highlight" title="Highlight"
        aria-expanded={isPaletteOpen} onClick={() => {
          if (palette) { setPalette(null); return; }
          const existing = highlights.find(({ page_key, anchor }) => page_key === pageKey && samePassage(anchor, actions.anchor));
          setHighlightError('');
          setPalette({ ...actions, highlightId: existing?.id });
        }}><span data-highlight-color={currentColor ?? 'peach'} /></button>
      {palette && <div className="reader-highlight-palette" data-placement={actions.above ? 'above' : 'below'} role="group" aria-label="Highlight colors"
        style={{ left: actions.paletteX - actions.x, minWidth: highlightError ? 170 : undefined }}>
        {highlightColors.map(([color, label]) => <button key={color} type="button" aria-label={label} title={label}
          aria-pressed={currentColor === color} disabled={highlightBusy} onClick={() => void saveHighlight(color)}><span data-highlight-color={color} /></button>)}
        {palette.highlightId && <button type="button" aria-label="Remove highlight" title="Remove highlight" disabled={highlightBusy}
          onClick={() => void saveHighlight(null)}><CloseIcon /></button>}
        {highlightError && <p role="alert">{highlightError}</p>}
      </div>}
    </div>}
    {shownView && <div ref={popup} className={`note-popover ${shownView === 'list' ? 'note-library' : 'note-context'} ${dragging ? 'is-dragging' : ''}`} style={position ? { left: position.left, top: position.top, width: position.width, maxHeight: shownView === 'list' ? Math.min(460, position.maxHeight) : position.maxHeight } : { visibility: 'hidden' }} role="dialog" inert={!view} data-state={view ? 'open' : 'closed'} aria-hidden={!view} aria-label={shownView === 'list' ? 'Your notes' : editor ? 'Write a note' : 'Passage note'} tabIndex={-1} data-note-ui data-placement={position?.placement}>
      <div ref={popupContent} className="note-popover-content">
      <header className="note-popover-header">
        <div className="note-drag-handle" role="button" tabIndex={0} aria-label="Move note" title="Drag to move" onPointerDown={(event) => {
          if (event.button !== 0 || !popup.current) return;
          const rect = popup.current.getBoundingClientRect();
          drag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.preventDefault();
        }} onPointerMove={(event) => {
          if (drag.current) {
            const dx = event.clientX - drag.current.x;
            const dy = event.clientY - drag.current.y;
            if (Math.abs(dx) + Math.abs(dy) > 3) { setDragging(true); scheduleMove(drag.current.left + dx, drag.current.top + dy); }
          }
        }} onPointerUp={(event) => {
          cancelAnimationFrame(moveFrame.current); moveFrame.current = 0;
          if (pendingMove.current) { moveTo(pendingMove.current.left, pendingMove.current.top); pendingMove.current = null; }
          drag.current = null; setDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }} onPointerCancel={() => { cancelAnimationFrame(moveFrame.current); moveFrame.current = 0; pendingMove.current = null; drag.current = null; setDragging(false); }} onKeyDown={(event) => {
          const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          const delta = directions[event.key];
          if (delta && position) { event.preventDefault(); const step = event.shiftKey ? 30 : 10; moveTo(position.left + delta[0] * step, position.top + delta[1] * step); }
        }}><span className="note-popover-title"><NoteIcon />{shownView === 'list' ? 'Notes' : editor?.id ? 'Edit note' : editor ? 'New note' : 'Note'}{shownView === 'list' && notes.length > 0 && <span className="note-count">{notes.length}</span>}</span><span className="note-grip" aria-hidden="true">⠿</span></div>
        <button type="button" className="note-icon-button" onClick={close} aria-label="Close notes"><CloseIcon /></button>
      </header>
      {shownView === 'list' ? <div className="note-library-scroll" id="reader-note-list">
        {editor && <button className="note-resume" type="button" onClick={() => { setError(''); onViewChange('passage'); }}>Resume draft <span>↗</span></button>}
        {loading && !notes.length && <p className="note-feedback" role="status">Loading…</p>}
        {loadError && <p className="note-feedback error" role="alert">Could not load notes. <button type="button" onClick={() => void refresh()}>Retry</button></p>}
        {!loading && !loadError && !notes.length && <p className="note-library-empty">Select a passage to add a note.</p>}
        <ol className="note-library-list">{notes.map((note) => <li key={note.id}><button type="button" className="note-library-item" onClick={() => visit(note)}><span className="note-library-source">{pageTitle(note.page_key)}</span><span className="note-library-quote">{note.anchor.quote}</span><span className="note-library-body"><NoteBody body={note.body} compact /></span></button></li>)}</ol>
      </div> : <>
        {activeAnchor && <p className="note-context-quote" title={activeAnchor.quote}>{activePage !== pageKey && `${pageTitle(activePage ?? '')} · `}{activeAnchor.quote}</p>}
        {editor ? <form className="note-composer" onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <Suspense fallback={<div className="note-editor-input note-markdown-loading" role="status">Loading editor…</div>}>
            <NoteEditor value={editor.body} editorRef={bodyInput} disabled={busy} onSave={() => void save()}
              onChange={(body) => setEditor((current) => current && { ...current, body })} />
          </Suspense>
          {bodyTooLong && <p className="note-editor-limit" role="status">This note is too long to save.</p>}
          <footer className="note-composer-footer"><button className="note-quiet-button" type="button" disabled={busy} onClick={() => { setEditor(null); setError(''); if (!selectedId) onViewChange(null); }}>Cancel</button><span className="note-save-shortcut" aria-hidden="true">⌘ / Ctrl ↵</span><button type="submit" className="note-save-button" aria-label="Save note" disabled={!canSave}>{busy ? 'Saving…' : 'Save'}<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></footer>
        </form> : selected && <div className="note-saved-content"><div className="note-body"><NoteBody body={selected.body} /></div><footer className="note-saved-footer">{deletePending ? <div className="note-delete-confirm"><span>Delete this note?</span><button type="button" className="note-quiet-button" disabled={busy} onClick={() => setDeletePending(false)}>Cancel</button><button type="button" className="note-confirm-delete" aria-label="Confirm deletion" disabled={busy} onClick={() => void remove(selected)}>{busy ? 'Deleting…' : 'Delete'}</button></div> : <><span className="note-save-state" role="status">{message === 'Note saved.' ? <><span className="sr-only">Note saved.</span>Saved</> : 'Only you'}</span><button type="button" className="note-icon-button" title="Edit note" aria-label="Edit note" disabled={busy} onClick={() => { setEditor({ id: selected.id, pageKey: selected.page_key, anchor: selected.anchor, body: selected.body }); setMessage(''); setError(''); }}><EditIcon /></button><button type="button" className="note-icon-button note-delete-button" title="Delete note" aria-label="Delete note" disabled={busy} onClick={() => setDeletePending(true)}><DeleteIcon /></button></>}</footer></div>}
        {error && <p className="note-feedback error" role="alert">{error}</p>}
        {message && message !== 'Note saved.' && <p className="note-feedback" role="status">{message}</p>}
      </>}
      </div>
    </div>}
  </>;
};

import katex from 'katex';
import type { NoteMath } from '../../lib/noteMath';
import { findNoteNotation } from '../../lib/noteNotation';
import { editorTextWithoutCaret, noteInlineCaretSelector } from './noteEditableSelection';

const sourceAttribute = 'data-note-math-source';
export const noteMathSeparators = /^[\s,.;:!?]+$/u;
const atomSelector = '[' + sourceAttribute + ']';
const literalSelector = 'pre,code,a,' + atomSelector;
const internallyEditing = new WeakSet<HTMLElement>();
let nextAtomId = 0;

interface InlineSegment {
  node: Node;
  raw: string;
  start: number;
  end: number;
}

export function noteMathSource(element: Element) {
  return element.getAttribute(sourceAttribute);
}

function placeCaretAfter(document: Document, selection: Selection, atom: Element) {
  const after = document.createRange();
  after.setStartAfter(atom);
  after.collapse(true);
  selection.removeAllRanges();
  selection.addRange(after);
}

export function keepInlineEditInLine(text: Text, offset: number) {
  if (offset !== text.length || text.nextSibling) return undefined;
  // With text after the replacement, native insertHTML keeps the fragment inside this line.
  const boundary = text.ownerDocument.createElement('span');
  boundary.textContent = '\u2060';
  text.after(boundary);
  return boundary;
}

export function lockNoteMathAtoms(container: HTMLElement) {
  // WebKit strips nested contenteditable attributes from HTML inserted into an editor.
  for (const atom of container.querySelectorAll<HTMLElement>(atomSelector)) {
    if (atom.contentEditable !== 'false') atom.contentEditable = 'false';
  }
  const document = container.ownerDocument;
  const selection = document.getSelection();
  if (!selection?.isCollapsed) return;
  const anchor = selection.anchorNode;
  const parent = anchor instanceof Element ? anchor : anchor?.parentElement;
  const atom = parent?.closest(atomSelector);
  if (atom && container.contains(atom)) placeCaretAfter(document, selection, atom);
}

export function createNoteMathAtom(document: Document, raw: string, match: NoteMath) {
  const atom = document.createElement('span');
  atom.className = match.display ? 'note-editor-math-atom note-math note-math-block' : 'note-editor-math-atom note-math';
  atom.contentEditable = 'false';
  atom.setAttribute(sourceAttribute, raw);
  atom.title = raw;
  try {
    atom.innerHTML = katex.renderToString(match.math, {
      displayMode: match.display,
      output: 'htmlAndMathml',
      throwOnError: true,
      strict: false,
      trust: false,
      maxSize: 20,
    });
  } catch {
    return null;
  }
  return atom;
}

/** Build an editable fragment before it is inserted into the native editing history. */
export function prepareNoteMathFragment(document: Document, source: string) {
  const fragment = document.createDocumentFragment();
  let position = 0;
  let count = 0;
  for (const match of findNoteNotation(source).expressions) {
    const atom = createNoteMathAtom(document, source.slice(match.start, match.end), match);
    if (!atom) continue;
    if (position < match.start) fragment.append(source.slice(position, match.start));
    fragment.append(atom);
    position = match.end;
    count++;
  }
  if (position < source.length) fragment.append(source.slice(position));
  return { fragment, count };
}

/** Hydrate a restored note before it has a browser editing history. */
export function renderNoteMathAtoms(container: HTMLElement) {
  const document = container.ownerDocument;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const pending: Text[] = [];
  while (walker.nextNode()) {
    const text = walker.currentNode as Text;
    if (text.length && !text.parentElement?.closest(literalSelector)) pending.push(text);
  }
  for (const text of pending) {
    const { fragment, count } = prepareNoteMathFragment(document, text.data);
    if (count) text.replaceWith(fragment);
  }
}

function pendingTexStart(source: string, offset: number, completed: NoteMath[]) {
  let start = 0;
  for (const { end } of completed) {
    if (end > offset) break;
    start = end;
  }
  const currency = /\d+(?:[.,]\d+)*(?=[ \t]+\p{L}{2})/uy;
  for (let position = start; position < offset; position++) {
    const char = source[position];
    const next = source[position + 1];
    if (char === '\\') {
      if (next === '(' || next === '[') return position;
      position++;
    } else if (char === '$') {
      if (next === '$') return position;
      if (!next || /\s/u.test(next)) continue;
      currency.lastIndex = position + 1;
      if (!currency.test(source)) return position;
    }
  }
  return offset;
}

function collectPrecedingSegments(firstSibling: Node | null): { segments: InlineSegment[]; prefix: string } {
  const reversed: { node: Node; raw: string }[] = [];
  let cursor = firstSibling;
  while (cursor) {
    if (cursor instanceof Text) {
      reversed.push({ node: cursor, raw: editorTextWithoutCaret(cursor) });
    } else if (cursor instanceof HTMLElement && !cursor.classList.contains('note-math-block') && noteMathSource(cursor) !== null) {
      reversed.push({ node: cursor, raw: noteMathSource(cursor)! });
    } else if (cursor instanceof HTMLElement && cursor.matches(noteInlineCaretSelector)) {
      const inner = cursor.firstChild;
      reversed.push({ node: cursor, raw: inner instanceof Text ? editorTextWithoutCaret(inner) : '' });
    } else {
      break;
    }
    cursor = cursor.previousSibling;
  }
  reversed.reverse();
  const segments: InlineSegment[] = [];
  let offset = 0;
  for (const item of reversed) {
    segments.push({ node: item.node, raw: item.raw, start: offset, end: offset + item.raw.length });
    offset += item.raw.length;
  }
  return { segments, prefix: segments.map((s) => s.raw).join('') };
}

/** Replace a complete expression while keeping the caret and any existing separator in place. */
export function completeNoteMath(editor: HTMLElement, input: string, atLineEnd = false) {
  if (internallyEditing.has(editor)) return false;
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  const anchorNode = selection?.anchorNode;
  if (!selection?.isCollapsed || !anchorNode || !editor.contains(anchorNode) || !document.execCommand) return false;
  const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
  if (!anchorElement || anchorElement.closest(literalSelector)) return false;

  let text: Text | null = null;
  let offset = 0;
  let precedingStart: Node | null = null;
  let caretsContainer: Element | null = null;
  if (anchorNode instanceof Text) {
    text = anchorNode;
    offset = selection.anchorOffset;
    if (anchorElement.matches(noteInlineCaretSelector)) {
      caretsContainer = anchorElement;
      precedingStart = anchorElement.previousSibling;
    } else {
      precedingStart = text.previousSibling;
    }
  } else if (anchorNode instanceof HTMLElement) {
    precedingStart = selection.anchorOffset > 0 ? anchorNode.childNodes[selection.anchorOffset - 1] ?? null : null;
  } else {
    return false;
  }

  const rawBeforeCaret = text ? editorTextWithoutCaret(text).slice(0, Math.max(0, offset - (text.data.length - editorTextWithoutCaret(text).length))) : '';
  const rawAfterCaret = text ? editorTextWithoutCaret(text).slice(rawBeforeCaret.length) : '';
  const { segments, prefix } = collectPrecedingSegments(precedingStart);

  // If the user immediately types a letter/digit/+/* right after an optimistic postfix A+ or A* atom (e.g. A+B or C++),
  // unwrap that trailing atom back into plain source so binary addition or C++ stays accurate.
  const lastSeg = segments.at(-1);
  if (input && !rawBeforeCaret && lastSeg && lastSeg.node instanceof HTMLElement && noteMathSource(lastSeg.node) !== null
    && /[*+]$/u.test(lastSeg.raw) && !/[})|][*+]$/u.test(lastSeg.raw) && /^[\p{L}\p{N}({+*]$/u.test(input)) {
    const candidate = lastSeg.raw + input;
    const check = findNoteNotation(candidate).expressions;
    if (!check.some((expr) => expr.end === lastSeg.raw.length)) {
      const unwrap = document.createRange();
      unwrap.setStartBefore(lastSeg.node);
      if (text) unwrap.setEnd(text, offset);
      else unwrap.setEndAfter(lastSeg.node);
      selection.removeAllRanges();
      selection.addRange(unwrap);
      internallyEditing.add(editor);
      try {
        return document.execCommand('insertText', false, candidate);
      } finally {
        internallyEditing.delete(editor);
      }
    }
  }

  if (input && !/[\s,.;:!?)}\]|$*+]$/u.test(input)) return false;

  const prefixLength = prefix.length;
  const source = prefix + rawBeforeCaret + input + rawAfterCaret;
  const caret = prefixLength + rawBeforeCaret.length + input.length;
  const notation = findNoteNotation(source);
  const explicitEnd = new Set(notation.explicit.map(({ end }) => end));
  const pending = pendingTexStart(source, caret, notation.explicit);
  let match: NoteMath | undefined;
  for (const expression of notation.expressions) {
    if (expression.end <= prefixLength) continue;
    const tail = source.slice(expression.end, caret);
    const explicit = explicitEnd.has(expression.end);
    const rawExpr = source.slice(expression.start, expression.end);
    const instantPostfix = /[*+]$/u.test(rawExpr) && !tail.length;
    if (expression.end <= caret && (explicit || expression.end <= pending) && /^[\s,.;:!?)]*$/u.test(tail)
      && (atLineEnd || tail.length || explicit || /[})|]$/u.test(rawExpr) || instantPostfix)) {
      match = expression;
    }
  }
  if (!match) return false;
  // Let the inline Markdown editor handle formulas inside a pending emphasis run.
  if (/(?<![\\\w])(?:\*{1,3}|_{1,3}|~~)(?![*_~\s])[^*_~\r\n]*$/u.test(source.slice(0, match.start))) return false;

  const raw = source.slice(match.start, match.end);
  const atom = createNoteMathAtom(document, raw, match);
  if (!atom) return false;

  const tail = source.slice(match.end, caret);
  const keepTail = !input && Boolean(tail) && Boolean(text) && match.end >= prefixLength;
  const id = String(nextAtomId++);
  atom.dataset.noteMathEditId = id;
  const insertion = document.createElement('span');
  insertion.append(atom);
  if (tail && !keepTail) insertion.append(tail);
  const before = selection.getRangeAt(0).cloneRange();
  const boundary = match.display || keepTail || !text ? undefined : keepInlineEditInLine(text, offset);
  const replacement = document.createRange();

  const textSpacer = text ? text.data.length - editorTextWithoutCaret(text).length : 0;
  if (match.start >= prefixLength && text) {
    replacement.setStart(text, Math.min(textSpacer + (match.start - prefixLength), offset));
  } else {
    const startSeg = segments.find((seg) => match.start < seg.end) ?? segments[0];
    if (!startSeg) return false;
    if (startSeg.node instanceof Text) {
      const segSpacer = startSeg.node.data.length - startSeg.raw.length;
      replacement.setStart(startSeg.node, segSpacer + (match.start - startSeg.start));
    } else if (startSeg.node instanceof HTMLElement && startSeg.node.matches(noteInlineCaretSelector) && startSeg.node.firstChild instanceof Text) {
      const inner = startSeg.node.firstChild;
      const segSpacer = inner.data.length - startSeg.raw.length;
      replacement.setStart(inner, segSpacer + (match.start - startSeg.start));
    } else {
      replacement.setStartBefore(startSeg.node);
    }
  }

  if (text) {
    if (caretsContainer && offset === text.data.length && !rawAfterCaret) {
      replacement.setEndAfter(caretsContainer);
    } else {
      replacement.setEnd(text, keepTail ? textSpacer + (match.end - prefixLength) : offset);
    }
  } else if (lastSeg) {
    replacement.setEndAfter(lastSeg.node);
  } else {
    return false;
  }

  selection.removeAllRanges();
  selection.addRange(replacement);
  internallyEditing.add(editor);
  try {
    document.execCommand('insertHTML', false, insertion.innerHTML);
  } finally {
    internallyEditing.delete(editor);
    boundary?.remove();
  }
  // Blink can return false after inserting the fragment from a beforeinput handler.
  const inserted = editor.querySelector<HTMLElement>('[data-note-math-edit-id="' + id + '"]');
  if (!inserted) {
    selection.removeAllRanges();
    selection.addRange(before);
    return false;
  }

  if (inserted.contentEditable !== 'false') inserted.contentEditable = 'false';
  const next = inserted.nextSibling;
  if (tail.length && next instanceof Text && next.length >= tail.length) selection.collapse(next, tail.length);
  else placeCaretAfter(document, selection, inserted);
  return true;
}

/** Replace an equation with its exact source so it can be revised. */
export function editNoteMathAtom(editor: HTMLElement, target: Element) {
  const atom = target.closest(atomSelector);
  if (!atom || !editor.contains(atom)) return false;
  const raw = noteMathSource(atom);
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  if (raw === null || !selection || !document.execCommand) return false;
  editor.focus({ preventScroll: true });
  const range = document.createRange();
  range.selectNode(atom);
  selection.removeAllRanges();
  selection.addRange(range);
  internallyEditing.add(editor);
  try {
    return document.execCommand('insertText', false, raw);
  } finally {
    internallyEditing.delete(editor);
  }
}

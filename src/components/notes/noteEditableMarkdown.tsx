import { renderToStaticMarkup } from 'react-dom/server';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { findNoteNotation } from '../../lib/noteNotation';
import { keepInlineEditInLine, lockNoteMathAtoms, prepareNoteMathFragment } from './noteEditableMath';
import { createNoteInlineCaret, editorTextWithoutCaret, noteInlineCaretSelector } from './noteEditableSelection';
import { NoteMarkdown, type NoteMarkdownMark } from './NoteMarkdown';

interface SourceRange { start: number; end: number }

const atomSelector = '[data-note-math-source]';
let nextInlineId = 0;
const inlinePatterns = [
  { tag: 'code', pattern: /(?<![\\\x60])\x60([^\x60\r\n]+)\x60$/u },
  { tag: 'strong', pattern: /(?<![\\*])\*\*([^\s*](?:[^*\r\n]*[^\s*])?)\*\*$/u },
  { tag: 'em', pattern: /(?<![\\*])\*([^\s*](?:[^*\r\n]*[^\s*])?)\*$/u },
  { tag: 'strong', pattern: /(?<![\\_\w])__([^\s_](?:[^_\r\n]*[^\s_])?)__$/u },
  { tag: 'em', pattern: /(?<![\\_\w])_([^\s_](?:[^_\r\n]*[^\s_])?)_$/u },
  { tag: 'del', pattern: /(?<![\\~])~~([^\s~](?:[^~\r\n]*[^\s~])?)~~$/u },
];

const lineBlockSelector = 'div,p,ul,ol,blockquote,pre,table,h1,h2,h3,h4,h5,h6,hr,.note-math-block';

function isLineBoundary(node: Node | null): boolean {
  if (!node) return true;
  if (node.nodeName === 'BR') return true;
  return node instanceof Element && node.matches(lineBlockSelector);
}

/** Turn a dash at the beginning of a line into a native editable list item, keeping any existing text and math on that line. */
export function startNoteBullet(editor: HTMLElement) {
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  const text = selection?.anchorNode;
  if (!selection?.isCollapsed || !(text instanceof Text) || !editor.contains(text)) return false;
  const rawParent = text.parentElement;
  if (!rawParent || rawParent.closest('li,pre,code,a,table,th,td,' + atomSelector)) return false;

  const inCaretSpan = rawParent.matches(noteInlineCaretSelector);
  const startNode: ChildNode = inCaretSpan ? rawParent : text;
  const lineContainer = startNode.parentElement;
  if (!lineContainer || (lineContainer !== editor && !lineContainer.matches('div,p,blockquote'))) return false;
  if (!isLineBoundary(startNode.previousSibling)) return false;

  const cleanText = editorTextWithoutCaret(text);
  const spacerLen = text.data.length - cleanText.length;
  const cleanOffset = selection.anchorOffset - spacerLen;
  if (cleanOffset < 1 || !/^ {0,3}-$/u.test(cleanText.slice(0, cleanOffset))) return false;

  // Strip the typed dash and at most one already-present space right after it so existing text has no leading gap.
  const remainder = cleanText.slice(cleanOffset).replace(/^ /, '');
  const itemContent = document.createDocumentFragment();
  if (remainder) itemContent.append(document.createTextNode(remainder));

  let cursor = startNode.nextSibling;
  while (cursor && !isLineBoundary(cursor)) {
    const next = cursor.nextSibling;
    if (cursor instanceof Element && cursor.matches(noteInlineCaretSelector)) {
      const inner = cursor.firstChild;
      const val = inner instanceof Text ? editorTextWithoutCaret(inner) : '';
      if (val) itemContent.append(document.createTextNode(val));
      cursor.remove();
    } else {
      itemContent.append(cursor);
    }
    cursor = next;
  }

  const li = document.createElement('li');
  const hadContent = Boolean(itemContent.childNodes.length);
  if (hadContent) li.append(itemContent);
  else li.append(document.createElement('br'));

  const prevBoundary = startNode.previousSibling;
  const nextBoundary = cursor;

  if (lineContainer !== editor && !prevBoundary && !nextBoundary) {
    const prevEl = lineContainer.previousElementSibling;
    if (prevEl?.tagName === 'UL' && lineContainer.previousSibling === prevEl) {
      prevEl.append(li);
      lineContainer.remove();
    } else {
      const ul = document.createElement('ul');
      ul.append(li);
      lineContainer.replaceWith(ul);
    }
  } else if (lineContainer !== editor) {
    // Split a multi-line <div/> or <p/> cleanly around the new list item.
    const afterFrag = document.createDocumentFragment();
    if (nextBoundary?.nodeName === 'BR') {
      let tail = nextBoundary.nextSibling;
      nextBoundary.remove();
      while (tail) {
        const following = tail.nextSibling;
        afterFrag.append(tail);
        tail = following;
      }
    }
    startNode.remove();
    if (prevBoundary?.nodeName === 'BR') prevBoundary.remove();
    const ul = document.createElement('ul');
    ul.append(li);
    lineContainer.after(ul);
    if (!lineContainer.childNodes.length) lineContainer.remove();
    if (afterFrag.childNodes.length) {
      const tailBlock = document.createElement(lineContainer.tagName.toLowerCase());
      tailBlock.append(afterFrag);
      ul.after(tailBlock);
    }
  } else {
    // Line sits directly inside editor (separated by <br> or block boundaries).
    if (prevBoundary?.nodeName === 'BR') prevBoundary.remove();
    if (nextBoundary?.nodeName === 'BR') nextBoundary.remove();
    const beforeTarget = startNode.previousSibling;
    if (beforeTarget instanceof HTMLUListElement) {
      beforeTarget.append(li);
      startNode.remove();
    } else {
      const ul = document.createElement('ul');
      ul.append(li);
      startNode.replaceWith(ul);
    }
  }

  lockNoteMathAtoms(editor);
  li.normalize();
  if (hadContent && li.firstChild instanceof Text) {
    selection.collapse(li.firstChild, 0);
  } else {
    selection.collapse(li, 0);
  }
  return true;
}

/** Keep pasted prose in one item while preserving any explicit Markdown list. */
export function prepareNoteListPaste(fragment: DocumentFragment, markdown: boolean) {
  const document = fragment.ownerDocument;
  if (markdown) {
    let previousParagraph = false;
    for (const child of Array.from(fragment.childNodes)) {
      if (child instanceof Text && !child.data.trim()) { child.remove(); continue; }
      if (child instanceof HTMLParagraphElement) {
        if (previousParagraph) child.before(document.createElement('br'), document.createElement('br'));
        child.replaceWith(...child.childNodes);
        previousParagraph = true;
      } else previousParagraph = false;
    }
  }
  for (const child of Array.from(fragment.childNodes)) {
    if (!(child instanceof Text) || !/[\r\n]/u.test(child.data)) continue;
    const lines = child.data.split(/\r\n?|\n/u);
    const inline = document.createDocumentFragment();
    for (const [index, line] of lines.entries()) {
      if (index) inline.append(document.createElement('br'));
      if (line) inline.append(line);
    }
    child.replaceWith(inline);
  }
  return fragment;
}

/** Complete inline Markdown at the caret as a single visual edit. */
export function completeNoteMarkdown(editor: HTMLElement) {
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  const text = selection?.anchorNode;
  if (!selection?.isCollapsed || !(text instanceof Text) || !editor.contains(text)
    || text.parentElement?.closest('pre,code,a,' + atomSelector) || !document.execCommand) return false;

  const offset = selection.anchorOffset;
  const prefix = text.data.slice(0, offset);
  const last = prefix.at(-1);
  if (last !== '*' && last !== '_' && last !== '~' && last !== '\x60') return false;
  const start = Math.max(0, prefix.length - 1024);
  for (const { tag, pattern } of inlinePatterns) {
    const match = pattern.exec(prefix.slice(start));
    if (!match) continue;
    const id = String(nextInlineId++);
    const inline = document.createElement(tag);
    inline.dataset.noteInlineEditId = id;
    if (tag === 'code') inline.textContent = match[1];
    else inline.append(prepareNoteMathFragment(document, match[1]).fragment);
    const caret = createNoteInlineCaret(document, id);
    const original = selection.getRangeAt(0).cloneRange();
    const boundary = keepInlineEditInLine(text, offset);
    const replacement = document.createRange();
    replacement.setStart(text, start + match.index);
    replacement.setEnd(text, offset);
    selection.removeAllRanges();
    selection.addRange(replacement);
    try { document.execCommand('insertHTML', false, inline.outerHTML + caret.outerHTML); }
    finally { boundary?.remove(); }
    const inserted = editor.querySelector('[data-note-inline-edit-id="' + id + '"]');
    if (!inserted?.parentNode) {
      selection.removeAllRanges();
      selection.addRange(original);
      return false;
    }
    const continuation = editor.querySelector('[data-note-inline-caret="' + id + '"]')?.firstChild;
    if (continuation instanceof Text) selection.collapse(continuation, continuation.length);
    else {
      const after = document.createRange();
      after.setStartAfter(inserted);
      after.collapse(true);
      selection.removeAllRanges();
      selection.addRange(after);
    }
    return true;
  }
  return false;
}

/** Project the saved source into the editor without ever interpreting pasted HTML. */
export function makeEditableMarkdown(document: Document, source: string, marks?: readonly NoteMarkdownMark[]) {
  const template = document.createElement('template');
  template.innerHTML = renderToStaticMarkup(<NoteMarkdown source={source} marks={marks} editable />);
  for (const atom of template.content.querySelectorAll(atomSelector)) {
    if (!atom.querySelector('.katex')) atom.replaceWith(document.createTextNode(atom.getAttribute('data-note-math-source') ?? ''));
  }
  return template.content;
}

export function readEditableMarkdown(editor: HTMLElement): { source: string; underlines: SourceRange[] } {
  const clone = editor.cloneNode(true) as HTMLElement;
  for (const caret of clone.querySelectorAll(noteInlineCaretSelector)) {
    const text = caret.firstChild;
    if (text instanceof Text) text.data = editorTextWithoutCaret(text);
    caret.replaceWith(...caret.childNodes);
  }
  const atoms = [...clone.querySelectorAll(atomSelector)];
  const mathSource = atoms.map((atom) => {
    const raw = atom.getAttribute('data-note-math-source') ?? '';
    if (!raw.includes('|') || !atom.closest('td,th')) return raw;
    const notation = findNoteNotation(raw);
    const math = notation.expressions[0];
    // Delimit shorthand containing pipes so it cannot split a Markdown table cell.
    return !notation.explicit.length && math?.start === 0 && math.end === raw.length
      ? '\\(' + math.math + '\\)' : raw;
  });
  const occupied = new Set((clone.textContent ?? '') + mathSource.join(''));
  const replacements = new Map<string, string>();
  let nextCodePoint = 0xf0000;
  function token() {
    let character = String.fromCodePoint(nextCodePoint++);
    while (occupied.has(character)) character = String.fromCodePoint(nextCodePoint++);
    return character;
  }

  // Replace typeset glyphs and hidden MathML with the exact source before serialization.
  atoms.forEach((atom, index) => {
    const marker = token();
    replacements.set(marker, mathSource[index]);
    atom.replaceWith(clone.ownerDocument.createTextNode(marker));
  });
  for (const table of clone.querySelectorAll('table')) {
    if (!table.rows[0]?.cells.length) table.remove();
  }

  const underlineStart = token();
  const underlineEnd = token();
  const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
  turndown.use(gfm);
  turndown.addRule('editorInlineMarks', {
    filter: (node) => node.nodeName === 'U' || (node.nodeName === 'SPAN' && (
      /^(?:bold|[6-9]00)$/.test(node.style.fontWeight) ||
      /^(?:italic|oblique)/.test(node.style.fontStyle) ||
      (node.style.textDecorationLine || node.style.textDecoration).includes('underline')
    )),
    replacement: (body, node) => {
      const { style } = node as HTMLElement;
      if (/^(?:bold|[6-9]00)$/.test(style.fontWeight)) body = '**' + body + '**';
      if (/^(?:italic|oblique)/.test(style.fontStyle)) body = '*' + body + '*';
      if (node.nodeName === 'U' || (style.textDecorationLine || style.textDecoration).includes('underline')) {
        body = underlineStart + body + underlineEnd;
      }
      return body;
    },
  });

  let source = '';
  let underlineDepth = 0;
  let underlineOffset = 0;
  const underlines: SourceRange[] = [];
  for (const character of turndown.turndown(clone)) {
    if (character === underlineStart) {
      if (!underlineDepth) underlineOffset = source.length;
      underlineDepth++;
    } else if (character === underlineEnd) {
      underlineDepth--;
      if (!underlineDepth && source.length > underlineOffset) underlines.push({ start: underlineOffset, end: source.length });
    } else {
      source += replacements.get(character) ?? character;
    }
  }
  return { source, underlines };
}

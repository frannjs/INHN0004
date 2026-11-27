export const noteInlineCaretSelector = '[data-note-inline-caret]';
const caretSpacer = '\u200b';
const editableBlocks = 'div,p,li,blockquote,ul,ol,pre,table,th,td,h1,h2,h3,h4,h5,h6';
const atomicElement = '[contenteditable="false"]';
const mathAtomSelector = '[data-note-math-source]';
export const notePasteBlocks = `${editableBlocks},hr,.note-math-block`;

export function createNoteInlineCaret(document: Document, id = '') {
  const caret = document.createElement('span');
  caret.dataset.noteInlineCaret = id;
  caret.textContent = caretSpacer;
  return caret;
}

export function editorTextWithoutCaret(text: Text) {
  const parent = text.parentElement;
  return parent?.matches(noteInlineCaretSelector) && parent.firstChild === text && text.data.startsWith(caretSpacer)
    ? text.data.slice(caretSpacer.length) : text.data;
}

function elementAt(node: Node) {
  return node instanceof Element ? node : node.parentElement;
}

export function selectionInsideNoteLiteral(editor: HTMLElement) {
  const selection = editor.ownerDocument.getSelection();
  if (!selection?.rangeCount) return false;
  const range = selection.getRangeAt(0);
  const literal = elementAt(range.startContainer)?.closest('a,code,pre');
  return Boolean(literal && editor.contains(literal) && literal.contains(range.endContainer));
}

function katexClipboardTex(katexNode: Element) {
  const annotation = katexNode.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
  if (!annotation) return null;
  if (katexNode.closest('.katex-display') || katexNode.getAttribute('display') === 'block') {
    return annotation.includes('$$') ? '\\[' + annotation + '\\]' : '$$' + annotation + '$$';
  }
  return annotation.includes('$') ? '\\(' + annotation + '\\)' : '$' + annotation + '$';
}

function enclosingMathUnit(root: Node, node: Node) {
  const el = elementAt(node);
  if (!el) return null;
  const noteAtom = el.closest(mathAtomSelector);
  if (noteAtom && root.contains(noteAtom)) return noteAtom;
  const displayKatex = el.closest('.katex-display');
  if (displayKatex && root.contains(displayKatex)) return displayKatex;
  const inlineKatex = el.closest('.katex');
  if (inlineKatex && root.contains(inlineKatex)) return inlineKatex;
  return null;
}

/** Expand partial selections inside rendered math so copying/cutting preserves complete formulas. */
export function expandMathSelectionRange(root: Node, range: Range) {
  const doc = root.ownerDocument ?? document;
  const expanded = range.cloneRange();
  const startUnit = enclosingMathUnit(root, expanded.startContainer);
  const endUnit = enclosingMathUnit(root, expanded.endContainer);

  if (startUnit && startUnit === endUnit) {
    if (!expanded.collapsed) expanded.selectNode(startUnit);
    return expanded;
  }
  if (startUnit) {
    const tail = doc.createRange();
    tail.setStart(expanded.startContainer, expanded.startOffset);
    tail.setEndAfter(startUnit);
    if (tail.toString().length > 0) expanded.setStartBefore(startUnit);
  }
  if (endUnit) {
    const head = doc.createRange();
    head.setStartBefore(endUnit);
    head.setEnd(expanded.endContainer, expanded.endOffset);
    if (head.toString().length > 0) expanded.setEndAfter(endUnit);
  }
  return expanded;
}

const blockTagNames = new Set(['DIV', 'P', 'LI', 'BLOCKQUOTE', 'UL', 'OL', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TR', 'TABLE']);
const structuralParentTags = new Set(['UL', 'OL', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR']);

function isBlockNode(node: Node | null): boolean {
  return node instanceof Element && (blockTagNames.has(node.tagName) || node.classList.contains('note-math-block'));
}

function serializeMathFragment(
  fragment: DocumentFragment | Element,
  markdownInline = false,
  fromExternalHtml = false,
  plainHint = '',
): string {
  let out = '';
  const skipped = new WeakSet<Node>();
  const totalListItems = fromExternalHtml ? fragment.querySelectorAll('li').length : 0;
  const keepSingleListMarker = !fromExternalHtml || totalListItems > 1 || /^\s*(?:[-*+•]|\d+[.)])\s/u.test(plainHint);

  const walk = (parent: Node, atLineEnd: boolean, insidePre = false) => {
    const rawChildren = Array.from(parent.childNodes);
    const children = rawChildren.filter((node) => {
      if (skipped.has(node)) return false;
      if (node instanceof Element) return true;
      if (!(node instanceof Text) || node.length === 0) return false;
      if (!fromExternalHtml || insidePre) return true;
      const cleaned = node.data.replace(/\u200b/g, '');
      if (!cleaned.length) return false;
      if (/\S/u.test(cleaned)) return true;
      if (parent instanceof Element && structuralParentTags.has(node.parentElement?.tagName ?? '')) return false;
      const prev = node.previousSibling;
      const next = node.nextSibling;
      if (!prev || !next || isBlockNode(prev) || isBlockNode(next)) return false;
      return true;
    });

    let first = true;
    let previousBlock = false;
    for (const [index, node] of children.entries()) {
      if (skipped.has(node)) continue;
      const isBlock = isBlockNode(node);
      const suppressParagraphBreakInLi = parent instanceof Element && parent.tagName === 'LI' && first && node instanceof Element && node.tagName === 'P';
      if (!first && !suppressParagraphBreakInLi && (isBlock || previousBlock) && !out.endsWith('\n')) {
        out += '\n';
      }
      first = false;
      previousBlock = isBlock;

      if (node instanceof Text) {
        let value = editorTextWithoutCaret(node);
        if (fromExternalHtml && !insidePre) {
          value = value.replace(/\u200b/g, '').replace(/\s*\r?\n\s*/g, ' ');
        }
        out += value;
        continue;
      }
      if (!(node instanceof Element)) continue;
      if (node.matches(noteInlineCaretSelector)) {
        const inner = node.firstChild;
        if (inner instanceof Text) out += editorTextWithoutCaret(inner);
        continue;
      }
      const noteMath = node.getAttribute('data-note-math-source');
      if (noteMath !== null) {
        out += noteMath;
        continue;
      }
      if (node.classList.contains('katex-display') || node.classList.contains('katex')) {
        const tex = katexClipboardTex(node);
        if (tex !== null) {
          out += tex;
          continue;
        }
      }
      if (node.classList.contains('katex-mathml') || node.tagName.toLowerCase() === 'math') {
        const tex = katexClipboardTex(node);
        if (tex !== null) {
          if (node.nextElementSibling?.classList.contains('katex-html')) {
            skipped.add(node.nextElementSibling);
          }
          out += tex;
          continue;
        }
        if (node.classList.contains('katex-mathml')) continue;
      }
      if (node.classList.contains('sr-only') || node.classList.contains('vlist-s') || node.hasAttribute('hidden')) {
        continue;
      }
      const lastInLine = atLineEnd && index === children.length - 1;
      if (node.tagName === 'BR') {
        if (!lastInLine) out += '\n';
        continue;
      }
      if (markdownInline) {
        if (node.tagName === 'CODE' && node.parentElement?.tagName !== 'PRE') {
          out += '`' + (node.textContent ?? '') + '`';
          continue;
        }
        if (node.tagName === 'PRE') {
          const code = node.textContent ?? '';
          out += '~~~\n' + code.replace(/\n$/, '') + '\n~~~';
          continue;
        }
        if (node.tagName === 'STRONG' || node.tagName === 'B') {
          out += '**';
          walk(node, false, insidePre);
          out += '**';
          continue;
        }
        if (node.tagName === 'EM' || node.tagName === 'I') {
          out += '*';
          walk(node, false, insidePre);
          out += '*';
          continue;
        }
        if (node.tagName === 'DEL') {
          out += '~~';
          walk(node, false, insidePre);
          out += '~~';
          continue;
        }
        if (node.tagName === 'LI') {
          if (keepSingleListMarker) {
            if (node.parentElement?.tagName === 'OL') {
              const items = Array.from(node.parentElement.children).filter((child) => child.tagName === 'LI');
              out += String(items.indexOf(node) + 1) + '. ';
            } else {
              out += '- ';
            }
          }
          walk(node, true, insidePre);
          continue;
        }
      }
      walk(node, isBlock || lastInLine, insidePre || node.tagName === 'PRE');
    }
  };
  walk(fragment, true, false);
  return out;
}

/** Extract clean source text (preserving LaTeX/shorthand formulas instead of duplicated KaTeX glyphs) for copy/cut. */
export function serializeSelectionWithMath(root: HTMLElement): { text: string; range: Range; hasMath: boolean } | null {
  const selection = (root.ownerDocument ?? document).getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return null;
  const rawRange = selection.getRangeAt(0);
  if (!root.contains(rawRange.commonAncestorContainer)) return null;
  const range = expandMathSelectionRange(root, rawRange);
  const clone = range.cloneContents();
  const hasMath = Boolean(clone.querySelector('[data-note-math-source],.katex,.katex-display,[data-note-inline-caret]'));
  const inMarkdown = Boolean(root.classList?.contains('note-markdown') || elementAt(range.commonAncestorContainer)?.closest('.note-markdown'));
  return { text: serializeMathFragment(clone, inMarkdown), range, hasMath };
}

/** Handle browser copy events so rendered KaTeX formulas copy their exact mathematical source. */
export function copySelectionWithMath(event: ClipboardEvent, root: HTMLElement, alwaysSerialize = false) {
  if (event.defaultPrevented || !event.clipboardData) return false;
  const serialized = serializeSelectionWithMath(root);
  if (!serialized || (!alwaysSerialize && !serialized.hasMath)) return false;
  event.clipboardData.setData('text/plain', serialized.text);
  event.preventDefault();
  return true;
}

/** Recover exact LaTeX from KaTeX clipboard HTML when a chat or web page flattened text/plain. */
export function extractPastedNoteText(clipboardData: DataTransfer | null, ownerDocument: Document = document) {
  if (!clipboardData) return '';
  const plain = clipboardData.getData('text/plain');
  const html = clipboardData.getData('text/html');
  if (!html || html === plain || (!html.includes('encoding="application/x-tex"') && !html.includes('data-note-math-source='))) {
    return plain;
  }
  const template = ownerDocument.createElement('template');
  template.innerHTML = html;
  for (const el of template.content.querySelectorAll('script,style,meta,link,title,head,svg')) el.remove();
  const extracted = serializeMathFragment(template.content, true, true, plain).trim();
  return extracted || plain;
}

/** Keep existing plain-text breaks when a pasted format introduces Markdown. */
export function preserveNoteLineBreaks(editor: HTMLElement) {
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  const anchor = { node: selection?.anchorNode ?? null, offset: selection?.anchorOffset ?? 0 };
  const focus = { node: selection?.focusNode ?? null, offset: selection?.focusOffset ?? 0 };
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node.parentElement?.closest('code,pre,' + atomicElement)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const lines: Text[] = [];
  while (walker.nextNode()) {
    const text = walker.currentNode as Text;
    if (/[\r\n]/u.test(text.data)) lines.push(text);
  }
  let restoreSelection = false;
  for (let line of lines) {
    for (let newline = /\r\n?|\n/u.exec(line.data); newline; newline = /\r\n?|\n/u.exec(line.data)) {
      const separator = line.splitText(newline.index);
      const nextLine = separator.splitText(newline[0].length);
      for (const point of [anchor, focus]) {
        if (point.node !== line || point.offset <= newline.index) continue;
        restoreSelection = true;
        const end = newline.index + newline[0].length;
        if (point.offset >= end) {
          point.node = nextLine;
          point.offset -= end;
        } else point.offset = newline.index;
      }
      separator.replaceWith(document.createElement('br'));
      line = nextLine;
    }
  }
  if (restoreSelection && anchor.node && focus.node && editor.contains(anchor.node) && editor.contains(focus.node)) {
    selection?.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
  }
}

function placeCaretAfterInserted(editor: HTMLElement, target: Node) {
  const doc = editor.ownerDocument;
  const selection = doc.getSelection();
  if (!selection) return;
  let leaf: Node = target;
  while (leaf instanceof Element && !leaf.matches(atomicElement) && leaf.lastChild) {
    leaf = leaf.lastChild;
  }
  const caret = doc.createRange();
  if (leaf instanceof Text) {
    caret.setStart(leaf, leaf.length);
  } else if (leaf instanceof Element && leaf.matches(atomicElement) && !leaf.classList.contains('note-math-block')) {
    if (leaf.nextSibling instanceof Text && leaf.nextSibling.length) {
      caret.setStart(leaf.nextSibling, 0);
    } else {
      const continuation = createNoteInlineCaret(doc);
      leaf.parentNode?.insertBefore(continuation, leaf.nextSibling);
      caret.setStart(continuation.firstChild!, caretSpacer.length);
    }
  } else if (leaf instanceof Element && leaf.tagName === 'BR' && leaf.parentNode) {
    caret.setStartBefore(leaf);
  } else if (leaf instanceof Element && leaf !== editor && (leaf.classList.contains('note-math-block') || leaf.tagName === 'HR' || leaf.tagName === 'TABLE')) {
    caret.setStartAfter(leaf);
  } else {
    caret.setStart(leaf, leaf.childNodes.length);
  }
  caret.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caret);
}

/** Paste at the selection without asking the browser to reinterpret inline markup as blocks. */
export function insertInlineNoteFragment(editor: HTMLElement, fragment: DocumentFragment) {
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  if (!selection?.rangeCount || !fragment.lastChild) return false;
  const range = selection.getRangeAt(0).cloneRange();
  if (!editor.contains(range.commonAncestorContainer)) return false;
  const blockAt = (node: Node) => elementAt(node)?.closest(editableBlocks) ?? editor;
  const startBlock = blockAt(range.startContainer);
  const endBlock = blockAt(range.endContainer);
  const joinsParagraphs = startBlock !== endBlock && endBlock.parentElement === editor && endBlock.matches('p,div')
    && (startBlock === editor || (startBlock.parentElement === editor && startBlock.matches('p,div')));
  if (startBlock !== endBlock && !joinsParagraphs) return false;

  const firstAtom = elementAt(range.startContainer)?.closest(atomicElement);
  const lastAtom = elementAt(range.endContainer)?.closest(atomicElement);
  if (firstAtom && editor.contains(firstAtom)) {
    if (range.collapsed) { range.setStartAfter(firstAtom); range.collapse(true); }
    else range.setStartBefore(firstAtom);
  }
  if (lastAtom && !range.collapsed && editor.contains(lastAtom)) range.setEndAfter(lastAtom);

  const last = fragment.lastChild;
  const insertion = range.cloneRange();
  insertion.collapse(true);
  range.deleteContents();
  insertion.insertNode(fragment);
  if (joinsParagraphs) {
    // Replacing text across paragraphs consumes the selected break. Keep the unselected suffix and its formatting.
    const suffix = document.createDocumentFragment();
    suffix.append(...endBlock.childNodes);
    if (startBlock === editor) editor.insertBefore(suffix, endBlock);
    else startBlock.append(suffix);
    endBlock.remove();
  }
  const caret = document.createRange();
  if (last instanceof Text) caret.setStart(last, last.length);
  else if (last.nextSibling instanceof Text && last.nextSibling.length) caret.setStart(last.nextSibling, 0);
  else {
    const continuation = createNoteInlineCaret(document);
    last.parentNode?.insertBefore(continuation, last.nextSibling);
    caret.setStart(continuation.firstChild!, caretSpacer.length);
  }
  caret.collapse(false);
  // Undo restores from HTML, where adjacent text nodes are parsed as one node.
  last.parentNode?.normalize();
  selection.removeAllRanges();
  selection.addRange(caret);
  return true;
}

function hasMeaningfulContent(root: ParentNode) {
  return Boolean((root.textContent ?? '').replace(/\u200b/g, '').trim()
    || root.querySelector('[data-note-math-source],hr,img,table,ul,ol,pre,blockquote'));
}

/** Insert block or list fragments directly into the editor DOM without browser execCommand('insertHTML') corruption of KaTeX tables. */
export function insertBlockNoteFragment(
  editor: HTMLElement,
  fragment: DocumentFragment,
  wholeNote: boolean,
  listItem: HTMLElement | null,
) {
  const doc = editor.ownerDocument;
  const selection = doc.getSelection();
  const children = Array.from(fragment.childNodes).filter((node) =>
    !(node instanceof Text && !node.data.trim() && fragment.children.length > 0)
  );
  if (!children.length) return false;
  const clean = doc.createDocumentFragment();
  clean.append(...children);
  const last = clean.lastChild!;

  if (wholeNote) {
    editor.replaceChildren(clean);
    placeCaretAfterInserted(editor, last);
    return true;
  }

  if (!selection?.rangeCount || !editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
    editor.append(clean);
    placeCaretAfterInserted(editor, last);
    return true;
  }

  const range = expandMathSelectionRange(editor, selection.getRangeAt(0));
  if (listItem && listItem.contains(range.commonAncestorContainer)) {
    range.deleteContents();
    range.insertNode(clean);
    listItem.normalize();
    placeCaretAfterInserted(editor, last);
    return true;
  }

  range.deleteContents();
  if (range.startContainer === editor) {
    const ref = editor.childNodes[range.startOffset] ?? null;
    editor.insertBefore(clean, ref);
    placeCaretAfterInserted(editor, last);
    return true;
  }

  let topChild: Node = range.startContainer;
  while (topChild.parentNode && topChild.parentNode !== editor) {
    topChild = topChild.parentNode;
  }
  if (topChild.parentNode !== editor) {
    editor.append(clean);
    placeCaretAfterInserted(editor, last);
    return true;
  }

  if (topChild instanceof HTMLElement && topChild.matches('div,p')) {
    const tailRange = doc.createRange();
    tailRange.selectNodeContents(topChild);
    tailRange.setStart(range.startContainer, range.startOffset);
    const tailFrag = tailRange.extractContents();
    const beforeNonEmpty = hasMeaningfulContent(topChild);
    const afterNonEmpty = hasMeaningfulContent(tailFrag);
    editor.insertBefore(clean, topChild.nextSibling);
    if (!beforeNonEmpty) topChild.remove();
    if (afterNonEmpty) {
      const afterBlock = doc.createElement(topChild.tagName.toLowerCase());
      afterBlock.append(tailFrag);
      editor.insertBefore(afterBlock, last.nextSibling);
    }
  } else {
    range.insertNode(clean);
    if (last.nextSibling?.nodeName === 'BR' && !last.nextSibling.nextSibling) {
      last.nextSibling.remove();
    }
  }
  placeCaretAfterInserted(editor, last);
  return true;
}

import { type KeyboardEvent, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hasNoteMarkdown } from '../../lib/noteMarkdownSyntax';
import { findNoteNotation } from '../../lib/noteNotation';
import { bold, decodeBody, encodeBody, italic, markdownMarks, notePlainText, underline, type Run } from './NoteBody';
import { completeNoteMath, editNoteMathAtom, lockNoteMathAtoms, noteMathSeparators, noteMathSource, prepareNoteMathFragment, renderNoteMathAtoms } from './noteEditableMath';
import { completeNoteMarkdown, makeEditableMarkdown, prepareNoteListPaste, readEditableMarkdown, startNoteBullet } from './noteEditableMarkdown';
import { captureNoteEditor, NoteEditorHistory, restoreNoteEditor } from './noteEditorHistory';
import { editorTextWithoutCaret, extractPastedNoteText, insertBlockNoteFragment, insertInlineNoteFragment, notePasteBlocks, preserveNoteLineBreaks, selectionInsideNoteLiteral, copySelectionWithMath, serializeSelectionWithMath } from './noteEditableSelection';

const formats = [
  { command: 'bold', label: 'Bold', key: 'b', mark: bold },
  { command: 'italic', label: 'Italic', key: 'i', mark: italic },
  { command: 'underline', label: 'Underline', key: 'u', mark: underline },
] as const;

function readEditor(editor: HTMLDivElement) {
  const runs: Run[] = [];
  const append = (text: string, marks: number) => {
    if (!text) return;
    const last = runs.at(-1);
    if (last?.[1] === marks) last[0] += text;
    else runs.push([text, marks]);
  };
  const walk = (parent: HTMLElement, inherited: number, atLineEnd: boolean) => {
    let first = true;
    let previousBlock = false;
    const children = Array.from(parent.childNodes).filter((node): node is Text | HTMLElement =>
      node instanceof HTMLElement || (node instanceof Text && node.length > 0)
    );
    for (const [index, node] of children.entries()) {
      const childBlock = node.nodeName === 'DIV' || node.nodeName === 'P';
      if (!first && (childBlock || previousBlock) && (previousBlock || !runs.at(-1)?.[0].endsWith('\n'))) {
        append('\n', 0);
      }
      first = false;
      previousBlock = childBlock;
      if (node instanceof Text) {
        append(editorTextWithoutCaret(node), inherited);
        continue;
      }
      const equation = noteMathSource(node);
      if (equation !== null) {
        append(equation, inherited);
        continue;
      }
      const lastInLine = atLineEnd && index === children.length - 1;
      if (node.nodeName === 'BR') {
        // Browsers add a trailing break to hold the caret, sometimes inside a styled span.
        if (!lastInLine) append('\n', 0);
        continue;
      }
      let marks = inherited;
      if (node.nodeName === 'B' || node.nodeName === 'STRONG') marks |= bold;
      if (node.nodeName === 'I' || node.nodeName === 'EM') marks |= italic;
      if (node.nodeName === 'U') marks |= underline;
      // Native editing commands may wrap a selection in a styled span instead of a tag.
      const weight = node.style.fontWeight;
      if (weight) marks = weight === 'bold' || Number(weight) >= 600 ? marks | bold : marks & ~bold;
      const slant = node.style.fontStyle;
      if (slant) marks = /^(italic|oblique)/.test(slant) ? marks | italic : marks & ~italic;
      const decoration = node.style.textDecorationLine || node.style.textDecoration;
      if (decoration) marks = decoration.includes('underline') ? marks | underline : marks & ~underline;
      walk(node, marks, childBlock || lastInLine);
    }
  };
  walk(editor, 0, true);
  return encodeBody(runs);
}

function restoreEditor(editor: HTMLDivElement, body: string) {
  const content = editor.ownerDocument.createDocumentFragment();
  for (const [text, marks] of decodeBody(body)) {
    if (!text) continue;
    let node: Node = editor.ownerDocument.createTextNode(text);
    for (const [mark, tag] of [[bold, 'strong'], [italic, 'em'], [underline, 'u']] as const) {
      if (!(marks & mark)) continue;
      const wrapper = editor.ownerDocument.createElement(tag);
      wrapper.append(node);
      node = wrapper;
    }
    content.append(node);
  }
  editor.replaceChildren(content);
}

interface EditorProps {
  value: string;
  onChange: (body: string) => void;
  disabled?: boolean;
  editorRef: RefObject<HTMLDivElement | null>;
  onSave: () => void;
}

const markdownStructure = 'h1,h2,h3,h4,h5,h6,blockquote,ul,ol,pre,code,table,hr,a,del';
const isLineBreak = (type: string) => type === 'insertParagraph' || type === 'insertLineBreak';

function readMarkdownBody(editor: HTMLDivElement) {
  const { source, underlines } = readEditableMarkdown(editor);
  if (!underlines.length) return source;
  const runs: Run[] = [];
  let position = 0;
  for (const { start, end } of underlines) {
    if (start > position) runs.push([source.slice(position, start), 0]);
    runs.push([source.slice(start, end), underline]);
    position = end;
  }
  if (position < source.length) runs.push([source.slice(position), 0]);
  return encodeBody(runs);
}

function replacesWholeNote(editor: HTMLDivElement) {
  const selection = editor.ownerDocument.getSelection();
  if (!selection?.rangeCount) return !editor.textContent;
  const selected = selection.getRangeAt(0);
  if (!editor.contains(selected.commonAncestorContainer)) return false;
  const before = editor.ownerDocument.createRange();
  before.selectNodeContents(editor);
  const after = before.cloneRange();
  before.setEnd(selected.startContainer, selected.startOffset);
  after.setStart(selected.endContainer, selected.endOffset);
  const hasContent = (range: Range) => range.toString().trim()
    || range.cloneContents().querySelector('hr,table,img,input,[data-note-math-source]');
  return !hasContent(before) && !hasContent(after);
}

function listItemAtSelection(editor: HTMLDivElement) {
  const selection = editor.ownerDocument.getSelection();
  const itemAt = (node: Node | null | undefined) =>
    (node instanceof Element ? node : node?.parentElement)?.closest('li');
  const item = itemAt(selection?.anchorNode);
  return item && editor.contains(item) && itemAt(selection?.focusNode) === item ? item : null;
}

export function NoteEditor({ value, onChange, disabled, editorRef, onSave }: EditorProps) {
  const [marks, setMarks] = useState(0);
  const [sourceMode, setSourceMode] = useState(false);
  const [history] = useState(() => new NoteEditorHistory());
  const local = useRef<string | null>(null);
  const lastRange = useRef<Range | null>(null);
  const currentMode = useRef<boolean | null>(null);
  const snapshot = useRef<{ html: string; body: string } | null>(null);
  const usesMarkdown = useRef(false);
  const writingVisual = useRef(false);
  const lineEnd = useRef<{ text: Text; offset: number } | null>(null);
  const plain = notePlainText(value);
  const showSourceToggle = sourceMode || hasNoteMarkdown(plain) || findNoteNotation(plain).expressions.length > 0;

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || (local.current === value && currentMode.current === sourceMode)) return;
    const changeOfMode = currentMode.current !== null && currentMode.current !== sourceMode;
    const source = notePlainText(value);
    const runs = decodeBody(value);
    usesMarkdown.current = !sourceMode && hasNoteMarkdown(source);
    if (usesMarkdown.current) {
      editor.replaceChildren(makeEditableMarkdown(editor.ownerDocument, source, markdownMarks(runs)));
    } else {
      restoreEditor(editor, value);
      if (!sourceMode) renderNoteMathAtoms(editor);
    }
    snapshot.current = { html: editor.innerHTML, body: value };
    local.current = value;
    currentMode.current = sourceMode;
    lastRange.current = null;
    setMarks(0);
    if (changeOfMode) {
      editor.focus({ preventScroll: true });
      editor.ownerDocument.getSelection()?.collapse(editor, editor.childNodes.length);
    }
    history.reset(captureNoteEditor(editor, value, usesMarkdown.current));
  }, [value, sourceMode, editorRef, history]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const doc = editor.ownerDocument;
    editor.focus({ preventScroll: true });
    const rememberSelection = () => {
      const selection = doc.getSelection();
      if (!selection?.rangeCount || !editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return;
      lastRange.current = selection.getRangeAt(0).cloneRange();
      setMarks(formats.reduce((active, { command, mark }) => doc.queryCommandState?.(command) ? active | mark : active, 0));
    };
    doc.addEventListener('selectionchange', rememberSelection);
    return () => doc.removeEventListener('selectionchange', rememberSelection);
  }, [editorRef]);

  const updateBody = (editor: HTMLDivElement, typing = false) => {
    const structured = Boolean(editor.querySelector(markdownStructure));
    if (!editor.textContent && !structured) usesMarkdown.current = false;
    editor.classList.toggle('note-markdown', !sourceMode && (usesMarkdown.current || structured));
    const original = snapshot.current;
    const html = editor.innerHTML;
    const body = original && html === original.html ? original.body
      : !sourceMode && (usesMarkdown.current || structured) ? readMarkdownBody(editor)
      : readEditor(editor);
    history.record(captureNoteEditor(editor, body, usesMarkdown.current, html), typing);
    if (local.current === body) return;
    local.current = body;
    onChange(body);
  };

  const moveHistory = (editor: HTMLDivElement, direction: -1 | 1) => {
    const state = history.step(direction);
    if (!state) return;
    usesMarkdown.current = state.markdown;
    restoreNoteEditor(editor, state);
    snapshot.current = { html: editor.innerHTML, body: state.body };
    local.current = state.body;
    onChange(state.body);
  };

  function visualChange(change: () => boolean) {
    writingVisual.current = true;
    try { return change(); }
    finally { writingVisual.current = false; }
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || disabled) return;
    const beforeInput = (event: InputEvent) => {
      if (writingVisual.current || !event.cancelable || event.isComposing) return;
      if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
        event.preventDefault();
        moveHistory(editor, event.inputType === 'historyUndo' ? -1 : 1);
        return;
      }
      if (sourceMode) return;
      lineEnd.current = null;
      if (isLineBreak(event.inputType)) {
        const selection = editor.ownerDocument.getSelection();
        if (selection?.isCollapsed && selection.anchorNode instanceof Text) {
          lineEnd.current = { text: selection.anchorNode, offset: selection.anchorOffset };
        }
        return;
      }
      const text = event.inputType === 'insertText' ? event.data : null;
      if (/^deleteContent(?:Backward|Forward)$/.test(event.inputType) && editor.querySelector('li')) {
        const selection = editor.ownerDocument.getSelection();
        if (selection?.rangeCount && !selection.isCollapsed && replacesWholeNote(editor)) {
          const before = editor.innerHTML;
          selection.selectAllChildren(editor);
          const cleared = visualChange(() => {
            const document = editor.ownerDocument;
            document.execCommand('delete', false);
            const item = editor.querySelector('li');
            if (!editor.textContent && item) {
              selection.collapse(item, 0);
              document.execCommand(item.parentElement?.matches('ol') ? 'insertOrderedList' : 'insertUnorderedList', false);
            }
            return editor.innerHTML !== before;
          });
          if (cleared) {
            event.preventDefault();
            updateBody(editor);
          }
          return;
        }
      }
      if (text === ' ' && visualChange(() => startNoteBullet(editor))) {
        event.preventDefault();
        usesMarkdown.current = true;
        updateBody(editor);
        return;
      }
      if (text && !noteMathSeparators.test(text) && visualChange(() => completeNoteMath(editor, text))) {
        event.preventDefault();
        updateBody(editor, true);
      }
    };
    editor.addEventListener('beforeinput', beforeInput);
    return () => editor.removeEventListener('beforeinput', beforeInput);
  });

  const format = (command: typeof formats[number]['command']) => {
    const editor = editorRef.current;
    if (!editor || disabled) return;
    const doc = editor.ownerDocument;
    const selection = doc.getSelection();
    const current = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const range = current && editor.contains(current.commonAncestorContainer) ? current.cloneRange() : lastRange.current;
    editor.focus({ preventScroll: true });
    if (selection && range && editor.contains(range.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    doc.execCommand?.(command, false);
    updateBody(editor);
    setMarks(formats.reduce((active, { command, mark }) => doc.queryCommandState?.(command) ? active | mark : active, 0));
  };

  function saveShortcut(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.nativeEvent.isComposing || event.key !== 'Enter') return;
    event.preventDefault();
    onSave();
  }

  function paste(editor: HTMLDivElement, text: string) {
    if (!text) return;
    const doc = editor.ownerDocument;
    const literal = !sourceMode && selectionInsideNoteLiteral(editor);
    const listItem = !sourceMode && !literal && listItemAtSelection(editor);
    const markdown = !sourceMode && !literal && hasNoteMarkdown(text);
    const nativeMath = sourceMode || markdown || literal ? null : prepareNoteMathFragment(doc, text);
    const multiline = /[\r\n]/u.test(text);
    const useMarkup = markdown || (listItem && multiline) || Boolean(nativeMath?.count);
    const wholeNote = !listItem && !literal && replacesWholeNote(editor);
    if (literal) {
      const fragment = doc.createDocumentFragment();
      fragment.append(text);
      if (insertInlineNoteFragment(editor, fragment)) { updateBody(editor); return; }
    }

    const finishPaste = () => {
      if (!sourceMode) lockNoteMathAtoms(editor);
      if (wholeNote || markdown) usesMarkdown.current = markdown;
      if (wholeNote) snapshot.current = { html: editor.innerHTML, body: text };
      updateBody(editor);
    };
    if (useMarkup) {
      const fragment = markdown ? makeEditableMarkdown(doc, text) : nativeMath!.fragment;
      if (markdown && !multiline && fragment.childNodes.length === 1 && fragment.firstChild instanceof HTMLParagraphElement) {
        const paragraph = fragment.firstChild;
        const leading = /^[ \t]+/u.exec(text)?.[0];
        const trailing = /[ \t]+$/u.exec(text)?.[0];
        paragraph.replaceWith(...paragraph.childNodes);
        // Markdown removes outer paragraph padding, which can be an intentional separator in a paste.
        if (leading) fragment.prepend(leading);
        if (trailing) fragment.append(trailing);
      } else if (listItem || (!markdown && multiline)) prepareNoteListPaste(fragment, markdown);
      if (markdown && !wholeNote && !usesMarkdown.current) preserveNoteLineBreaks(editor);
      if (!fragment.querySelector(notePasteBlocks) && insertInlineNoteFragment(editor, fragment)) {
        finishPaste();
        return;
      }
      if (insertBlockNoteFragment(editor, fragment, wholeNote, listItem || null)) {
        finishPaste();
        return;
      }
      return;
    }
    const previous = editor.innerHTML;
    const inserted = visualChange(() => Boolean(doc.execCommand?.('insertText', false, text)));
    if (!inserted && editor.innerHTML === previous) {
      const plainFragment = doc.createDocumentFragment();
      plainFragment.append(text);
      if (!insertInlineNoteFragment(editor, plainFragment)) return;
    }
    finishPaste();
  }

  return <>
    <div className="note-editor-tools" role="group" aria-label="Text formatting" onKeyDown={saveShortcut}>
      <div className="note-editor-formatting">
        {formats.map(({ command, label, key, mark }) => <button
          key={command}
          type="button"
          className={`note-editor-tool note-editor-${command}`}
          aria-label={label}
          aria-pressed={Boolean(marks & mark)}
          title={`${label} (⌘ / Ctrl ${key.toUpperCase()})`}
          disabled={disabled}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => format(command)}
        >{key.toUpperCase()}</button>)}
      </div>
      {showSourceToggle && <button type="button" className="note-editor-preview-toggle" disabled={disabled}
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => setSourceMode(!sourceMode)}>{sourceMode ? 'Visual' : 'Source'}</button>}
    </div>
    <div
      ref={editorRef}
      className={`note-editor-input${!sourceMode && (usesMarkdown.current || hasNoteMarkdown(plain)) ? ' note-markdown' : ''}`}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      aria-label="Your note"
      aria-multiline="true"
      aria-placeholder="Write a note…"
      aria-disabled={disabled || undefined}
      data-empty={!plain}
      onInput={(event) => {
        if (writingVisual.current) return;
        const editor = event.currentTarget;
        const input = event.nativeEvent as InputEvent;
        const previousLine = lineEnd.current;
        lineEnd.current = null;
        if (!sourceMode && previousLine && isLineBreak(input.inputType) && editor.contains(previousLine.text)) {
          const selection = editor.ownerDocument.getSelection();
          const afterBreak = selection?.rangeCount && selection.getRangeAt(0).cloneRange();
          if (afterBreak && previousLine.text.length >= previousLine.offset) {
            // Insert the browser's line break before replacing the pending formula.
            selection.collapse(previousLine.text, previousLine.offset);
            visualChange(() => completeNoteMath(editor, '', true));
            selection.removeAllRanges();
            selection.addRange(afterBreak);
          }
        }
        if (!sourceMode) lockNoteMathAtoms(editor);
        const typing = input.inputType === 'insertText' && !input.isComposing;
        if (sourceMode || !typing || !input.data || !/[\s,.;:!?*_~\x60]$/u.test(input.data)) {
          updateBody(editor, typing);
          return;
        }
        const typedSeparator = input.data && noteMathSeparators.test(input.data);
        queueMicrotask(() => {
          if (!editor.isConnected || editor.ownerDocument.activeElement !== editor || currentMode.current) return;
          const completedMath = typedSeparator && visualChange(() => completeNoteMath(editor, ''));
          if (!completedMath && visualChange(() => completeNoteMarkdown(editor))) {
            usesMarkdown.current = true;
            lockNoteMathAtoms(editor);
          }
          updateBody(editor, true);
        });
      }}
      onKeyDown={(event) => {
        if (/^(?:Arrow|Home|End|Page)/.test(event.key)) history.pauseTyping();
        if (!(event.metaKey || event.ctrlKey) || event.altKey || event.nativeEvent.isComposing) return;
        const key = event.key.toLowerCase();
        if (key === 'z' || (key === 'y' && event.ctrlKey)) {
          event.preventDefault();
          if (!disabled) moveHistory(event.currentTarget, event.shiftKey || key === 'y' ? 1 : -1);
          return;
        }
        if (event.key === 'Enter') return saveShortcut(event);
        const match = !event.shiftKey && formats.find((format) => format.key === key);
        if (match) {
          event.preventDefault();
          format(match.command);
        }
      }}
      onPointerDown={() => history.pauseTyping()}
      onDoubleClick={(event) => {
        if (sourceMode || disabled || !(event.target instanceof Element)) return;
        const target = event.target;
        if (visualChange(() => editNoteMathAtom(event.currentTarget, target))) updateBody(event.currentTarget);
      }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
      }}
      onCopy={(event) => {
        if (!sourceMode) copySelectionWithMath(event.nativeEvent, event.currentTarget, true);
      }}
      onCut={(event) => {
        if (sourceMode || !event.clipboardData) return;
        const editor = event.currentTarget;
        const serialized = serializeSelectionWithMath(editor);
        if (!serialized) return;
        event.clipboardData.setData('text/plain', serialized.text);
        event.preventDefault();
        if (disabled) return;
        const selection = editor.ownerDocument.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(serialized.range);
        }
        const before = editor.innerHTML;
        visualChange(() => Boolean(editor.ownerDocument.execCommand?.('delete')));
        if (editor.innerHTML === before) {
          serialized.range.deleteContents();
        }
        updateBody(editor);
      }}
      onPaste={(event) => {
        event.preventDefault();
        paste(event.currentTarget, extractPastedNoteText(event.clipboardData, event.currentTarget.ownerDocument));
      }}
      onDrop={(event) => event.preventDefault()}
    />
  </>;
}

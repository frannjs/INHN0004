// @vitest-environment happy-dom
import React, { useRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { NoteBody, notePlainText } from '../src/components/notes/NoteBody';
import { NoteEditor } from '../src/components/notes/NoteEditor';
import { completeNoteMath } from '../src/components/notes/noteEditableMath';

afterEach(cleanup);

function Composer({ onSave, initial = '' }: { onSave: (body: string) => void; initial?: string }) {
  const [body, setBody] = useState(initial);
  const editorRef = useRef<HTMLDivElement>(null);
  return <NoteEditor editorRef={editorRef} value={body} onChange={setBody} onSave={() => onSave(body)} />;
}

test('note formatting survives saving and keeps the blank line from the native editor', () => {
  let saved = '';
  const composer = render(<Composer onSave={(body) => { saved = body; }} />);
  const input = screen.getByRole('textbox', { name: 'Your note' });
  input.innerHTML = '<b>one</b> <i>two</i> <u>three</u><div><u><br></u></div><div>&lt;img src=missing&gt;</div>';
  fireEvent.input(input);
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
  expect(notePlainText(saved)).toBe('one two three\n\n<img src=missing>');
  composer.unmount();

  const rendered = render(<NoteBody body={saved} />).container;
  expect(rendered.querySelector('strong')?.textContent).toBe('one');
  expect(rendered.querySelector('em')?.textContent).toBe('two');
  expect(rendered.querySelector('u')?.textContent).toBe('three');
  expect(rendered.querySelector('img')).toBeNull();
});

test('a plain note containing HTML-like text stays literal', () => {
  const plain = '<b>one</b> plus file_name';
  const rendered = render(<NoteBody body={plain} />).container;
  expect(rendered.textContent).toBe(plain);
  expect(rendered.querySelector('b,strong,em')).toBeNull();
});

test('clearing the editor restores the placeholder even with a browser caret break', () => {
  render(<Composer onSave={() => {}} />);
  const input = screen.getByRole('textbox', { name: 'Your note' });
  input.textContent = 'Draft';
  fireEvent.input(input);
  expect(input.getAttribute('data-empty')).toBe('false');

  input.replaceChildren(document.createElement('br'), document.createTextNode(''));
  fireEvent.input(input);
  expect(input.getAttribute('data-empty')).toBe('true');
});

test('inline and display equations render without altering the note source', () => {
  const source = String.raw`Take \(A=\{0,1,2,3,4,5,6\}\).

\[[3]_R = \{0,3,6\}\]`;
  const rendered = render(<NoteBody body={source} />).container;
  expect(rendered.querySelectorAll('.note-math .katex')).toHaveLength(2);
  expect(rendered.querySelector('.note-math-block .katex-display')).not.toBeNull();
  expect(notePlainText(source)).toBe(source);
});

test('a formatted run inside an equation keeps the equation together and adjacent prose styled', () => {
  const body = '\u001fnotes:1\n' + JSON.stringify([
    ['Pick ', 1], ['\\(a', 0], ['=3', 2], ['\\).', 0],
  ]);
  const rendered = render(<NoteBody body={body} />).container;
  expect(rendered.querySelector('strong')?.textContent).toBe('Pick ');
  expect(rendered.querySelectorAll('.note-math .katex')).toHaveLength(1);
  expect(rendered.querySelector('annotation')?.textContent).toBe('a=3');
});

test('unsupported math stays readable as literal source', () => {
  const source = String.raw`Try \(\unknownMacro{x}\) and leave $5 alone.`;
  const rendered = render(<NoteBody body={source} />).container;
  expect(rendered.textContent).toBe(source);
  expect(rendered.querySelector('.katex-error')).toBeNull();
});

test('the visual editor typesets notation and keeps source mode and persistence exact', () => {
  let saved = '';
  const source = 'The ratio is 2/3.';
  render(<Composer initial={source} onSave={(body) => { saved = body; }} />);
  const input = screen.getByRole('textbox', { name: 'Your note' });
  expect(input.querySelector('.note-editor-math-atom annotation')?.textContent).toMatch(/\\[dt]?frac\{2\}\{3\}/);
  fireEvent.click(screen.getByRole('button', { name: 'Source' }));
  expect(document.activeElement).toBe(input);
  expect(input.textContent).toBe(source);
  fireEvent.click(screen.getByRole('button', { name: 'Visual' }));
  expect(input.querySelector('.note-editor-math-atom')).not.toBeNull();
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
  expect(notePlainText(saved)).toBe(source);
});

test('undo and redo restore the complete formatted line and its caret', () => {
  let saved = '';
  render(<Composer initial={'This means that:\n'} onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  editor.innerHTML = 'This means that:<div>if <span contenteditable="false" data-note-math-source="a-&gt;b">a→b</span> then</div>';
  const trailing = editor.lastChild!.lastChild!;
  editor.ownerDocument.getSelection()!.collapse(trailing, 5);
  fireEvent.input(editor);

  fireEvent.keyDown(editor, { key: 'z', ctrlKey: true });
  expect(editor.textContent).toBe('This means that:\n');
  fireEvent.keyDown(editor, { key: 'Z', ctrlKey: true, shiftKey: true });
  expect(editor.querySelector('[data-note-math-source]')?.textContent).toBe('a→b');
  expect(editor.ownerDocument.getSelection()?.anchorNode?.textContent).toBe(' then');
  expect(editor.ownerDocument.getSelection()?.anchorOffset).toBe(5);
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe('This means that:\nif a->b then');
});

test('pasted inline math stays inside the current line and leaves the caret before its original suffix', () => {
  let saved = '';
  const prefix = 'Every pair being comparable means, For any ';
  const pasted = String.raw`\(a,b \in A\), we have \(aRb\) or \(bRa\)`;
  render(<Composer onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  editor.innerHTML = `Earlier paragraph.<div><br></div><div>${prefix}!</div>`;
  fireEvent.input(editor);
  const line = editor.lastElementChild!;
  editor.ownerDocument.getSelection()!.collapse(line.firstChild!, prefix.length);

  fireEvent.paste(editor, { clipboardData: { getData: () => pasted } });

  const formulas = [...line.querySelectorAll('[data-note-math-source]')];
  expect(formulas).toHaveLength(3);
  expect(editor.querySelectorAll('[data-note-math-source]')).toHaveLength(formulas.length);
  expect(editor.lastElementChild).toBe(line);
  expect(editor.ownerDocument.getSelection()?.anchorNode?.textContent).toBe('!');
  expect(editor.ownerDocument.getSelection()?.anchorOffset).toBe(0);
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe(`Earlier paragraph.\n\n${prefix}${pasted}!`);
});

test('pasting a terminal formula keeps its caret spacer out of the saved note', () => {
  let saved = '';
  render(<Composer initial="For any " onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  editor.ownerDocument.getSelection()!.collapse(editor.firstChild!, 8);
  fireEvent.paste(editor, { clipboardData: { getData: () => String.raw`\(a,b \in A\)` } });
  expect(editor.querySelector('[data-note-math-source]')?.nextElementSibling?.matches('[data-note-inline-caret]')).toBe(true);
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe(String.raw`For any \(a,b \in A\)`);
});

test('pasting inline Markdown retains preceding line breaks and the clipboard separator', () => {
  let saved = '';
  render(<Composer initial={'Earlier paragraph.\n\nFor any'} onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  editor.ownerDocument.getSelection()!.collapse(editor.firstChild!, editor.textContent!.length);

  fireEvent.paste(editor, { clipboardData: { getData: () => ' **member** of the set.' } });

  expect(editor.querySelectorAll('br')).toHaveLength(2);
  expect(editor.querySelector('p')).toBeNull();
  expect(editor.querySelector('strong')?.previousSibling?.textContent).toBe('For any ');
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toMatch(/^Earlier paragraph\.[ \n]+For any \*\*member\*\* of the set\.$/u);
  expect(saved).toContain('\n');
});

test('replacing a selection across two prose lines joins the untouched prefix and suffix', () => {
  let saved = '';
  render(<Composer onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  editor.innerHTML = 'Left start selected<div>selected end <em>Right</em>.</div>';
  fireEvent.input(editor);
  editor.ownerDocument.getSelection()!.setBaseAndExtent(editor.firstChild!, 11, editor.lastElementChild!.firstChild!, 12);
  const pasted = String.raw`\(aRb\)`;

  fireEvent.paste(editor, { clipboardData: { getData: () => pasted } });

  expect(editor.querySelectorAll('[data-note-math-source]')).toHaveLength(1);
  expect(editor.querySelector('div')).toBeNull();
  expect(editor.querySelector('em')?.textContent).toBe('Right');
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(notePlainText(saved)).toBe(`Left start ${pasted} Right.`);
});

test('renders ordinary set and ordered-pair notation without TeX delimiters', () => {
  const source = 'Take A = {1,2,3}. The partition {{1,2},{3}} gives this relation.\n\n'
    + 'R = {(1,1), (1,2), (2,1), (2,2), (3,3)}.';
  const rendered = render(<NoteBody body={source} />).container;
  expect(rendered.querySelectorAll('.note-math .katex')).toHaveLength(3);
  expect(rendered.textContent).toContain('gives this relation.');
  expect(notePlainText(source)).toBe(source);
});

test('renders lonely uppercase letters like A and L and postfix E* and E+ as math', () => {
  const source = 'Consider A and L with closures E* and E+.';
  const rendered = render(<NoteBody body={source} />).container;
  const annotations = [...rendered.querySelectorAll('.note-math annotation')].map((el) => el.textContent);
  expect(annotations).toEqual(['A', 'L', 'E^{*}', 'E^{+}']);
});

test('copying and cutting rendered math in NoteEditor and NoteBody preserves exact source instead of H R or R R', () => {
  let saved = '';
  render(<Composer initial="Consider $H_R$ and R and E*." onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  const atoms = editor.querySelectorAll('[data-note-math-source]');
  expect(atoms).toHaveLength(3);

  // Simulate dragging across the inner KaTeX glyphs of $H_R$ inside NoteEditor and copying.
  const hrGlyphs = atoms[0].querySelectorAll('.katex-html .mord');
  const selection = editor.ownerDocument.getSelection()!;
  selection.setBaseAndExtent(hrGlyphs[0].firstChild!, 0, hrGlyphs[hrGlyphs.length - 1].firstChild ?? hrGlyphs[hrGlyphs.length - 1], 1);
  let copied = '';
  const clipboardData = {
    setData: (_type: string, data: string) => { copied = data; },
    getData: (type: string) => type === 'text/plain' ? copied : '',
  };
  fireEvent.copy(atoms[0], { clipboardData });
  expect(copied).toBe('$H_R$');

  // Paste the copied $H_R$ at the end of the note — it stays a rendered $H_R$ atom, never "H R".
  selection.collapse(editor.lastChild!, editor.lastChild!.textContent!.length);
  fireEvent.paste(editor, { clipboardData });
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe('Consider $H_R$ and R and E*.$H_R$');

  // Also verify copying an italic lonely R from a saved NoteBody produces "R" (never "R R") and $H_R$ produces "$H_R$".
  const savedContainer = render(<div className="note-body"><NoteBody body="Check $H_R$ and R." /></div>).container;
  const savedMath = savedContainer.querySelectorAll('.note-math');
  expect(savedMath).toHaveLength(2);

  const rText = savedMath[1].querySelector('.katex-html .mord')!.firstChild!;
  selection.setBaseAndExtent(rText, 0, rText, 1);
  copied = '';
  fireEvent.copy(savedMath[1], { clipboardData });
  expect(copied).toBe('R');

  const savedHr = savedMath[0].querySelector('.katex-html')!;
  const hrRange = document.createRange();
  hrRange.selectNodeContents(savedHr);
  selection.removeAllRanges();
  selection.addRange(hrRange);
  copied = '';
  fireEvent.copy(savedMath[0], { clipboardData });
  expect(copied).toBe('$H_R$');
});

test('cutting a rendered formula in NoteEditor copies its exact source and deletes the atom cleanly', () => {
  let saved = '';
  render(<Composer initial="Keep A and $H_R$ here" onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  const hrAtom = editor.querySelector('[data-note-math-source="$H_R$"]')!;
  const selection = editor.ownerDocument.getSelection()!;
  const cutRange = editor.ownerDocument.createRange();
  cutRange.selectNode(hrAtom);
  selection.removeAllRanges();
  selection.addRange(cutRange);

  let cutText = '';
  const clipboardData = {
    setData: (_type: string, data: string) => { cutText = data; },
    getData: () => cutText,
  };
  fireEvent.cut(editor, { clipboardData });
  expect(cutText).toBe('$H_R$');
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe('Keep A and  here');
});

test('pasting flattened KaTeX HTML from an external chat recovers the underlying TeX annotation', () => {
  let saved = '';
  render(<Composer onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  const selection = editor.ownerDocument.getSelection()!;
  selection.collapse(editor, 0);

  const chatHtml = '<span>See <span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mi>H</mi><mi>R</mi></msub></mrow><annotation encoding="application/x-tex">H_R</annotation></semantics></math></span><span class="katex-html" aria-hidden="true">H R</span></span> now</span>';
  fireEvent.paste(editor, {
    clipboardData: {
      getData: (type: string) => type === 'text/html' ? chatHtml : 'See H R now',
    },
  });

  expect(editor.querySelector('[data-note-math-source="$H_R$"]')).not.toBeNull();
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe('See $H_R$ now');
});

test('live typing lifts E* and E+ immediately and coalesces extended expressions across math atoms', () => {
  const editor = document.createElement('div');
  editor.contentEditable = 'true';
  document.body.append(editor);
  document.execCommand = (_command: string, _ui: boolean, value?: string) => {
    const sel = document.getSelection()!;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    if (_command === 'insertText') {
      const node = document.createTextNode(value ?? '');
      range.insertNode(node);
      sel.collapse(node, node.length);
      return true;
    }
    const tpl = document.createElement('template');
    tpl.innerHTML = value ?? '';
    const last = tpl.content.lastChild;
    range.insertNode(tpl.content);
    if (last) {
      const after = document.createRange();
      after.setStartAfter(last);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }
    return true;
  };

  // Typing E then * lifts * immediately without needing a trailing space.
  const eNode = document.createTextNode('E');
  editor.append(eNode);
  document.getSelection()!.collapse(eNode, 1);
  expect(completeNoteMath(editor, '*')).toBe(true);
  expect(editor.querySelector('[data-note-math-source="E*"] annotation')?.textContent).toBe('E^{*}');

  // Typing {0,1} then * coalesces the completed set atom with * into {0,1}*.
  editor.replaceChildren();
  const setNode = document.createTextNode('{0,1');
  editor.append(setNode);
  document.getSelection()!.collapse(setNode, 4);
  expect(completeNoteMath(editor, '}')).toBe(true);
  expect(completeNoteMath(editor, '*')).toBe(true);
  expect(editor.querySelector('[data-note-math-source="{0,1}*"] annotation')?.textContent).toBe('\\{0,1\\}^{*}');

  // Typing lonely A + space, then -> B + space coalesces into one A -> B formula.
  editor.replaceChildren();
  const aNode = document.createTextNode('A ');
  editor.append(aNode);
  document.getSelection()!.collapse(aNode, 2);
  expect(completeNoteMath(editor, '')).toBe(true);
  const tail = editor.lastChild as Text;
  tail.data = ' -> B ';
  document.getSelection()!.collapse(tail, tail.length);
  expect(completeNoteMath(editor, '')).toBe(true);
  expect(editor.querySelectorAll('[data-note-math-source]')).toHaveLength(1);
  expect(editor.querySelector('[data-note-math-source="A -> B"] annotation')?.textContent).toBe('A \\to B');

  editor.remove();
});

test('pasting a bullet item with subscripted KaTeX from ChatGPT HTML or Markdown keeps the list and formulas intact', () => {
  let saved = '';
  render(<Composer onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });
  const selection = editor.ownerDocument.getSelection()!;
  selection.collapse(editor, 0);

  const katexSpan = (tex: string, visible: string) =>
    `<span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">${tex}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="vlist-t"><span class="vlist">${visible}</span><span class="vlist-s">\u200b</span></span></span></span>`;
  const chatHtml = `<meta charset="utf-8"><ul>\n  <li>\n    <p>"Precedes and follows" (${katexSpan('aR_sb', 'aRsb')}): If ${katexSpan('a', 'a')}\n      must come before ${katexSpan('b', 'b')}, the list puts ${katexSpan('a', 'a')} earlier than ${katexSpan('b', 'b')} so no dependency is broken.</p>\n  </li>\n</ul>`;
  const brokenPlain = '- "Precedes and follows" (\na\nR\ns\nb\naR_sb\naR\ns\n\u200bb): If \na\na must come before \nb\nb';

  fireEvent.paste(editor, {
    clipboardData: {
      getData: (type: string) => type === 'text/html' ? chatHtml : brokenPlain,
    },
  });

  expect(editor.querySelectorAll('ul > li')).toHaveLength(1);
  expect([...editor.querySelectorAll('[data-note-math-source]')].map((el) => el.getAttribute('data-note-math-source'))).toEqual([
    '$aR_sb$', '$a$', '$b$', '$a$', '$b$',
  ]);
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe('-   "Precedes and follows" ($aR_sb$): If $a$ must come before $b$, the list puts $a$ earlier than $b$ so no dependency is broken.'.replace('-   ', '- '));
});

test('typing -(space) at the start of a line with existing text and math atoms converts that line into a bullet point', () => {
  let saved = '';
  const initial = '"Precedes and follows" ($aR_sb$): If $a$ must come before $b$.';
  render(<Composer initial={initial} onSave={(body) => { saved = body; }} />);
  const editor = screen.getByRole('textbox', { name: 'Your note' });

  // Simulate user placing "-" before existing text (even when a space already follows "-") and typing Space.
  const firstText = editor.firstChild as Text;
  firstText.data = '- ' + firstText.data;
  editor.ownerDocument.getSelection()!.collapse(firstText, 1);

  const spaceEvent = new InputEvent('beforeinput', {
    inputType: 'insertText',
    data: ' ',
    bubbles: true,
    cancelable: true,
  });
  let notCancelled = true;
  act(() => {
    notCancelled = editor.dispatchEvent(spaceEvent);
  });
  expect(notCancelled).toBe(false);

  const li = editor.querySelector('ul > li')!;
  expect(li).not.toBeNull();
  expect(editor.classList.contains('note-markdown')).toBe(true);
  expect((li.firstChild as Text).data.startsWith('"Precedes and follows"')).toBe(true);
  expect(li.querySelectorAll('[data-note-math-source]')).toHaveLength(3);
  expect(editor.ownerDocument.getSelection()?.anchorNode).toBe(li.firstChild);
  expect(editor.ownerDocument.getSelection()?.anchorOffset).toBe(0);

  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  expect(saved).toBe(`-   ${initial}`);
});

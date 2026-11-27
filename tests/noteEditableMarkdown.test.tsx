// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vitest';
import { makeEditableMarkdown, prepareNoteListPaste, readEditableMarkdown } from '../src/components/notes/noteEditableMarkdown';
import { prepareNoteMathFragment } from '../src/components/notes/noteEditableMath';

afterEach(() => { document.body.replaceChildren(); });

function open(source: string) {
  const editor = document.createElement('div');
  editor.contentEditable = 'true';
  editor.append(makeEditableMarkdown(document, source));
  document.body.append(editor);
  return editor;
}

test('Markdown opens as editable blocks with literal code and exact equation atoms', () => {
  const input = [
    '# Remainder classes',
    '',
    'Take **the set** A = {1,2,3}.',
    '',
    '- An item',
    '- [x] Check the result',
    '',
    '| Class | Size |',
    '| --- | --- |',
    '| First | 2/3 |',
    '',
    '~~~text',
    'Use 2^3 as source.',
    '~~~',
  ].join('\n');
  const editor = open(input);
  expect(editor.querySelector('h1')?.textContent).toBe('Remainder classes');
  expect(editor.querySelector('table')?.rows.length).toBe(2);
  expect(editor.querySelector('pre code')?.textContent).toBe('Use 2^3 as source.\n');
  expect([...editor.querySelectorAll('[data-note-math-source]')].map((atom) => atom.getAttribute('data-note-math-source'))).toEqual(['A = {1,2,3}', '2/3']);

  const { source, underlines } = readEditableMarkdown(editor);
  expect(source).toContain('# Remainder classes');
  expect(source).toContain('**the set** A = {1,2,3}');
  expect(source).toMatch(/\[x\]\s+Check the result/);
  expect(source).toContain('| First | 2/3 |');
  expect(source).toContain('Use 2^3 as source.');
  expect(source).not.toContain('mathnormal');
  expect(underlines).toEqual([]);
});

test('serialization preserves native underline ranges and converts native bold to Markdown', () => {
  const editor = open('# Title\n\nBefore');
  const line = editor.querySelector('p')!;
  const underline = document.createElement('u');
  underline.textContent = 'check carefully';
  const bold = document.createElement('span');
  bold.style.fontWeight = '700';
  bold.textContent = 'done';
  line.append(' ', underline, ' ', bold);
  const { source, underlines } = readEditableMarkdown(editor);
  expect(source).toBe('# Title\n\nBefore check carefully **done**');
  expect(underlines.map(({ start, end }) => source.slice(start, end))).toEqual(['check carefully']);
});

test('math pipes typed into a table cell survive serialization and do not split cells', () => {
  const editor = open('| Set | Size |\n| --- | --- |\n| A | result |');
  editor.querySelector('td:last-child')!.replaceChildren(prepareNoteMathFragment(document, '|A|').fragment);

  const reopened = open(readEditableMarkdown(editor).source);
  expect(reopened.querySelectorAll('td')).toHaveLength(2);
  expect(reopened.querySelector('td:last-child annotation')?.textContent).toBe(String.raw`\lvert A\rvert`);
});

test('the caret after inline code is excluded from the saved Markdown', () => {
  const editor = open('');
  editor.innerHTML = 'if <code>a→b</code><span data-note-inline-caret="1">\u200b , then</span>';
  expect(readEditableMarkdown(editor).source).toBe('if `a→b` , then');
});

test('pasted prose wraps inside one list item and explicitly pasted subitems stay structured', () => {
  const editor = open('- Note');
  const item = editor.querySelector('li')!;
  const clipboard = makeEditableMarkdown(document, 'First **bold** line\nSecond line\n\n- Nested child');
  item.append(' ', prepareNoteListPaste(clipboard, true));

  expect(item.querySelector('br')?.nextSibling?.textContent).toBe('Second line');
  expect(item.querySelector('strong')?.textContent).toBe('bold');
  expect(item.querySelector('ul > li')?.textContent).toBe('Nested child');

  const reopened = open(readEditableMarkdown(editor).source);
  expect(reopened.querySelectorAll(':scope > ul > li')).toHaveLength(1);
  expect(reopened.querySelectorAll('li > ul > li')).toHaveLength(1);
});

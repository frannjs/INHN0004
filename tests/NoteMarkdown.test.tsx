// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { NoteMarkdown } from '../src/components/notes/NoteMarkdown';
import { hasNoteMarkdown } from '../src/lib/noteMarkdownSyntax';

afterEach(cleanup);

test('renders Markdown and four LaTeX delimiters together, including math in a GFM table', () => {
  const source = [
    '# Compare cardinalities',
    '',
    String.raw`**Finite case.** Pick \(A=\{0,3,6\}\).`,
    '',
    '- First choice',
    '  - An indented choice',
    '- [x] Check the bounds',
    '',
    '> Show the witness.',
    '',
    '| Set | Size |',
    '| --- | --- |',
    String.raw`| $A$ | \(\left|A\right|=3\) |`,
    '',
    String.raw`\[\sum_{i=1}^n i=\frac{n(n+1)}2\]`,
    '',
    '$$n=3$$',
  ].join('\n');
  const { container } = render(<NoteMarkdown source={source} />);
  expect(container.querySelector('h1')?.textContent).toBe('Compare cardinalities');
  expect(container.querySelector('strong')?.textContent).toBe('Finite case.');
  expect(container.querySelector('ul ul li')?.textContent).toBe('An indented choice');
  expect(container.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked).toBe(true);
  expect(container.querySelector('blockquote')?.textContent?.trim()).toBe('Show the witness.');
  expect(container.querySelectorAll('.note-markdown-table td')).toHaveLength(2);
  expect(container.querySelectorAll('.note-math .katex')).toHaveLength(5);
  expect(container.querySelectorAll('.note-math-block .katex-display')).toHaveLength(2);
  expect(container.querySelector('p div')).toBeNull();
});

test('keeps Markdown code literal, including math-like syntax within indented code', () => {
  const source = [
    '# Examples',
    '',
    'Inline `$x$` then a real $y$.',
    '',
    '    \\(x+1\\)',
    '',
    '~~~',
    '$z$',
    '~~~',
  ].join('\n');
  const { container } = render(<NoteMarkdown source={source} />);
  expect(Array.from(container.querySelectorAll('code'), (node) => node.textContent)).toEqual(['$x$', '\\(x+1\\)\n', '$z$\n']);
  expect(container.querySelectorAll('.note-math .katex')).toHaveLength(1);
});

test('keeps editor marks adjacent to LaTeX while rendering Markdown emphasis', () => {
  const source = '## Example\n\nRead \\(x\\) and **check** it.';
  const start = source.indexOf(' and ');
  const { container } = render(<NoteMarkdown source={source} marks={[{ start, end: start + 5, underline: true, italic: true }]} />);
  expect(container.querySelector('u em')?.textContent).toBe(' and ');
  expect(container.querySelector('strong')?.textContent).toBe('check');
  expect(container.querySelector('.note-math .katex')).not.toBeNull();
});

test('uses the same automatic math formatting in Markdown prose and table cells', () => {
  const source = [
    '## Relations',
    '',
    '| Definition | Example |',
    '| --- | --- |',
    '| Set | A = {1,2,3} |',
    '| Fraction | 2/3 |',
    '',
    'Code stays literal: `2/3`.',
  ].join('\n');
  const { container } = render(<NoteMarkdown source={source} />);
  expect(container.querySelectorAll('td .katex')).toHaveLength(2);
  expect(container.querySelector('td .mfrac')).not.toBeNull();
  expect(container.querySelector('code')?.textContent).toBe('2/3');
});

test('renders trusted Markdown links and leaves pasted HTML and images inert', () => {
  const source = '# Links\n\n[Reader](https://example.com/) [Unsafe](javascript:bad) ![Picture](https://example.com/image.png) <b>literal</b>';
  const { container } = render(<NoteMarkdown source={source} />);
  expect(container.querySelectorAll('a')).toHaveLength(1);
  expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com/');
  expect(container.querySelector('a')?.getAttribute('rel')).toBe('noreferrer');
  expect(container.querySelector('b,img')).toBeNull();
  expect(container.textContent).toContain('<b>literal</b>');
  expect(container.textContent).toContain('Picture');
});

test('identifies Markdown for live previews and leaves plain and math-only notes intact', () => {
  for (const source of ['# Heading', '- list', '**bold** or *italic*', 'Inline `literal` text', '[Link](https://example.com/)', 'A | B\n--- | ---\n1 | 2']) {
    expect(hasNoteMarkdown(source), source).toBe(true);
  }
  expect(hasNoteMarkdown('A plain sentence with 10 - 5 and file_name.')).toBe(false);
  expect(hasNoteMarkdown('Reference [reader].\n\n[reader]: /')).toBe(true);
  expect(hasNoteMarkdown('A footnote.[^one]\n\n[^one]: Some context.')).toBe(true);
  expect(hasNoteMarkdown('https://example.com/')).toBe(true);
  expect(hasNoteMarkdown('www.example.com')).toBe(true);
  expect(hasNoteMarkdown('Heading\n-')).toBe(true);
  expect(hasNoteMarkdown(String.raw`Take \(A=\{0,1,2\}\).`)).toBe(false);
});

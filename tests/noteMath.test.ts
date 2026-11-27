import { expect, test } from 'vitest';
import { findNoteMath } from '../src/lib/noteMath';

test('locates the equations in pasted ChatGPT prose at their exact offsets', () => {
  const source = String.raw`Take \(A=\{0,1,2,3,4,5,6\}\). Let \(R\) mean “has the same remainder modulo \(3\).”

Pick \(a=3\). Dividing \(3\) by \(3\) leaves remainder \(0\).`;
  const tokens = findNoteMath(source);
  expect(tokens.map(({ math }) => math)).toEqual([
    String.raw`A=\{0,1,2,3,4,5,6\}`, 'R', '3', 'a=3', '3', '3', '0',
  ]);
  expect(tokens.map(({ start, end }) => source.slice(start, end))).toEqual(
    tokens.map(({ math }) => `\\(${math}\\)`),
  );
  expect(tokens.every(({ display }) => !display)).toBe(true);
});

test('supports inline and multiline display delimiters in the same note', () => {
  const source = String.raw`Use $\mathbb N$ and \(R^*\).
\[
\begin{aligned}
a&=3\\
b&=6
\end{aligned}
\]
Then $$\{0,3,6\}.$$`;
  expect(findNoteMath(source).map(({ math, display }) => [math, display])).toEqual([
    [String.raw`\mathbb N`, false],
    ['R^*', false],
    [String.raw`\begin{aligned}
a&=3\\
b&=6
\end{aligned}`, true],
    [String.raw`\{0,3,6\}.`, true],
  ]);
});

test('leaves amounts, escaped markers, and unfinished expressions as literal text', () => {
  const source = String.raw`From $5 to $10. A literal \$ and \\(x\\). Unfinished \(z. Use \(\frac12\) and $a>0$.
Offer: $24.99, or $30 USD. Under $50. Finish with $2 + 4$ and $$without a close.`;
  expect(findNoteMath(source).map(({ math }) => math)).toEqual([String.raw`\frac12`, 'a>0', '2 + 4']);
});

test('leaves Markdown code literal across matching inline runs and fenced blocks', () => {
  const source = [
    'Inline `\\(a=3\\)` and ``x ` $y$``. Use $z^2$.',
    '```latex',
    '\\[x^2\\]',
    '$$f(x)=x$$',
    '```',
    '~~~text',
    '\\(skip\\)',
    '~~~',
    'An unmatched ` does not hide \\(n=3\\).',
    '```',
    '$$inside an unfinished code fence$$',
  ].join('\n');
  expect(findNoteMath(source).map(({ math }) => math)).toEqual(['z^2', 'n=3']);
});

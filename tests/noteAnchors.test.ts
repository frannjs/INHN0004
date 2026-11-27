// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vitest';
import { anchorFromRange, indexReadingText, rangeFromAnchor } from '../src/lib/noteAnchors';
import { readingClickRange } from '../src/lib/readingSelection';

afterEach(() => { document.body.innerHTML = ''; });
function article(html: string) {
  const root = document.createElement('article');
  root.innerHTML = html;
  document.body.append(root);
  return root;
}
function select(root: HTMLElement, selector: string, from: number, to: number) {
  const text = root.querySelector(selector)!.firstChild!;
  const range = document.createRange();
  range.setStart(text, from); range.setEnd(text, to);
  return range;
}

test('indexes visible formulas once and ignores interactive controls and hidden copies', () => {
  const root = article('<p>Before <span class="katex"><span class="katex-mathml">hidden TeX duplicate</span><span class="katex-html" aria-hidden="true">R²</span></span> after.</p><button>Toggle</button><span class="sr-only">Hidden caption</span>');
  expect(indexReadingText(root).text).toBe('Before R² after.');
  const range = document.createRange(); range.selectNodeContents(root.querySelector('p')!);
  const anchor = anchorFromRange(root, range)!;
  expect(anchor.quote).toBe('Before R² after.');
  expect(anchorFromRange(root, rangeFromAnchor(root, anchor)!)?.quote).toBe(anchor.quote);
});

test('restores an anchor after earlier paragraphs change', () => {
  const root = article('<p>Introduction.</p><p id="passage">A relation is a set of ordered pairs.</p>');
  const anchor = anchorFromRange(root, select(root, '#passage', 2, 10))!;
  expect(anchor.quote).toBe('relation');
  root.insertAdjacentHTML('afterbegin', '<p>A newly added paragraph.</p>');
  const restored = rangeFromAnchor(root, anchor)!;
  expect(restored.toString()).toBe('relation');
  expect(restored.startContainer.parentElement?.id).toBe('passage');
});

test('normalizes whitespace across inline formatting', () => {
  const root = article('<p>  a   <em>binary\n relation</em>  is a set. </p>');
  const range = document.createRange(); range.selectNodeContents(root);
  const anchor = anchorFromRange(root, range)!;
  expect(anchor.quote).toBe('a binary relation is a set.');
  root.innerHTML = '<p>a <em>binary relation</em> is a set.</p>';
  expect(anchorFromRange(root, rangeFromAnchor(root, anchor)!)?.quote).toBe(anchor.quote);
});

test('uses surrounding context to distinguish repeated phrases', () => {
  const root = article('<p>First: <span>the relation</span> is symmetric.</p><p>Second: <span id="second">the relation</span> is transitive.</p>');
  const anchor = anchorFromRange(root, select(root, '#second', 0, 12))!;
  root.insertAdjacentHTML('afterbegin', '<p>Earlier text was added.</p>');
  expect(rangeFromAnchor(root, anchor)?.startContainer.parentElement?.id).toBe('second');
});

test('preserves repeated-symbol anchors at section boundaries when new subsections are appended or inserted', () => {
  const root = article(
    '<section id="s1"><p>Earlier occurrence of <span>R</span> in the opening paragraph.</p>' +
    '<p>At the end of this section we prove closure minimality for <span id="end-symbol">R</span>.</p></section>' +
    '<section id="s2"><h2>Next Section</h2><p>At the start of the next section <span id="start-symbol">R</span> appears again.</p></section>'
  );
  const endAnchor = anchorFromRange(root, select(root, '#end-symbol', 0, 1))!;
  const startAnchor = anchorFromRange(root, select(root, '#start-symbol', 0, 1))!;
  root.querySelector('#s1')!.insertAdjacentHTML('afterbegin', '<p>Extra introductory note before everything.</p>');
  root.querySelector('#s1')!.insertAdjacentHTML('beforeend', '<h3>Appended Exam Technique</h3><p>New worked example added without touching existing text.</p>');
  expect(rangeFromAnchor(root, endAnchor)?.startContainer.parentElement?.id).toBe('end-symbol');
  expect(rangeFromAnchor(root, startAnchor)?.startContainer.parentElement?.id).toBe('start-symbol');
});

test('a removed passage stays unanchored instead of highlighting unrelated text', () => {
  const root = article('<p id="passage">This is the original passage.</p>');
  const anchor = anchorFromRange(root, select(root, '#passage', 0, 11))!;
  root.innerHTML = '<p>A completely different paragraph.</p>';
  expect(rangeFromAnchor(root, anchor)).toBeNull();
});

test('a single mathematical symbol can be annotated, while button text cannot', () => {
  const root = article('<p id="math">A ∪ B</p><button id="button">Change</button>');
  expect(anchorFromRange(root, select(root, '#math', 2, 3))?.quote).toBe('∪');
  expect(anchorFromRange(root, select(root, '#button', 0, 6))).toBeNull();
});

test('Unicode context never splits a surrogate pair', () => {
  const root = article(`<p id="context">${'😀'.repeat(70)}target${'😀'.repeat(70)}</p>`);
  const anchor = anchorFromRange(root, select(root, '#context', 140, 146))!;
  expect(anchor.quote).toBe('target');
  expect(Array.from(anchor.prefix)).toHaveLength(64);
  expect(Array.from(anchor.suffix)).toHaveLength(64);
  expect(anchor.prefix).toBe('😀'.repeat(64));
  expect(rangeFromAnchor(root, anchor)?.toString()).toBe('target');
});

test('a double-click on any formula glyph selects the full visible formula', () => {
  const root = article('<p>Start with <span class="katex"><span class="katex-mathml">hidden copy</span><span class="katex-html"><i>a</i><i>→</i><i>b</i></span></span> and continue.</p>');
  for (const glyph of root.querySelectorAll('i')) {
    expect(readingClickRange(root, glyph, 2)?.toString()).toBe('a→b');
  }
  expect(readingClickRange(root, root.querySelector('p')!, 2)).toBeNull();
});

test('a triple-click selects the enclosing passage across formulas without including nearby blocks', () => {
  const root = article('<p>Previous.</p><p>Start with <span class="katex"><span class="katex-mathml">duplicate</span><span class="katex-html"><i>a</i><i>→</i><i>b</i></span></span> and continue.</p><button>Change</button>');
  const range = readingClickRange(root, root.querySelector('i')!, 3)!;
  expect(anchorFromRange(root, range)?.quote).toBe('Start with a→b and continue.');
  expect(readingClickRange(root, root.querySelector('button')!, 3)).toBeNull();
});

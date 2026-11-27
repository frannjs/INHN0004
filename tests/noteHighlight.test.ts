// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vitest';
import { measureNoteBands } from '../src/lib/noteHighlight';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function passage(html: string) {
  const article = document.createElement('article');
  article.innerHTML = html;
  document.body.append(article);
  vi.spyOn(article, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 190, 300));
  return article;
}

function measureText(rectangles: Record<string, DOMRect>) {
  vi.spyOn(Range.prototype, 'getClientRects').mockImplementation(function (this: Range) {
    const rect = rectangles[this.startContainer.textContent ?? ''];
    return (rect ? [rect] : []) as unknown as DOMRectList;
  });
}

test('prose, operators and subscripts share one band per rendered line', () => {
  const article = passage('<p>Start <span><span class="katex"><span class="katex-html"><span class="base"><i>a</i><i>≡</i><sub>m</sub><i>b</i></span></span><span class="katex-mathml">duplicate</span></span></span><br>Next line</p>');
  for (const element of article.querySelectorAll('span')) element.style.display = 'inline';
  const base = article.querySelector('.base')!;
  vi.spyOn(base, 'getBoundingClientRect').mockReturnValue(new DOMRect(52, 18, 72, 22));
  measureText({
    'Start ': new DOMRect(18, 21, 32, 16),
    a: new DOMRect(54, 21, 10, 16),
    '≡': new DOMRect(73, 21, 16, 16),
    m: new DOMRect(93, 31, 8, 9),
    b: new DOMRect(108, 21, 12, 16),
    duplicate: new DOMRect(150, 21, 40, 16),
    'Next line': new DOMRect(18, 57, 68, 16),
  });
  const paragraph = article.querySelector('p')!;
  const range = document.createRange();
  range.setStart(paragraph.firstChild!, 0);
  range.setEnd(paragraph.lastChild!, 9);
  expect(measureNoteBands(article, range)).toEqual([
    { left: 16, top: 17, width: 110, height: 24 },
    { left: 16, top: 56, width: 72, height: 18 },
  ]);

  range.selectNodeContents(base.querySelector('sub')!);
  expect(measureNoteBands(article, range)).toEqual([{ left: 91, top: 17, width: 12, height: 24 }]);
});

test('a selected line is clipped at its scrolling container', () => {
  const article = passage('<div style="overflow-x:auto">wide formula</div>');
  const scroller = article.firstElementChild as HTMLElement;
  vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(new DOMRect(30, 12, 80, 35));
  vi.spyOn(scroller, 'clientWidth', 'get').mockReturnValue(80);
  measureText({ 'wide formula': new DOMRect(0, 20, 150, 16) });
  const range = document.createRange();
  range.selectNodeContents(scroller);
  expect(measureNoteBands(article, range)).toEqual([{ left: 30, top: 19, width: 80, height: 18 }]);
});

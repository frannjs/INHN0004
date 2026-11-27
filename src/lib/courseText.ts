export type TextBlock =
  | { kind: 'paragraph' | 'quote' | 'math' | 'code'; text: string }
  | { kind: 'heading'; text: string; level: 2 | 3 | 4 }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'practice'; title: string; prompt: TextBlock[]; answer: TextBlock[] }
  | { kind: 'manim'; file: string; title: string; caption: TextBlock[] }
  | { kind: 'lab'; name: string };

const bullet = /^(?:([-*+])|(\d+)[.)])\s+(.+)$/;
const heading = /^(#{2,4})\s+(.+)$/;

export function splitCourseInline(text: string) {
  return text.split(/(\x60[^\x60]+\x60|(?<!\\)\$(?:\\.|[^$\\])+\$|\*\*(?:\$(?:\\.|[^$\\])+\$|[^*])+\*\*|(?<!\*)\*[^*]+\*(?!\*))/g);
}

export function splitTableRow(line: string) {
  const cells: string[] = [];
  let start = line.startsWith('|') ? 1 : 0;
  let math = false;
  let code = false;
  for (let index = start; index < line.length; index++) {
    if (line[index] === '\\') { index++; continue; }
    if (line[index] === '`' && !math) code = !code;
    if (line[index] === '$' && !code) math = !math;
    if (line[index] !== '|' || math || code) continue;
    cells.push(line.slice(start, index).trim().replace(/\\\|/g, '|'));
    start = index + 1;
  }
  if (start < line.length) cells.push(line.slice(start).trim().replace(/\\\|/g, '|'));
  return cells;
}

export function parseCourseText(source: string): TextBlock[] {
  const lines = source.trim().split(/\r?\n/);
  let cursor = 0;
  function takeUntil(stop: (line: string) => boolean) {
    const start = cursor;
    while (cursor < lines.length && !stop(lines[cursor].trim())) cursor++;
    return lines.slice(start, cursor).join('\n').trim();
  }
  const blocks: TextBlock[] = [];
  while (cursor < lines.length) {
    const line = lines[cursor++].trim();
    if (!line) continue;
    if (line === '$$' || line.startsWith('```')) {
      const math = line === '$$';
      const content = takeUntil((candidate) => candidate === (math ? '$$' : '```'));
      if (cursor === lines.length) throw new Error('Unclosed course text block');
      cursor++;
      blocks.push({ kind: math ? 'math' : 'code', text: content });
      continue;
    }
    if (line.startsWith('::: ')) {
      const [directive, ...args] = line.slice(4).split(' ');
      const argument = args.join(' ').trim();
      const rawContent = takeUntil((candidate) => candidate === ':::');
      if (cursor === lines.length) throw new Error(`Unclosed ${directive} block`);
      cursor++;
      if (directive === 'practice') {
        const [prompt, answer] = rawContent.split(/^\s*:::\s+answer\s*$/m);
        if (!answer?.trim()) throw new Error(`Missing answer for ${argument}`);
        blocks.push({ kind: 'practice', title: argument, prompt: parseCourseText(prompt), answer: parseCourseText(answer) });
      } else if (directive === 'manim') {
        const [file, title] = argument.split('|').map((item) => item.trim());
        if (!/^[\w-]+\.mp4$/.test(file) || !title) throw new Error(`Invalid Manim figure ${argument}`);
        blocks.push({ kind: 'manim', file, title, caption: parseCourseText(rawContent) });
      } else if (directive === 'lab') {
        blocks.push({ kind: 'lab', name: argument });
      } else {
        throw new Error(`Unexpected course directive ${directive}`);
      }
      continue;
    }
    const title = line.match(heading);
    if (title) {
      blocks.push({ kind: 'heading', level: title[1].length as 2 | 3 | 4, text: title[2] });
      continue;
    }
    if (line.startsWith('|') && /^\|?\s*:?-{2,}/.test(lines[cursor]?.trim() ?? '')) {
      const rows = [splitTableRow(line)];
      cursor++;
      while (lines[cursor]?.trim().startsWith('|')) rows.push(splitTableRow(lines[cursor++].trim()));
      blocks.push({ kind: 'table', rows });
      continue;
    }
    const item = line.match(bullet);
    if (item) {
      const items = [item[3]];
      const ordered = Boolean(item[2]);
      while (cursor < lines.length) {
        const next = lines[cursor].trim().match(bullet);
        if (!next || Boolean(next[2]) !== ordered) break;
        items.push(next[3]);
        cursor++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }
    if (line.startsWith('> ')) {
      const quote = [line.slice(2)];
      while (lines[cursor]?.trimStart().startsWith('> ')) quote.push(lines[cursor++].trimStart().slice(2));
      blocks.push({ kind: 'quote', text: quote.join(' ') });
      continue;
    }
    const continuation = takeUntil((next) => !next || next === '$$' || next.startsWith(':::') ||
      next.startsWith('```') || next.startsWith('|') || next.startsWith('> ') || heading.test(next) || bullet.test(next));
    blocks.push({ kind: 'paragraph', text: [line, continuation].filter(Boolean).join(' ').replace(/\s*\n\s*/g, ' ') });
  }
  return blocks;
}

export function chapterSections(source: string) {
  return Array.from(source.matchAll(/^## (\d+)\.(\d+)\s+([^\n\r]+)$/gm), ([, chapter, section, title]) => ({
    id: `sec-${chapter}-${section}`,
    num: `${chapter}.${section}`,
    title: title.trim(),
  }));
}

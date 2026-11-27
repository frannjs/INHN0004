import { chapterSections, parseCourseText, type TextBlock } from '../lib/courseText';

const chapters = import.meta.glob('../chapters/content/ch*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const sheets = import.meta.glob('../chapters/practice/sheet*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getChapterOutline(chapterId: string) {
  const source = chapters[`../chapters/content/${chapterId}.md`];
  return source ? chapterSections(source) : undefined;
}

export function getChapterContent(chapterId: string) {
  const source = chapters[`../chapters/content/${chapterId}.md`];
  if (source === undefined) return null;
  const outline = chapterSections(source);
  const introduction: TextBlock[] = [];
  const sections: { meta: (typeof outline)[number]; blocks: TextBlock[] }[] = [];
  let target = introduction;
  let sectionIndex = 0;
  for (const block of parseCourseText(source)) {
    if (block.kind === 'heading' && block.level === 2) {
      const meta = outline[sectionIndex++];
      if (!meta || block.text !== `${meta.num} ${meta.title}`) throw new Error(`Unnumbered section in ${chapterId}`);
      target = [];
      sections.push({ meta, blocks: target });
    } else target.push(block);
  }
  return { introduction, sections };
}

export function getSheetSolutions(sheet: number) {
  const name = `../chapters/practice/sheet${String(sheet).padStart(2, '0')}`;
  return [sheets[`${name}-graphs.md`], sheets[`${name}.md`]].filter(Boolean).flatMap(parseCourseText);
}

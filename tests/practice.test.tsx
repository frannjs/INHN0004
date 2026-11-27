import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { PRACTICE_CHECKPOINTS as checkpoints } from '../src/data/practiceCheckpoints';
import { PRACTICE_WEEK_REVIEW as review } from '../src/data/practiceProvenance';
import { getChapterContent, getSheetSolutions } from '../src/data/courseContent';
import { CHAPTERS } from '../src/data/syllabus';
import { Chapter4Relations } from '../src/chapters/Chapter4Relations';
import { PublishedChapter } from '../src/chapters/PublishedChapter';
import { CourseOverviewPage } from '../src/chapters/OverviewAndReference';
import { EXAM_FILES, EXAM_ZIP } from '../src/data/pastExams';

test('all fourteen weeks and sheets occur once, in order, with original source files and discussion dates', () => {
  expect(checkpoints.map((p) => p.week)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  expect(checkpoints.map((p) => p.sheet)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  for (const year of [2025, 2026]) {
    const dates = review.filter((r) => r.sourceYear === year).map((r) => r.discussionWeek);
    expect(dates).toEqual([...dates].sort());
  }
  expect(new Set(checkpoints.map((p) => `${p.chapterId}/${p.afterSection ?? 'end'}`)).size).toBe(14);
  for (const p of checkpoints) {
    expect(CHAPTERS.some((chapter) => chapter.id === p.chapterId)).toBe(true);
    const edition = p.sheet <= 6 ? 2026 : 2025;
    expect(p.sourceYear).toBe(edition);
    const source = edition === 2026 ? '2026_content_newest' : '2025_content';
    if (existsSync(`data/${source}`)) {
      expect(existsSync(`data/${source}/exercise sheets/ds${String(edition).slice(-2)}w-hn-${String(p.sheet).padStart(2, '0')}.pdf`)).toBe(true);
    }
    expect(review.find((r) => r.sheet === p.sheet)?.sourceYear).toBe(edition);
    expect(review.find((r) => r.sheet === p.sheet)?.homework.length).toBeGreaterThan(0);
    if (p.afterSection) expect(CHAPTERS.find((chapter) => chapter.id === p.chapterId)?.sections?.some((s) => s.id === p.afterSection)).toBe(true);
  }
});

test('the map schedules homework weeks without waiting for optional later material', () => {
  expect(checkpoints.find((p) => p.sheet === 4)).toMatchObject({ chapterId: 'ch04', afterSection: 'sec-4-5' });
  expect(checkpoints.find((p) => p.sheet === 13)).toMatchObject({ chapterId: 'ch14' });
  expect(checkpoints.find((p) => p.sheet === 6)).toMatchObject({ chapterId: 'ch07', afterSection: 'sec-7-3' });
  for (const sheet of [6, 9, 10, 12, 14]) expect(checkpoints.find((p) => p.sheet === sheet)?.afterSection).toBeTruthy();
  const html = renderToStaticMarkup(<CourseOverviewPage onSelectChapter={() => {}} />);
  expect((html.match(/class="sheet-checkpoint /g) ?? []).length).toBe(14);
  expect(html).not.toContain('after all the chapters');
});

test('the live chapter places Sheet 3 between 4.4 and 4.5, and Sheet 4 before the optional MU work', () => {
  const html = renderToStaticMarkup(<Chapter4Relations />);
  const sheet3 = html.indexOf('Do Sheet 3');
  const sheet4 = html.indexOf('Do Sheet 4');
  expect(sheet3).toBeGreaterThan(html.indexOf('id="sec-4-4"'));
  expect(sheet3).toBeLessThan(html.indexOf('id="sec-4-5"'));
  expect(sheet4).toBeGreaterThan(html.indexOf('id="sec-4-5"'));
  expect(sheet4).toBeLessThan(html.indexOf('id="sec-4-6"'));
});


test('published chapters render their reading sections and locate each weekly checkpoint', () => {
  expect(CHAPTERS).toHaveLength(15);
  for (const chapter of CHAPTERS.filter((chapter) => chapter.id !== 'ch04')) {
    const content = getChapterContent(chapter.id);
    expect(content?.sections.length).toBeGreaterThanOrEqual(3);
    const figures = content!.sections.flatMap((section) => section.blocks).filter((block) => block.kind === 'manim');
    expect(figures.length, chapter.number).toBeGreaterThan(0);
    for (const figure of figures) {
      expect(existsSync(`public/animations/${figure.file}`), figure.title).toBe(true);
      expect(existsSync(`public/animations/${figure.file.replace(/\.mp4$/, '.webp')}`), figure.title).toBe(true);
    }
    const html = renderToStaticMarkup(<PublishedChapter chapter={chapter} />);
    expect(html).not.toContain('katex-error');
    for (const section of chapter.sections) expect(html).toContain(`id="${section.id}"`);
    const expected = checkpoints.filter((p) => p.chapterId === chapter.id);
    expect((html.match(/class="sheet-checkpoint /g) ?? []).length).toBe(expected.length);
    for (const checkpoint of expected) {
      const at = html.indexOf(`Do Sheet ${checkpoint.sheet}<`);
      expect(at).toBeGreaterThan(0);
      if (checkpoint.afterSection) {
        const start = html.indexOf(`id="${checkpoint.afterSection}"`);
        expect(at).toBeGreaterThan(start);
        const next = html.indexOf('<section ', start + 1);
        if (next !== -1) expect(at).toBeLessThan(next);
      }
    }
  }
});

test('the relations animations ship publicly while past-exam PDFs stay out of public/', () => {
  for (const name of ['relational_product', 'closure_wave']) {
    expect(existsSync(`public/animations/${name}.mp4`)).toBe(true);
    expect(existsSync(`public/animations/${name}.webp`)).toBe(true);
  }
  expect(existsSync('public/past_papers')).toBe(false);
  if (existsSync('data/past_papers/storage')) {
    for (const { file } of [...EXAM_FILES, EXAM_ZIP]) {
      expect(existsSync(`data/past_papers/storage/${file}`), file).toBe(true);
    }
  }
});

test('every weekly checkpoint opens self-contained practice with a worked answer', () => {
  for (const checkpoint of checkpoints) {
    const problems = getSheetSolutions(checkpoint.sheet).filter((block) => block.kind === 'practice');
    expect(problems.length, `Sheet ${checkpoint.sheet}`).toBeGreaterThan(0);
    for (const problem of problems) {
      expect(problem.prompt.length, problem.title).toBeGreaterThan(0);
      expect(problem.answer.length, problem.title).toBeGreaterThan(0);
    }
  }
});

test('Chapter 12 mounts the interactive tabular EEA and CRT explorer', () => {
  const ch12 = CHAPTERS.find((chapter) => chapter.id === 'ch12')!;
  const html = renderToStaticMarkup(<PublishedChapter chapter={ch12} />);
  expect(html).toContain('Interactive Tabular EEA &amp; Linear Congruence Explorer');
  expect(html).toContain('CRT');
});

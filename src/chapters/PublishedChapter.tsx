import React, { useMemo } from 'react';
import type { ChapterMeta } from '../data/syllabus';
import { getChapterContent } from '../data/courseContent';
import { CourseInline, CourseText } from '../components/chapter/CourseText';
import { PracticeCheckpoint } from '../components/PracticeCheckpoint';

export function PublishedChapter({ chapter }: { chapter: ChapterMeta }) {
  const content = useMemo(() => getChapterContent(chapter.id), [chapter.id]);
  if (!content) throw new Error(`Missing content for ${chapter.id}`);
  return (
    <article className="chapter-article course-chapter">
      <div className="chapter-running-head">
        <span>Part {chapter.part}</span>
        <span>{chapter.number}</span>
      </div>
      <div className="chapter-number">{chapter.number}</div>
      <h1 className="chapter-title">{chapter.title}</h1>
      <div className="course-introduction"><CourseText blocks={content.introduction} /></div>
      {content.sections.map(({ meta, blocks }) => (
        <section className="section-block" key={meta.id} id={meta.id}>
          <h2 className="section-heading"><span className="section-num">{meta.num}</span><span><CourseInline text={meta.title} /></span></h2>
          <CourseText blocks={blocks} />
          <PracticeCheckpoint chapterId={chapter.id} sectionId={meta.id} showSolutions />
        </section>
      ))}
      <PracticeCheckpoint chapterId={chapter.id} showSolutions />
    </article>
  );
}

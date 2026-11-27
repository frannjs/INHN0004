import React, { useMemo, useState } from 'react';
import { getSheetSolutions } from '../data/courseContent';
import { PRACTICE_CHECKPOINTS } from '../data/practiceCheckpoints';
import type { ChapterMeta } from '../data/syllabus';
import { CourseText } from './chapter/CourseText';

function WeeklyPractice({ sheet, week }: { sheet: number; week: number }) {
  const [open, setOpen] = useState(false);
  const examples = useMemo(() => getSheetSolutions(sheet), [sheet]);
  return (
    <div className="sheet-checkpoint weekly-practice">
      <div className="weekly-practice-heading">
        <span>Week {week} · Do Sheet {sheet}</span>
        {examples.length > 0 && <button type="button" className="ctrl-btn" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {open ? 'Close practice' : 'Open practice'}
        </button>}
      </div>
      {open && <CourseText blocks={examples} />}
    </div>
  );
}

export const PracticeCheckpoint: React.FC<{
  chapterId: string;
  sectionId?: string;
  compact?: boolean;
  showSolutions?: boolean;
}> = ({ chapterId, sectionId, compact = false, showSolutions = false }) => (
  <>
    {PRACTICE_CHECKPOINTS.filter((checkpoint) =>
      checkpoint.chapterId === chapterId && (sectionId ? checkpoint.afterSection === sectionId : !checkpoint.afterSection)
    ).map((checkpoint) => showSolutions ? (
      <WeeklyPractice key={checkpoint.sheet} sheet={checkpoint.sheet} week={checkpoint.week} />
    ) : (
      <div className={`sheet-checkpoint ${compact ? 'toc-sheet-checkpoint' : ''}`} key={checkpoint.sheet}>
        <span>Week {checkpoint.week} · Do Sheet {checkpoint.sheet}</span>
      </div>
    ))}
  </>
);

export const ChapterReadingPoints: React.FC<{
  chapter: ChapterMeta;
  compact?: boolean;
  showOutline?: boolean;
  onSelect: (chapterId: string, sectionId?: string) => void;
}> = ({ chapter, compact = false, showOutline = false, onSelect }) => (
  <>
    {chapter.sections.filter((section) => showOutline ||
      PRACTICE_CHECKPOINTS.some((checkpoint) => checkpoint.afterSection === section.id)).map((section) => (
      <div className={compact ? 'chapter-reading-unit compact' : 'chapter-reading-unit'} key={section.id}>
        <button type="button" className="chapter-reading-point" onClick={() => onSelect(chapter.id, section.id)}>
          {showOutline ? '' : 'Read through '}{section.num} · {section.title}
        </button>
        <PracticeCheckpoint chapterId={chapter.id} sectionId={section.id} compact={compact} />
      </div>
    ))}
    <PracticeCheckpoint chapterId={chapter.id} compact={compact} />
  </>
);

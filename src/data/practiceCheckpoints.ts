/** Weekly reading points: current 2026 sheets, then 2025 where newer sheets are unavailable.
 * Optional, unassigned, and preview exercises do not delay the sheet.
 * The exercise-by-exercise review and official discussion dates are internal in practiceProvenance.ts.
 */
interface PracticeCheckpoint {
  sheet: number;
  week: number;
  chapterId: string;
  afterSection?: string;
  sourceYear: 2025 | 2026;
}

export const PRACTICE_CHECKPOINTS: PracticeCheckpoint[] = [
  { sheet: 1, week: 1, chapterId: 'ch01', sourceYear: 2026 },
  { sheet: 2, week: 2, chapterId: 'ch02', sourceYear: 2026 },
  { sheet: 3, week: 3, chapterId: 'ch04', afterSection: 'sec-4-4', sourceYear: 2026 },
  { sheet: 4, week: 4, chapterId: 'ch04', afterSection: 'sec-4-5', sourceYear: 2026 },
  { sheet: 5, week: 5, chapterId: 'ch06', sourceYear: 2026 },
  { sheet: 6, week: 6, chapterId: 'ch07', afterSection: 'sec-7-3', sourceYear: 2026 },
  { sheet: 7, week: 7, chapterId: 'ch09', sourceYear: 2025 },
  { sheet: 8, week: 8, chapterId: 'ch10', sourceYear: 2025 },
  { sheet: 9, week: 9, chapterId: 'ch12', afterSection: 'sec-12-1', sourceYear: 2025 },
  { sheet: 10, week: 10, chapterId: 'ch13', afterSection: 'sec-13-1', sourceYear: 2025 },
  { sheet: 11, week: 11, chapterId: 'ch13', afterSection: 'sec-13-3', sourceYear: 2025 },
  { sheet: 12, week: 12, chapterId: 'ch14', afterSection: 'sec-14-2', sourceYear: 2025 },
  { sheet: 13, week: 13, chapterId: 'ch14', afterSection: 'sec-14-3', sourceYear: 2025 },
  { sheet: 14, week: 14, chapterId: 'ch15', afterSection: 'sec-15-2', sourceYear: 2025 },
];

// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const reviews = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), urls: vi.fn() }));
vi.mock('../src/lib/examReviews', () => ({
  loadExamReviews: reviews.load,
  setExamReviewed: reviews.save,
}));
vi.mock('../src/lib/examAccess', () => ({
  loadExamDownloadUrls: reviews.urls,
}));

import { EXAM_FILES, EXAM_ZIP } from '../src/data/pastExams';
import { ExamPracticePage } from '../src/chapters/OverviewAndReference';

const examId = 'ws2021-22-mock';
const checkbox = () => screen.getByRole<HTMLInputElement>('checkbox', { name: /Reviewed.*WS 2021\/22.*Mock exam/ });
const defaultSignedUrls = () => new Map(
  [EXAM_ZIP.file, ...EXAM_FILES.map((exam) => exam.file)]
    .map((file) => [file, `https://signed.example.com/${file}`] as const),
);

beforeEach(() => {
  vi.resetAllMocks();
  reviews.load.mockResolvedValue([]);
  reviews.save.mockResolvedValue(undefined);
  reviews.urls.mockResolvedValue(defaultSignedUrls());
});
afterEach(cleanup);

test('each paper has a checkbox and the saved review can be cleared', async () => {
  reviews.load.mockResolvedValue([examId]);
  render(<ExamPracticePage userId="reader" />);
  expect(screen.getAllByRole('checkbox')).toHaveLength(14);
  await waitFor(() => expect(checkbox().checked).toBe(true));
  fireEvent.click(checkbox());
  await waitFor(() => expect(checkbox().checked).toBe(false));
  expect(reviews.save).toHaveBeenCalledWith('reader', examId, false);
});

test('a failed save preserves the checkbox value and the reader can try again', async () => {
  reviews.save.mockRejectedValueOnce(new Error('offline'));
  render(<ExamPracticePage userId="reader" />);
  await waitFor(() => expect(checkbox().disabled).toBe(false));
  fireEvent.click(checkbox());
  expect(await screen.findByText('Could not save review status. Try again.')).toBeTruthy();
  expect(checkbox().checked).toBe(false);
  fireEvent.click(checkbox());
  await waitFor(() => expect(checkbox().checked).toBe(true));
  expect(reviews.save).toHaveBeenLastCalledWith('reader', examId, true);
});

test('the checkmark appears as soon as the reader clicks it', async () => {
  let finishSave!: () => void;
  reviews.save.mockReturnValue(new Promise<void>((resolve) => { finishSave = resolve; }));
  render(<ExamPracticePage userId="reader" />);
  await waitFor(() => expect(checkbox().disabled).toBe(false));
  fireEvent.click(checkbox());
  expect(checkbox().checked).toBe(true);
  expect(checkbox().disabled).toBe(true);
  finishSave();
  await waitFor(() => expect(checkbox().disabled).toBe(false));
});

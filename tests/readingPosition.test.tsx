// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const progress = vi.hoisted(() => ({
  load: vi.fn(),
  record: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('../src/lib/readingPosition', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/lib/readingPosition')>(),
  loadReadingPosition: progress.load,
  createReadingPositionWriter: () => ({ record: progress.record, flush: progress.flush }),
}));
vi.mock('../src/components/notes/ReaderNotes', () => ({ ReaderNotes: () => null }));
vi.mock('../src/lib/githubStars', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/lib/githubStars')>(),
  fetchGitHubStarCount: () => Promise.resolve(0),
}));
vi.mock('../src/chapters/PublishedChapter', () => ({
  PublishedChapter: ({ chapter }: { chapter: { id: string; sections: { id: string }[] } }) => (
    <article><h1>{chapter.id}</h1>{chapter.sections.map(({ id }) => <section key={id} id={id} />)}</article>
  ),
}));

import { App } from '../src/App';

const position = { page_key: 'ch07', section_id: 'sec-7-2', section_progress: 2500 };

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  vi.resetAllMocks();
  progress.load.mockResolvedValue(position);
  progress.flush.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('the signed-in Preface offers a link back to the saved chapter and section progress', async () => {
  window.history.replaceState({ readerPosition: { userId: 'reader', position } }, '', '/');
  const { prototype } = HTMLElement;
  vi.spyOn(prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const index = Number(this.id.split('-').at(-1));
    return new DOMRect(0, index * 800, 100, 100);
  });
  const scroll = vi.spyOn(window, 'scrollTo');
  render(<App userId="reader" />);
  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  fireEvent.click(await screen.findByRole('link', { name: 'Resume reading' }));
  expect(await screen.findByRole('heading', { name: 'ch07' })).toBeTruthy();
  expect(progress.load).toHaveBeenCalledWith('reader', expect.any(AbortSignal));
  const lastScroll = scroll.mock.lastCall?.[0] as ScrollToOptions | undefined;
  expect(lastScroll?.behavior).toBe('instant');
  expect(lastScroll?.top).toBeCloseTo(1800, 0);
  expect(progress.record).not.toHaveBeenCalled();
});

test('an explicit chapter link takes precedence over the stored chapter', async () => {
  window.history.replaceState(null, '', '/?page=ch09#sec-9-2');
  const scroll = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
  render(<App userId="reader" />);
  expect(await screen.findByRole('heading', { name: 'ch09' })).toBeTruthy();
  expect(scroll.mock.contexts).toContain(document.getElementById('sec-9-2'));
  expect(progress.load).not.toHaveBeenCalled();
});

test('a new account in the same tab only offers its own reading position', async () => {
  window.history.replaceState({
    readerPosition: {
      userId: 'previous-reader',
      position: { page_key: 'ch09', section_id: null, section_progress: 0 },
    },
  }, '', '/?page=ch09');
  render(<App userId="reader" />);
  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  fireEvent.click(await screen.findByRole('link', { name: 'Resume reading' }));
  expect(await screen.findByRole('heading', { name: 'ch07' })).toBeTruthy();
  expect(window.location.search).toBe('?page=ch07');
  expect(progress.load).toHaveBeenCalledWith('reader', expect.any(AbortSignal));
  expect(progress.record).not.toHaveBeenCalled();
});

test('a guest opens the Preface by default without notes or saved-position loading, and can sign in', () => {
  const signIn = vi.fn().mockResolvedValue(undefined);
  render(<App onSignIn={signIn} />);
  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Notes' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  expect(progress.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Symbols' }));
  expect(screen.getByRole('heading', { name: 'Symbol Dictionary' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(signIn).toHaveBeenCalledOnce();
});

test('leaving the chapter records its place and reference pages leave it alone', async () => {
  window.history.replaceState(null, '', '/?page=ch07');
  let scroll = 0;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scroll);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const index = Number(this.id.split('-').at(-1));
    return new DOMRect(0, index * 800 - scroll, 100, 100);
  });
  render(<App userId="reader" />);
  scroll = 1800;
  fireEvent.click(screen.getByRole('button', { name: 'Symbols' }));
  expect(progress.record).toHaveBeenLastCalledWith(position);
  expect(progress.record).toHaveBeenCalledTimes(2);
  fireEvent(window, new Event('pagehide'));
  await waitFor(() => expect(progress.flush).toHaveBeenCalledOnce());
  expect(progress.record).toHaveBeenCalledTimes(2);
});

test('the next-chapter link opens the next chapter and saves that visit', async () => {
  window.history.replaceState(null, '', '/?page=ch14');
  render(<App userId="reader" />);
  fireEvent.click(screen.getByRole('link', { name: /^Next chapter/ }));
  expect(await screen.findByRole('heading', { name: 'ch15' })).toBeTruthy();
  expect(window.location.search).toBe('?page=ch15');
  expect(document.activeElement).toBe(screen.getByRole('main'));
  expect(screen.queryByRole('link', { name: /^Next chapter/ })).toBeNull();
  expect(progress.record.mock.lastCall?.[0].page_key).toBe('ch15');
});

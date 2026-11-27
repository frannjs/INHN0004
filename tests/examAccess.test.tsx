// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { EXAM_DOWNLOAD_ENDPOINT, EXAM_FILES, EXAM_ZIP } from '../src/data/pastExams';
import type { ExamDashboardUser, UserAccessRole } from '../src/lib/examAccess';

const access = vi.hoisted(() => ({
  role: vi.fn(),
  urls: vi.fn(),
  listUsers: vi.fn(),
  setAccess: vi.fn(),
  loadReviews: vi.fn(),
  loadPosition: vi.fn(),
  stars: vi.fn(),
}));

vi.mock('../src/lib/examAccess', () => ({
  USER_ACCESS_ROLES: ['base', 'privileged', 'admin'],
  fetchUserAccessRole: access.role,
  loadExamDownloadUrls: access.urls,
  listExamDashboardUsers: access.listUsers,
  setExamUserAccess: access.setAccess,
}));
vi.mock('../src/lib/githubStars', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/lib/githubStars')>(),
  fetchGitHubStarCount: access.stars,
}));
vi.mock('../src/lib/examReviews', () => ({
  loadExamReviews: access.loadReviews,
  setExamReviewed: vi.fn(),
}));
vi.mock('../src/lib/readingPosition', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/lib/readingPosition')>(),
  loadReadingPosition: access.loadPosition,
  createReadingPositionWriter: () => ({ record: vi.fn(), flush: vi.fn().mockResolvedValue(undefined) }),
}));
vi.mock('../src/components/notes/ReaderNotes', () => ({ ReaderNotes: () => null }));
vi.mock('../src/chapters/PublishedChapter', () => ({
  PublishedChapter: ({ chapter }: { chapter: { id: string } }) => (
    <article><h1>{chapter.id}</h1></article>
  ),
}));

import { App } from '../src/App';

const signedUrls = () => new Map(
  [EXAM_ZIP.file, ...EXAM_FILES.map((exam) => exam.file)]
    .map((file) => [file, `${EXAM_DOWNLOAD_ENDPOINT}?file=${file}&token=abc`] as const),
);

const sampleUsers = (): ExamDashboardUser[] => [
  { email: 'owner@example.test', role: 'admin' },
  { email: 'friend@tum.de', role: 'privileged' },
  { email: 'student@tum.de', role: 'base' },
];

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/?page=ch01');
  vi.resetAllMocks();
  access.role.mockResolvedValue('base');
  access.urls.mockResolvedValue(signedUrls());
  access.listUsers.mockResolvedValue(sampleUsers());
  access.setAccess.mockResolvedValue(undefined);
  access.loadReviews.mockResolvedValue([]);
  access.loadPosition.mockResolvedValue(null);
  access.stars.mockResolvedValue(42);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('base users cannot see Past Exams, ?page=exams, or /dashboard', async () => {
  window.history.replaceState(null, '', '/?page=exams');
  const view = render(<App userId="base-reader" userEmail="student@tum.de" />);

  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  await waitFor(() => expect(window.location.search).toBe('?page=overview'));
  const githubLink = await screen.findByRole<HTMLAnchorElement>('link', { name: 'Star on GitHub (42 stars)' });
  expect(githubLink.getAttribute('href')).toBe('https://github.com/frannjs/INHN0004');
  expect(githubLink.getAttribute('target')).toBe('_blank');
  expect(githubLink.textContent).toContain('42');
  expect(screen.queryByRole('button', { name: /Past Exams/i })).toBeNull();
  expect(screen.queryByText(/Access Dashboard/i)).toBeNull();
  expect(access.urls).not.toHaveBeenCalled();
  view.unmount();

  window.history.replaceState(null, '', '/dashboard');
  render(<App userId="base-reader" userEmail="student@tum.de" />);
  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  expect(window.location.search).toBe('?page=overview');
});

test('guests can read Chapter 1 while private deep links wait for sign-in', async () => {
  for (const path of ['/?page=exams', '/dashboard']) {
    window.history.replaceState(null, '', path);
    const view = render(<App onSignIn={vi.fn().mockResolvedValue(undefined)} />);
    expect(screen.getByText('Preface & Course Map')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    const githubLink = await screen.findByRole<HTMLAnchorElement>('link', { name: 'Star on GitHub (42 stars)' });
    expect(githubLink.getAttribute('href')).toBe('https://github.com/frannjs/INHN0004');
    expect(screen.queryByRole('heading', { name: 'Past Exams' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Access Dashboard' })).toBeNull();
    expect(`${window.location.pathname}${window.location.search}`).toBe(path);
    view.unmount();
  }
  expect(access.urls).not.toHaveBeenCalled();
  expect(access.listUsers).not.toHaveBeenCalled();
});

test('privileged users can access Past Exams and signed links, but are blocked from /dashboard', async () => {
  access.role.mockResolvedValue('privileged');
  const view = render(<App userId="priv-reader" userEmail="friend@tum.de" />);
  expect(screen.queryByRole('link', { name: /^Star on GitHub/ })).toBeNull();

  const navButtons = await screen.findAllByRole('button', { name: /Past Exams/i });
  expect(navButtons.length).toBeGreaterThan(0);
  expect(screen.queryByRole('link', { name: /^Star on GitHub/ })).toBeNull();
  expect(access.stars).not.toHaveBeenCalled();
  expect(screen.queryByText(/dashboard/i)).toBeNull();

  fireEvent.click(navButtons[0]);
  expect(await screen.findByRole('heading', { name: 'Past Exams' })).toBeTruthy();
  const zipLink = await screen.findByRole<HTMLAnchorElement>('link', { name: /Download all papers/i });
  expect(zipLink.getAttribute('href')).toBe(`${EXAM_DOWNLOAD_ENDPOINT}?file=${EXAM_ZIP.file}&token=abc`);
  expect(screen.getAllByRole('link', { name: /Download PDF/i })).toHaveLength(EXAM_FILES.length);
  view.unmount();

  // Visiting /dashboard directly returns privileged users to Chapter 1.
  window.history.replaceState(null, '', '/dashboard');
  render(<App userId="priv-reader" userEmail="friend@tum.de" />);
  expect(screen.getByText('Preface & Course Map')).toBeTruthy();
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  expect(access.listUsers).not.toHaveBeenCalled();
});

test('admins can search registered emails and save access inline across dashboard visits', async () => {
  access.role.mockResolvedValue('admin');
  let users = sampleUsers();
  access.listUsers.mockImplementation(async () => users);
  access.setAccess.mockImplementation(async (email: string, role: UserAccessRole) => {
    users = users.map((user) => user.email === email ? { ...user, role } : user);
  });
  window.history.replaceState(null, '', '/dashboard');

  const app = <App userId="owner-admin" userEmail="owner@example.test" />;
  const view = render(app);
  expect(screen.queryByRole('link', { name: /^Star on GitHub/ })).toBeNull();
  expect(await screen.findByRole('heading', { name: 'Access Dashboard' })).toBeTruthy();
  expect(screen.queryByRole('link', { name: /^Star on GitHub/ })).toBeNull();
  expect(access.stars).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: /dashboard/i })).toBeNull();
  const role = await screen.findByRole('button', { name: 'Access for student@tum.de, Base' });
  expect(screen.getByRole('button', { name: 'Access for friend@tum.de, Privileged' })).toBeTruthy();
  expect(screen.getByRole('row', { name: /owner@example\.test.*Admin/ })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Access for owner@example\.test/ })).toBeNull();
  expect(view.container.querySelector('input[type="file"]')).toBeNull();

  const search = screen.getByRole('searchbox', { name: 'Search emails' });
  fireEvent.change(search, { target: { value: ' STUDENT@TUM ' } });
  expect(screen.queryByRole('button', { name: /Access for friend@tum.de/ })).toBeNull();
  fireEvent.click(role);
  const baseOption = screen.getByRole('button', { name: 'Base', pressed: true });
  const privilegedOption = screen.getByRole('button', { name: 'Privileged', pressed: false });
  expect(document.activeElement).toBe(baseOption);
  fireEvent.keyDown(baseOption, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(privilegedOption);
  fireEvent.keyDown(privilegedOption, { key: 'Escape' });
  expect(screen.queryByRole('group', { name: 'Access level' })).toBeNull();
  expect(document.activeElement).toBe(role);
  fireEvent.click(role);
  fireEvent.pointerDown(search);
  expect(screen.queryByRole('group', { name: 'Access level' })).toBeNull();
  fireEvent.click(role);
  fireEvent.click(screen.getByRole('button', { name: 'Privileged', exact: true }));
  expect(role.getAttribute('aria-expanded')).toBe('false');
  expect(access.setAccess).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save access for student@tum.de' }));
  await screen.findByText('Access saved for student@tum.de.');
  expect(access.setAccess).toHaveBeenCalledWith('student@tum.de', 'privileged');
  expect(screen.queryByRole('button', { name: 'Save access for student@tum.de' })).toBeNull();

  fireEvent.change(search, { target: { value: 'nobody@example.test' } });
  expect(screen.getByText('No matching emails.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('button', { name: 'Access for friend@tum.de, Privileged' })).toBeTruthy();

  view.unmount();
  render(app);
  const savedRole = await screen.findByRole('button', { name: 'Access for student@tum.de, Privileged' });
  access.setAccess.mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(savedRole);
  fireEvent.click(screen.getByRole('button', { name: 'Base', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Save access for student@tum.de' }));
  await screen.findByText('Couldn’t save. Try again.');
  expect(users.find(({ email }) => email === 'student@tum.de')?.role).toBe('privileged');
  fireEvent.click(screen.getByRole('button', { name: 'Save access for student@tum.de' }));
  await screen.findByText('Access saved for student@tum.de.');
  expect(users.find(({ email }) => email === 'student@tum.de')?.role).toBe('base');
});

test('retries signed URL loading when private storage signing fails initially', async () => {
  access.role.mockResolvedValue('privileged');
  access.urls.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(signedUrls());
  window.history.replaceState(null, '', '/?page=exams');

  render(<App userId="priv-reader" userEmail="friend@tum.de" />);
  expect(await screen.findByText(/Could not prepare exam downloads/i)).toBeTruthy();
  expect(screen.queryByRole('link', { name: /Download all papers/i })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  const zipLink = await screen.findByRole<HTMLAnchorElement>('link', { name: /Download all papers/i });
  expect(zipLink.getAttribute('href')).toContain(`${EXAM_DOWNLOAD_ENDPOINT}?file=${EXAM_ZIP.file}`);
});

test('signing out from /dashboard or Past Exams clears the private URL back to the public root', async () => {
  access.role.mockResolvedValue('admin');
  const signOut = vi.fn().mockResolvedValue(undefined);
  window.history.replaceState(null, '', '/dashboard');

  render(<App userId="owner-admin" userEmail="owner@example.test" onSignOut={signOut} />);
  expect(await screen.findByRole('heading', { name: 'Access Dashboard' })).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
  expect(window.location.pathname).toBe('/');
  expect(window.location.search).toBe('');
});

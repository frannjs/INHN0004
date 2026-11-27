// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  fetchGitHubStarCount,
  formatGitHubStarCount,
  GITHUB_REPO_API_URL,
  readCachedGitHubStarCount,
} from '../src/lib/githubStars';

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('formats compact star counts cleanly', () => {
  expect(formatGitHubStarCount(0)).toBe('0');
  expect(formatGitHubStarCount(42)).toBe('42');
  expect(formatGitHubStarCount(999)).toBe('999');
  expect(formatGitHubStarCount(1000)).toBe('1k');
  expect(formatGitHubStarCount(1250)).toBe('1.3k');
  expect(formatGitHubStarCount(12_400)).toBe('12k');
});

test('fetches stargazers_count from GitHub API and reuses fresh localStorage cache', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ stargazers_count: 17 }),
  });
  vi.stubGlobal('fetch', fetchMock);

  expect(await fetchGitHubStarCount()).toBe(17);
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock.mock.calls[0][0]).toBe(GITHUB_REPO_API_URL);
  expect(readCachedGitHubStarCount()).toEqual({ count: 17, fresh: true });

  // Second call within TTL uses cache without hitting network.
  expect(await fetchGitHubStarCount()).toBe(17);
  expect(fetchMock).toHaveBeenCalledOnce();
});

test('returns null without poisoning cache on 404, and falls back to stale cache when rate-limited', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
  vi.stubGlobal('fetch', fetchMock);

  expect(await fetchGitHubStarCount()).toBeNull();
  expect(readCachedGitHubStarCount()).toBeNull();

  // Seed a stale cached count (> 5 min old) and verify fallback on network failure.
  window.localStorage.setItem(
    'ds:github-stars:frannjs/INHN0004',
    JSON.stringify({ count: 29, fetchedAt: Date.now() - 10 * 60 * 1000 }),
  );
  fetchMock.mockRejectedValueOnce(new Error('offline'));
  expect(await fetchGitHubStarCount()).toBe(29);
});

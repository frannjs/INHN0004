export const GITHUB_REPO_SLUG = 'frannjs/INHN0004';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_SLUG}`;
export const GITHUB_REPO_API_URL = `https://api.github.com/repos/${GITHUB_REPO_SLUG}`;

const CACHE_KEY = `ds:github-stars:${GITHUB_REPO_SLUG}`;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface StarCacheEntry {
  count: number;
  fetchedAt: number;
}

export function formatGitHubStarCount(count: number): string {
  if (count < 1000) return String(count);
  if (count >= 10_000) return `${Math.round(count / 1000)}k`;
  return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}

export function readCachedGitHubStarCount(): { count: number; fresh: boolean } | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StarCacheEntry>;
    if (typeof parsed.count !== 'number' || !Number.isFinite(parsed.count) || parsed.count < 0) return null;
    const fresh = typeof parsed.fetchedAt === 'number' && Date.now() - parsed.fetchedAt < CACHE_TTL_MS;
    return { count: Math.floor(parsed.count), fresh };
  } catch {
    return null;
  }
}

export async function fetchGitHubStarCount(signal?: AbortSignal): Promise<number | null> {
  const cached = readCachedGitHubStarCount();
  if (cached?.fresh) return cached.count;
  try {
    const response = await fetch(GITHUB_REPO_API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal,
    });
    if (!response.ok) return cached?.count ?? null;
    const data = await response.json() as { stargazers_count?: unknown };
    if (typeof data.stargazers_count !== 'number' || !Number.isFinite(data.stargazers_count) || data.stargazers_count < 0) {
      return cached?.count ?? null;
    }
    const count = Math.floor(data.stargazers_count);
    try {
      const entry: StarCacheEntry = { count, fetchedAt: Date.now() };
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch { /* Storage quota or private mode should not block rendering. */ }
    return count;
  } catch {
    return cached?.count ?? null;
  }
}

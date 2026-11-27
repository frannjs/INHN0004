import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BOOK_PARTS, CHAPTERS } from './data/syllabus';
import { CourseInline } from './components/chapter/CourseText';
import { ChapterReadingPoints } from './components/PracticeCheckpoint';
import { ReaderNotes, type NotesView } from './components/notes/ReaderNotes';
import { Chapter4Relations } from './chapters/Chapter4Relations';
import { PublishedChapter } from './chapters/PublishedChapter';
import {
  captureReadingPosition,
  createReadingPositionWriter,
  loadReadingPosition,
  restoreReadingPosition,
  type ReadingPosition,
} from './lib/readingPosition';
import {
  CourseOverviewPage,
  ExamPracticePage,
  SymbolDictionaryPage,
} from './chapters/OverviewAndReference';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { fetchUserAccessRole, type UserAccessRole } from './lib/examAccess';
import {
  fetchGitHubStarCount,
  formatGitHubStarCount,
  GITHUB_REPO_URL,
  readCachedGitHubStarCount,
} from './lib/githubStars';

type AccessState = 'checking' | UserAccessRole;

type Destination = { page: string; section?: string; position?: ReadingPosition };
const referencePages = new Set(['overview', 'symbols', 'exams']);
const startPage = 'overview';

function isDashboardPathname(pathname: string) {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '/dashboard' || clean === '/dasboard';
}

function readDestination(): Destination | null {
  const url = new URL(window.location.href);
  if (isDashboardPathname(url.pathname)) return { page: 'dashboard' };
  const section = url.hash.slice(1);
  const page = url.searchParams.get('page');
  if (page === 'dashboard') return { page: 'dashboard' };
  if (page && referencePages.has(page)) return { page };
  const chapter = page
    ? CHAPTERS.find((entry) => entry.id === page)
    : CHAPTERS.find((entry) => entry.sections.some((item) => item.id === section));
  if (!chapter) return null;
  return {
    page: chapter.id,
    section: chapter.sections.some((item) => item.id === section) ? section : undefined,
  };
}

function savedDestination(position?: ReadingPosition | null): Destination | null {
  const chapter = CHAPTERS.find(({ id }) => id === position?.page_key);
  if (!chapter || !position) return null;
  return { page: chapter.id, position };
}

function historyDestination(userId?: string): Destination | null {
  const requested = readDestination();
  const entry = window.history.state?.readerPosition;
  if (!requested || !userId || !entry) return requested;
  if (entry.userId !== userId) return null;
  return entry.position?.page_key === requested.page ? savedDestination(entry.position) ?? requested : requested;
}

function readingUrl(page: string, section?: string) {
  const url = new URL(window.location.href);
  if (page === 'dashboard') {
    url.pathname = '/dashboard';
    url.searchParams.delete('page');
    url.hash = '';
    return url;
  }
  if (isDashboardPathname(url.pathname)) {
    const base = import.meta.env.BASE_URL;
    url.pathname = base && base !== './' && base !== '.' ? base : '/';
  }
  url.searchParams.set('page', page);
  url.hash = section ?? '';
  return url;
}

export const App: React.FC<{
  onSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  signingIn?: boolean;
  accountError?: string;
  userId?: string;
  userEmail?: string;
}> = ({
  onSignIn,
  onSignOut,
  signingIn,
  accountError,
  userId,
  userEmail,
}) => {
  const [destination, setDestination] = useState<Destination>(() => historyDestination(userId) ?? { page: startPage });
  const [accessState, setAccessState] = useState<AccessState>(() => (userId ? 'checking' : 'base'));
  const [starCount, setStarCount] = useState<number>(() => readCachedGitHubStarCount()?.count ?? 0);
  const hasExamAccess = accessState === 'privileged' || accessState === 'admin';
  const isAdmin = accessState === 'admin';
  const blocked = (destination.page === 'exams' && !hasExamAccess) || (destination.page === 'dashboard' && !isAdmin);
  const route = blocked ? startPage : destination.page;
  const chapterIndex = CHAPTERS.findIndex((chapter) => chapter.id === route);
  const activeChapter = CHAPTERS[chapterIndex];
  const nextChapter = activeChapter ? CHAPTERS[chapterIndex + 1] : undefined;
  const writer = useMemo(() => userId ? createReadingPositionWriter(userId) : null, [userId]);
  const [resume, setResume] = useState<Destination | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const [notesView, setNotesView] = useState<NotesView>(null);
  const chaptersTrigger = useRef<HTMLButtonElement>(null);
  const closeChapters = useRef<HTMLButtonElement>(null);
  const notesTrigger = useRef<HTMLButtonElement>(null);
  const articleContainer = useRef<HTMLElement>(null);
  const capturePosition = useRef<(() => void) | null>(null);
  const lastReadPosition = useRef<ReadingPosition | null>(null);
  const focusReadingStart = useRef(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(false);
    try {
      capturePosition.current?.();
      await writer?.flush();
      await onSignOut?.();
      const url = new URL(window.location.href);
      if (isDashboardPathname(url.pathname)) url.pathname = '/';
      url.searchParams.delete('page');
      url.hash = '';
      window.history.replaceState(null, '', url);
      setDestination({ page: startPage });
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  };

  const dismissChapters = () => {
    setDrawerOpen(false);
    chaptersTrigger.current?.focus({ preventScroll: true });
  };

  const navigate = (page: string, section?: string, position?: ReadingPosition) => {
    if (page === 'exams' && !hasExamAccess) return;
    if (page === 'dashboard' && !isAdmin) return;
    capturePosition.current?.();
    const url = readingUrl(page, section);
    if (url.href !== window.location.href) window.history.pushState(null, '', url);
    setDestination({ page, section, position });
    if (drawerOpen) dismissChapters();
  };

  useEffect(() => {
    if (!userId) {
      setAccessState('base');
      return;
    }
    let active = true;
    const controller = new AbortController();
    setAccessState('checking');
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]);
    void fetchUserAccessRole(signal)
      .then((role) => {
        if (active && !controller.signal.aborted) setAccessState(role);
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setAccessState('base');
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [userId]);

  useEffect(() => {
    if (accessState !== 'base') return;
    let active = true;
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]);
    void fetchGitHubStarCount(signal).then((count) => {
      if (active && !controller.signal.aborted && count !== null) setStarCount(count);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [accessState]);

  useEffect(() => {
    // Guests can sign in from a private deep link and return to the requested page.
    if (!userId || accessState === 'checking' || !blocked) return;
    const url = readingUrl(startPage);
    window.history.replaceState(window.history.state, '', url);
    setDestination({ page: startPage });
  }, [accessState, blocked, userId]);

  useEffect(() => {
    if (route !== startPage || !userId || blocked) return;
    if (lastReadPosition.current) {
      setResume(savedDestination(lastReadPosition.current));
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(2500)]);
      const position = await loadReadingPosition(userId, signal).catch(() => null);
      if (controller.signal.aborted) return;
      setResume(savedDestination(position));
    };
    void load();
    return () => controller.abort();
  }, [blocked, route, userId]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const restore = () => {
      setDestination(historyDestination(userId) ?? { page: startPage });
      setDrawerOpen(false);
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
      window.history.scrollRestoration = previous;
    };
  }, [userId]);

  useEffect(() => {
    if (drawerOpen) closeChapters.current?.focus({ preventScroll: true });
  }, [drawerOpen]);

  useLayoutEffect(() => {
    if (destination.position && activeChapter) restoreReadingPosition(activeChapter, destination.position);
    else if (destination.section) document.getElementById(destination.section)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
    if (focusReadingStart.current) {
      focusReadingStart.current = false;
      articleContainer.current?.focus({ preventScroll: true });
    }
    if (!activeChapter || !writer) return;

    let lastScroll = window.scrollY;
    let lastPosition = captureReadingPosition(activeChapter);
    let timer: number | undefined;
    const remember = () => {
      lastReadPosition.current = lastPosition;
      try {
        window.history.replaceState({ ...window.history.state, readerPosition: { userId, position: lastPosition } }, '');
      } catch { /* Saving to Supabase still works when history updates are restricted. */ }
    };
    // Retain this exact history entry for refresh and Back/Forward.
    remember();
    if (!destination.position && readDestination()?.page === activeChapter.id) writer.record(lastPosition);

    const capture = () => {
      window.clearTimeout(timer);
      timer = undefined;
      if (window.scrollY === lastScroll) return;
      lastScroll = window.scrollY;
      const position = captureReadingPosition(activeChapter);
      if (position.section_id === lastPosition.section_id && position.section_progress === lastPosition.section_progress) return;
      lastPosition = position;
      remember();
      writer.record(position);
    };
    const onScroll = () => {
      if (timer === undefined) timer = window.setTimeout(capture, 350);
    };
    capturePosition.current = capture;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      capturePosition.current = null;
    };
  }, [activeChapter, destination, userId, writer]);

  useEffect(() => {
    if (!writer) return;
    const save = () => {
      capturePosition.current?.();
      void writer.flush();
    };
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', saveWhenHidden);
    window.addEventListener('pagehide', save);
    window.addEventListener('online', save);
    return () => {
      document.removeEventListener('visibilitychange', saveWhenHidden);
      window.removeEventListener('pagehide', save);
      window.removeEventListener('online', save);
    };
  }, [writer]);

  const resumeSection = resume?.position?.section_id ?? undefined;

  return (
    <div className="textbook">
      {/* Floating Centered Pill Navigation Bar */}
      <header className="floating-nav-wrap">
        <nav className="floating-nav-pill" aria-label="Primary Navigation">
          <button
            ref={chaptersTrigger}
            type="button"
            className="nav-pill-btn"
            aria-expanded={drawerOpen}
            aria-controls="chapter-contents"
            onClick={() => { setDrawerOpen(true); setNotesView(null); }}
          >
            Chapters
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${route === 'symbols' ? 'active' : ''}`}
            onClick={() => navigate('symbols')}
          >
            Symbols
          </button>
          {hasExamAccess && (
            <button
              type="button"
              className={`nav-pill-btn nav-desktop-only ${route === 'exams' ? 'active' : ''}`}
              onClick={() => navigate('exams')}
            >
              Past Exams
            </button>
          )}
          <button
            type="button"
            className={`nav-pill-btn nav-desktop-only ${route === 'overview' ? 'active' : ''}`}
            onClick={() => navigate('overview')}
          >
            Syllabus
          </button>
          {userId && !blocked && route !== 'dashboard' && (
            <button ref={notesTrigger} type="button" className={`nav-pill-btn ${notesView === 'list' ? 'active' : ''}`} aria-haspopup="dialog" aria-expanded={notesView === 'list'} onClick={() => { setNotesView((value) => value === 'list' ? null : 'list'); setDrawerOpen(false); }}>
              Notes
            </button>
          )}
          {userId && onSignOut && (
            <button type="button" className="nav-pill-btn nav-sign-out" onClick={handleSignOut}
              aria-label={signingOut ? 'Signing out' : 'Sign out'} title="Sign out" disabled={signingOut}>
              <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 4H5v16h5m-1-8h11m-4-4 4 4-4 4" />
              </svg>
            </button>
          )}
          {!userId && onSignIn && (
            <button type="button" className="nav-pill-btn nav-sign-in" onClick={() => void onSignIn()}
              disabled={signingIn} aria-busy={signingIn}>
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          )}
        </nav>
        {accessState === 'base' && (
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="github-star-btn"
            aria-label={`Star on GitHub (${starCount} ${starCount === 1 ? 'star' : 'stars'})`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span className="github-star-label">Star<span className="github-star-suffix"> on GitHub</span></span>
            <span className="github-star-count" aria-hidden="true">{formatGitHubStarCount(starCount)}</span>
          </a>
        )}
      </header>
      {(signOutError || accountError) && (
        <p className="account-error" role="alert">{signOutError ? 'Could not sign out. Please try again.' : accountError}</p>
      )}

      {/* Smooth Slide-Over Table of Contents Drawer */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        aria-hidden="true"
        onClick={dismissChapters}
      />
      <aside id="chapter-contents" aria-label="Table of Contents" inert={!drawerOpen} className={`contents-drawer ${drawerOpen ? 'open' : ''}`}
        onKeyDown={(event) => { if (event.key === 'Escape') dismissChapters(); }}>
        <div className="contents-drawer-header">
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
              Table of Contents
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              TUM INHN0004 · Discrete structures
            </div>
          </div>
          <button
            ref={closeChapters}
            type="button"
            className="ctrl-btn"
            onClick={dismissChapters}
          >
            Close
          </button>
        </div>

        <div className="toc-group">
          <div className="toc-part-label">Reference</div>
          <button
            type="button"
            className={`toc-item ${route === 'overview' ? 'active' : ''}`}
            onClick={() => navigate('overview')}
          >
            <span>Preface &amp; Full Syllabus</span>
          </button>
          <button
            type="button"
            className={`toc-item ${route === 'symbols' ? 'active' : ''}`}
            onClick={() => navigate('symbols')}
          >
            <span>Symbol Dictionary</span>
            <span className="toc-tag">I–V</span>
          </button>
          {hasExamAccess && (
            <button
              type="button"
              className={`toc-item ${route === 'exams' ? 'active' : ''}`}
              onClick={() => navigate('exams')}
            >
              <span>Past Exams</span>
              <span className="toc-tag">PDF</span>
            </button>
          )}
        </div>

        {BOOK_PARTS.map((p) => {
          const list = CHAPTERS.filter((c) => c.part === p.part);
          return (
            <div key={p.part} className="toc-group">
              <div className="toc-part-label">{p.title}</div>
              {list.map((ch) => {
                const isActive = route === ch.id;
                return (
                  <React.Fragment key={ch.id}>
                  <button
                    type="button"
                    className={`toc-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => navigate(ch.id)}
                  >
                    <span>
                      {ch.number.replace('Chapter ', '')}. {ch.title}
                    </span>
                  </button>
                  <ChapterReadingPoints chapter={ch} compact showOutline={isActive} onSelect={navigate} />
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </aside>

      {/* Quiet Right-Margin Section Dots when reading an active chapter */}
      {activeChapter && route && (
        <nav className="floating-outline" aria-label="Chapter Sections">
          {activeChapter.sections.map((s) => (
            <a key={s.id} href={`?page=${route}#${s.id}`} className="outline-link"
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                navigate(route, s.id);
              }}>
              <span>
                {s.num} <CourseInline text={s.title} />
              </span>
              <div className="outline-dot" />
            </a>
          ))}
        </nav>
      )}

      <main className="book-main" ref={articleContainer} tabIndex={-1}>
        {route === 'overview' && <CourseOverviewPage onSelectChapter={navigate} resumeReading={resume && userId ? {
          href: readingUrl(resume.page, resumeSection).href,
          onClick: (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            focusReadingStart.current = event.detail === 0;
            navigate(resume.page, resumeSection, resume.position);
          },
        } : undefined} />}
        {route === 'symbols' && <SymbolDictionaryPage />}
        {route === 'exams' && hasExamAccess && <ExamPracticePage userId={userId} />}
        {route === 'dashboard' && isAdmin && <AdminDashboardPage userEmail={userEmail} />}
        {route === 'ch04' && <Chapter4Relations />}
        {activeChapter && activeChapter.id !== 'ch04' && (
          <PublishedChapter key={activeChapter.id} chapter={activeChapter} />
        )}
        {nextChapter && (
          <nav className="chapter-continuation" aria-label="Continue reading">
            <a href={`?page=${nextChapter.id}`} rel="next" onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              focusReadingStart.current = event.detail === 0;
              navigate(nextChapter.id);
            }}>
              <span>
                <span className="chapter-continuation-label">Next chapter</span>
                <span className="chapter-continuation-title">{nextChapter.title}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
          </nav>
        )}
      </main>
      {userId && !blocked && route !== 'dashboard' && <ReaderNotes key={userId} userId={userId} pageKey={route} articleContainer={articleContainer}
        triggerRef={notesTrigger} view={notesView} onViewChange={setNotesView} onNavigate={navigate} />}
    </div>
  );
};

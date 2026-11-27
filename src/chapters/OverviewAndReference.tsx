import React, { useEffect, useState } from 'react';
import {
  BOOK_PARTS,
  CHAPTERS,
  GLOBAL_SYMBOL_DICTIONARY,
} from '../data/syllabus';
import { Tex } from '../components/math/Tex';
import { CourseInline } from '../components/chapter/CourseText';
import { EXAM_FILES, EXAM_ZIP } from '../data/pastExams';
import { matchesNotation } from '../data/notationSearch';
import { ChapterReadingPoints } from '../components/PracticeCheckpoint';
import { loadExamDownloadUrls } from '../lib/examAccess';
import { loadExamReviews, setExamReviewed } from '../lib/examReviews';

interface OverviewProps {
  onSelectChapter: (id: string, sectionId?: string) => void;
  resumeReading?: { href: string; onClick: React.MouseEventHandler<HTMLAnchorElement> };
}

export const CourseOverviewPage: React.FC<OverviewProps> = ({ onSelectChapter, resumeReading }) => {
  return (
    <article className="chapter-article">
      <div className="chapter-running-head">
        <span>TUM Campus Heilbronn · Discrete Structures (INHN0004)</span>
        <span>Complete Interactive Textbook</span>
      </div>

      <div className="chapter-number">Preface &amp; Course Map</div>
      <h1 className="chapter-title">Discrete Structures</h1>

      <p className="chapter-lead">
        We start with a small question. What would it take to break a rule? One carefully chosen
        row of a truth table may be enough. By the end, we’ll be able to ask whether a whole set
        of rules can be satisfied together, and give a proof when the answer is no.
      </p>

      {resumeReading && (
        <a className="chapter-resume ctrl-btn" href={resumeReading.href} onClick={resumeReading.onClick}>
          Resume reading <span aria-hidden="true">→</span>
        </a>
      )}

      <p>
        Along the way, we’ll ask what fits into a set, where a chain of arrows can take us, and
        whether a calculation can be undone. When a definition gets dense, try it on one object
        first. A single ordered pair is enough to see what a relation records. Once we know how
        to read that pair, we have something to work with when the relation is too big to list.
      </p>

      <div className="math-block plain">
        <div className="math-block-header">
          <span className="math-block-label">How to Study</span>
        </div>
        <p>
          Take one entry in a table and work out why it has that value. In a relation matrix,
          for instance, a 1 in row <Tex math="a" /> and column <Tex math="b" /> means there is an
          arrow from <Tex math="a" /> to <Tex math="b" />. Trace that arrow in the drawing before
          moving on to a whole row.
        </p>
        <p>
          Before opening a worked answer, try the first move on paper. If you get stuck, read
          until you find a step you can continue from, then cover the rest again. In a proof,
          stop at the line where an assumption is used and see what would fail without it.
        </p>
      </div>

      <section className="section-block" style={{ marginTop: 44 }}>
        <h2 className="section-heading">
          <span>Five-Part Syllabus</span>
        </h2>
        <p className="practice-sequence-note">
          The weekly practice markers show where to pause in the reading. Try the exercises
          there, then use the worked reasoning to check the step you were unsure of.
        </p>

        {BOOK_PARTS.map((part) => {
          const partChapters = CHAPTERS.filter((chapter) => chapter.part === part.part);
          const headingId = `syllabus-part-${part.part}`;
          return (
            <section key={part.part} className="syllabus-part" aria-labelledby={headingId}>
              <h3 id={headingId} className="syllabus-part-title">{part.title}</h3>
              <p className="syllabus-part-description">{part.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {partChapters.map((ch) => (
                  <React.Fragment key={ch.id}>
                    <button type="button" className="syllabus-chapter" onClick={() => onSelectChapter(ch.id)}>
                      <span className="syllabus-chapter-title">
                        <span className="syllabus-chapter-number">{ch.number}</span>{' '}
                        {ch.title}
                      </span>
                      <span className="syllabus-chapter-summary"><CourseInline text={ch.summary} /></span>
                    </button>
                    <ChapterReadingPoints chapter={ch} onSelect={onSelectChapter} />
                  </React.Fragment>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </article>
  );
};

const MixedNote: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split('$');
  return (
    <>
      {parts.map((seg, i) =>
        i % 2 === 1 ? <Tex key={i} math={seg} /> : <React.Fragment key={i}>{seg}</React.Fragment>
      )}
    </>
  );
};

export const SymbolDictionaryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const filtered = GLOBAL_SYMBOL_DICTIONARY.filter((entry) => matchesNotation(entry, query));

  return (
    <article className="chapter-article">
      <div className="chapter-running-head">
        <span>Discrete Structures (INHN0004)</span>
        <span>Notation Reference</span>
      </div>
      <div className="chapter-number">Global Notation</div>
      <h1 className="chapter-title">Symbol Dictionary</h1>
      <p className="chapter-lead">Symbols, names, and meanings from all five parts.</p>

      <div className="notation-controls">
        <label className="sr-only" htmlFor="notation-search">Search the symbol dictionary</label>
        <input
          id="notation-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a symbol…"
        />
      </div>

      {filtered.length === 0 ? (
        <p role="status">No symbols match this search.</p>
      ) : (
        <div className="symbol-box dictionary-box">
          <table className="symbol-table">
            <caption className="sr-only">Symbols, their names, and meanings</caption>
            <thead>
              <tr>
                <th scope="col" style={{ width: '28%' }}>Symbol</th>
                <th scope="col" style={{ width: '24%' }}>Read aloud</th>
                <th scope="col">Meaning</th>
              </tr>
            </thead>
            {BOOK_PARTS.map((part) => {
              const entries = filtered.filter((entry) => entry.part === `Part ${part.part}`);
              if (!entries.length) return null;
              return (
                <tbody key={part.part}>
                  <tr className="notation-part-heading">
                    <th scope="rowgroup" colSpan={3}>{part.title}</th>
                  </tr>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="notation-symbol"><Tex math={entry.tex} /></td>
                      <td className="symbol-read">{entry.name}</td>
                      <td className="notation-meaning"><MixedNote text={entry.meaning} /></td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      )}
    </article>
  );
};

const formatSize = (bytes: number) => bytes < 1_000_000
  ? `${Math.round(bytes / 1000)} KB`
  : `${(bytes / 1_000_000).toFixed(1)} MB`;

// Newest academic year first; the undated paper stays separate.
const EXAM_GROUPS = [
  'WS 2024/25',
  'WS 2023/24',
  'WS 2022/23',
  'WS 2021/22',
  'Undated',
];
const ALL_EXAM_FILES = [EXAM_ZIP.file, ...EXAM_FILES.map((exam) => exam.file)];
const SIGNED_URL_TTL_SECONDS = 3600;
const SIGNED_URL_REFRESH_MS = 45 * 60 * 1000;

export const ExamPracticePage: React.FC<{ userId?: string }> = ({ userId }) => {
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState<Set<string>>(() => new Set());
  const [saveErrors, setSaveErrors] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(Boolean(userId));
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [downloadUrls, setDownloadUrls] = useState<Map<string, string>>(() => new Map());
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [urlsFailed, setUrlsFailed] = useState(false);
  const [urlAttempt, setUrlAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchUrls = () => {
      setUrlsLoading(true);
      setUrlsFailed(false);
      void loadExamDownloadUrls(ALL_EXAM_FILES, SIGNED_URL_TTL_SECONDS)
        .then((urls) => {
          if (!active) return;
          setDownloadUrls(urls);
          if (urls.size !== ALL_EXAM_FILES.length) setUrlsFailed(true);
        })
        .catch(() => {
          if (active) setUrlsFailed(true);
        })
        .finally(() => {
          if (active) setUrlsLoading(false);
        });
    };
    fetchUrls();
    const refreshTimer = window.setInterval(fetchUrls, SIGNED_URL_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [urlAttempt]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]);
    void loadExamReviews(userId, signal)
      .then((ids) => { if (!controller.signal.aborted) setReviewed(new Set(ids)); })
      .catch(() => { if (!controller.signal.aborted) setLoadFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [userId, loadAttempt]);

  const toggleReview = async (id: string, checked: boolean) => {
    if (!userId || loading || loadFailed || saving.has(id)) return;
    const wasReviewed = reviewed.has(id);
    const updateReview = (value: boolean) => setReviewed((current) => {
      const next = new Set(current);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
    setSaving((current) => new Set(current).add(id));
    setSaveErrors((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    updateReview(checked);
    try {
      await setExamReviewed(userId, id, checked);
    } catch {
      updateReview(wasReviewed);
      setSaveErrors((current) => new Set(current).add(id));
    } finally {
      setSaving((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <article className="chapter-article">
      <div className="chapter-running-head">
        <span>Discrete Structures (INHN0004)</span>
        <span>Exam Archive</span>
      </div>
      <div className="chapter-number">Past Papers</div>
      <h1 className="chapter-title">Past Exams</h1>
      <p className="chapter-lead">
        Print-ready exams, retakes, and short tests grouped by academic year.
      </p>
      {downloadUrls.has(EXAM_ZIP.file) ? (
        <a className="exam-download archive-download" href={downloadUrls.get(EXAM_ZIP.file)} download={EXAM_ZIP.file}>
          Download all papers <span>ZIP · {formatSize(EXAM_ZIP.bytes)}</span>
        </a>
      ) : (
        <span className="exam-download archive-download exam-download-disabled" aria-disabled="true">
          {urlsLoading ? 'Preparing archive…' : 'Archive unavailable'} <span>ZIP · {formatSize(EXAM_ZIP.bytes)}</span>
        </span>
      )}
      {urlsFailed && <p className="exam-review-error exam-load-error" role="status">
        Could not prepare exam downloads. <button type="button" className="ctrl-btn" onClick={() => setUrlAttempt((attempt) => attempt + 1)}>Retry</button>
      </p>}
      {loadFailed && <p className="exam-review-error exam-load-error" role="status">
        Could not load review status. <button type="button" className="ctrl-btn" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry</button>
      </p>}

      {EXAM_GROUPS.map((group) => (
        <section className="section-block exam-year" key={group} aria-label={group}>
          <h2 className="section-heading">{group}</h2>
          <ul className="exam-list">
            {EXAM_FILES.filter((exam) => exam.group === group).map((exam) => (
              <li className="exam-row" key={exam.id}>
                <div className="exam-description">
                  <h3>{exam.title}</h3>
                  <p className="exam-meta">
                    {exam.date && `${exam.date} · `}{exam.pages} pages · {formatSize(exam.bytes)}
                  </p>
                  {exam.note && <p className="exam-meta">{exam.note}</p>}
                  {saveErrors.has(exam.id) && <p className="exam-review-error" role="status">Could not save review status. Try again.</p>}
                </div>
                <div className="exam-actions">
                  {userId && <label className="exam-reviewed" title={reviewed.has(exam.id) ? 'Unmark as reviewed' : 'Mark as reviewed'}>
                    <input className="sr-only" type="checkbox" aria-label={`Reviewed · ${group} · ${exam.title}`}
                      checked={reviewed.has(exam.id)} disabled={loading || loadFailed || saving.has(exam.id)}
                      onChange={(event) => void toggleReview(exam.id, event.currentTarget.checked)} />
                    <span className="exam-review-mark" aria-hidden="true" />
                  </label>}
                  {downloadUrls.has(exam.file) ? (
                    <a className="exam-download" href={downloadUrls.get(exam.file)} download={exam.file}>
                      Download PDF<span className="sr-only"> · {group} · {exam.title}</span>
                    </a>
                  ) : (
                    <span className="exam-download exam-download-disabled" aria-disabled="true">
                      {urlsLoading ? 'Preparing…' : 'Unavailable'}<span className="sr-only"> · {group} · {exam.title}</span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
};

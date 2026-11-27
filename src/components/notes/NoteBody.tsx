import { Fragment, lazy, Suspense, type ReactNode } from 'react';
import { hasNoteMarkdown } from '../../lib/noteMarkdownSyntax';
import { findNoteNotation } from '../../lib/noteNotation';
import { Tex } from '../math/Tex';

const NoteMarkdown = lazy<typeof import('./NoteMarkdown').NoteMarkdown>(() => import('./NoteMarkdown').then(
  ({ NoteMarkdown }) => ({ default: NoteMarkdown }),
  () => ({
    default: ({ source }) => <div className="note-markdown-fallback">
      <span className="note-markdown-loading" role="status">Preview unavailable.</span>
      <div>{source}</div>
    </div>,
  }),
));

export const NOTE_BODY_LIMIT = 20000;
const formatPrefix = '\u001fnotes:1\n';
export const bold = 1;
export const italic = 2;
export const underline = 4;
export type Run = [text: string, marks: number];

export function decodeBody(body: string): Run[] {
  if (body.startsWith(formatPrefix)) {
    try {
      const runs: unknown = JSON.parse(body.slice(formatPrefix.length));
      if (Array.isArray(runs) && runs.every((run) =>
        Array.isArray(run) && run.length === 2 && typeof run[0] === 'string' &&
        Number.isInteger(run[1]) && run[1] >= 0 && run[1] <= 7
      )) return runs as Run[];
    } catch {
      // Every legacy body remains readable as plain text.
    }
  }
  return [[body, 0]];
}

export function notePlainText(body: string) {
  if (!body.startsWith(formatPrefix)) return body;
  return decodeBody(body).map(([text]) => text).join('');
}

function withMarks(content: ReactNode, marks: number) {
  if (marks & bold) content = <strong>{content}</strong>;
  if (marks & italic) content = <em>{content}</em>;
  if (marks & underline) content = <u>{content}</u>;
  return content;
}

export function NoteBody({ body, compact = false }: { body: string; compact?: boolean }) {
  const runs = decodeBody(body);
  const source = runs.map(([text]) => text).join('');
  if (!compact && hasNoteMarkdown(source)) {
    const marks = markdownMarks(runs);
    return <div className="note-markdown">
      <Suspense fallback={<span className="note-markdown-loading" role="status">Loading preview…</span>}>
        <NoteMarkdown source={source} marks={marks} />
      </Suspense>
    </div>;
  }

  const content: ReactNode[] = [];
  let offset = 0;
  let runIndex = 0;
  let runOffset = 0;

  function advance(end: number, render: boolean) {
    while (offset < end) {
      const [text, marks] = runs[runIndex];
      const count = Math.min(end - offset, text.length - runOffset);
      if (render && count) {
        content.push(<Fragment key={offset}>{withMarks(text.slice(runOffset, runOffset + count), marks)}</Fragment>);
      }
      offset += count;
      runOffset += count;
      if (runOffset === text.length) {
        runIndex++;
        runOffset = 0;
      }
    }
  }

  // Parse across formatting boundaries so styling part of an equation cannot split its source.
  for (const match of findNoteNotation(source).expressions) {
    advance(match.start, true);
    const display = match.display && !compact;
    const raw = source.slice(match.start, match.end);
    const equation = <Tex math={match.math} display={display} fallback={raw} dataSource={raw}
      className={display ? 'note-math note-math-block' : 'note-math'} />;
    content.push(<Fragment key={match.start}>{display ? equation : withMarks(equation, runs[runIndex]?.[1] ?? 0)}</Fragment>);
    advance(match.end, false);
  }
  advance(source.length, true);
  return <>{content}</>;
}

export function encodeBody(runs: Run[]) {
  const plain = runs.map(([text]) => text).join('');
  return runs.some(([, marks]) => marks) || plain.startsWith(formatPrefix)
    ? formatPrefix + JSON.stringify(runs) : plain;
}

export function markdownMarks(runs: Run[]) {
  let position = 0;
  return runs.flatMap(([text, style]) => {
    const start = position;
    position += text.length;
    return style && text.length ? [{
      start,
      end: position,
      bold: Boolean(style & bold),
      italic: Boolean(style & italic),
      underline: Boolean(style & underline),
    }] : [];
  });
}

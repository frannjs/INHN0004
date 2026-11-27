import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { NoteMath } from '../../lib/noteMath';
import { findNoteNotation } from '../../lib/noteNotation';
import { Tex } from '../math/Tex';

export interface NoteMarkdownMark {
  start: number;
  end: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  url?: string;
  title?: string | null;
  alt?: string | null;
  position?: { start: { offset?: number }; end: { offset?: number } };
  data?: { hName: string; hProperties?: Record<string, string> };
}

const bold = 1;
const italic = 2;
const underline = 4;

function prepare(source: string, marks: readonly NoteMarkdownMark[]) {
  const { expressions: matches } = findNoteNotation(source);
  const equations = new Map<string, NoteMath>();
  const styles = new Uint8Array(source.length);
  const offsets: number[] = [];
  for (const mark of marks) {
    styles.fill((mark.bold ? bold : 0) | (mark.italic ? italic : 0) | (mark.underline ? underline : 0), mark.start, mark.end);
  }
  if (!matches.length) return { markdown: source, equations, styles, offsets };

  // Keep TeX out of the Markdown lexer, including characters used by tables and emphasis.
  // Pick placeholders that the user did not type so literal text cannot become math.
  const existing = new Set(source);
  const parts: string[] = [];
  let cursor = 0;
  let marker = 0xf0000;
  for (const match of matches) {
    let token = String.fromCodePoint(marker++);
    while (existing.has(token)) token = String.fromCodePoint(marker++);
    equations.set(token, match);
    parts.push(source.slice(cursor, match.start), token);
    for (; cursor < match.start; cursor++) offsets.push(cursor);
    for (let index = 0; index < token.length; index++) offsets.push(match.start);
    cursor = match.end;
  }
  parts.push(source.slice(cursor));
  for (; cursor < source.length; cursor++) offsets.push(cursor);
  return { markdown: parts.join(''), equations, styles, offsets };
}

function styledNode(node: MarkdownNode, marks: number): MarkdownNode {
  if (marks & bold) node = { type: 'strong', children: [node] };
  if (marks & italic) node = { type: 'emphasis', children: [node] };
  if (marks & underline) node = { type: 'noteUnderline', children: [node], data: { hName: 'u' } };
  return node;
}

export function NoteMarkdown({ source, marks = [], editable = false }: {
  source: string;
  marks?: readonly NoteMarkdownMark[];
  editable?: boolean;
}) {
  const { markdown, equations, styles, offsets } = prepare(source, marks);

  function restoreLiteral(value: string) {
    return Array.from(value, (char) => {
      const math = equations.get(char);
      return math ? source.slice(math.start, math.end) : char;
    }).join('');
  }

  function decorateText(node: MarkdownNode): MarkdownNode[] {
    const value = node.value ?? '';
    let cursor = node.position?.start.offset ?? 0;
    const end = node.position?.end.offset ?? cursor + value.length;
    const result: MarkdownNode[] = [];
    let run = '';
    let active = 0;
    for (const char of value) {
      // Markdown text offsets normally align exactly. A bounded look-ahead handles spaces
      // removed at line breaks and escapes without searching the whole note per character.
      if (!markdown.startsWith(char, cursor)) {
        const next = markdown.slice(cursor, Math.min(end, cursor + 48)).indexOf(char);
        if (next >= 0) cursor += next;
      }
      const math = equations.get(char);
      const mask = styles[offsets[cursor] ?? cursor] ?? 0;
      cursor += char.length;
      if (run && (math || active !== mask)) {
        result.push(styledNode({ type: 'text', value: run }, active));
        run = '';
      }
      if (math) {
        const equation: MarkdownNode = {
          type: 'noteEquation',
          children: [],
          data: { hName: 'span', hProperties: { 'data-note-equation': char } },
        };
        result.push(math.display ? equation : styledNode(equation, mask));
      } else {
        active = mask;
        run += char;
      }
    }
    if (run) result.push(styledNode({ type: 'text', value: run }, active));
    return result;
  }

  function decorate(parent: MarkdownNode) {
    parent.children = parent.children?.flatMap((node) => {
      if (node.type === 'text') return decorateText(node);
      // Markdown may classify a placeholder as indented code, a link destination, or raw
      // HTML text. Recover the original characters in those positions instead of typesetting.
      if (node.value && equations.size) node.value = restoreLiteral(node.value);
      if (node.url && equations.size) node.url = restoreLiteral(node.url);
      if (node.title && equations.size) node.title = restoreLiteral(node.title);
      if (node.alt && equations.size) node.alt = restoreLiteral(node.alt);
      decorate(node);
      return [node];
    });
  }

  return <Markdown remarkPlugins={[remarkGfm, () => decorate]} components={{
    span({ node, children }) {
      const id = node?.properties['data-note-equation'];
      const math = typeof id === 'string' ? equations.get(id) : undefined;
      if (!math) return <span>{children}</span>;
      const raw = source.slice(math.start, math.end);
      const className = math.display ? 'note-math note-math-block' : 'note-math';
      return editable
        ? <span className={'note-editor-math-atom ' + className} contentEditable={false} data-note-math-source={raw} title={raw}>
            <Tex math={math.math} display={math.display} as="span" fallback={raw} />
          </span>
        : <Tex math={math.math} display={math.display} as="span" fallback={raw} dataSource={raw} className={className} />;
    },
    table({ children }) {
      return <div className="note-markdown-table"><table>{children}</table></div>;
    },
    a({ href, title, children }) {
      return href ? <a href={href} title={title} rel="noreferrer" target="_blank">{children}</a> : <>{children}</>;
    },
    img({ alt }) {
      return alt ? <span>{alt}</span> : null;
    },
  }}>{markdown}</Markdown>;
}

export default NoteMarkdown;

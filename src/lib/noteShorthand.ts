import type { NoteMath } from './noteMath';

interface SourceRange { start: number; end: number }
interface Expression {
  tex: string;
  end: number;
  recognized: boolean;
  namedOperator?: boolean;
}

const maxLength = 2048;
const maxDepth = 12;
const identifier = /[A-Za-zΑ-Ωα-ωℕℤℚℝℂℙ𝔹ℓ][A-Za-zΑ-Ωα-ωℕℤℚℝℂℙ𝔹ℓ0-9]{0,31}/uy;
const number = /\d{1,16}(?:\.\d{1,16})?/y;
const infixRelation = /(?:\d{1,16}|[a-z])([RSTLE])(?:(?:_([A-Za-z0-9])|_\{([A-Za-z0-9,]+)\}|\^?([*+]))[ \t]?([a-z]|\d{1,16})|([a-z]|\d{1,16}))/y;
const adjacentWord = /[\p{L}\p{N}_/\\^]/u;
const canStart = /[A-Za-zΑ-Ωα-ωℕℤℚℝℂℙ𝔹ℓ\d({[|⌊⌈⟨⟦∅∞⊤⊥□¬∼∀∃⊨⊭⊢+\-−]/u;
const standaloneSet = /^[A-Zℕℤℚℝℂℙ𝔹ΣΓΩ{[]/u;
const indexLetters = new Set(['n', 'k', 'm', 'd', 'r', 'p', 'q']);

const symbols: Record<string, string> = {
  '∅': '\\varnothing', '∞': '\\infty', '⊤': '\\top', '⊥': '\\bot', '□': '\\square', 'ℓ': '\\ell',
  'ℕ': '\\mathbb{N}', 'ℤ': '\\mathbb{Z}', 'ℚ': '\\mathbb{Q}', 'ℝ': '\\mathbb{R}',
  'ℂ': '\\mathbb{C}', 'ℙ': '\\mathbb{P}', '𝔹': '\\mathbb{B}',
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\varepsilon', 'ϵ': '\\epsilon',
  'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta', 'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda',
  'μ': '\\mu', 'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau',
  'υ': '\\upsilon', 'φ': '\\varphi', 'ϕ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
  'Γ': '\\Gamma', 'Δ': '\\Delta', 'Θ': '\\Theta', 'Λ': '\\Lambda', 'Ξ': '\\Xi', 'Π': '\\Pi',
  'Σ': '\\Sigma', 'Υ': '\\Upsilon', 'Φ': '\\Phi', 'Ψ': '\\Psi', 'Ω': '\\Omega',
};

const namedOperators: Record<string, string> = {
  gcd: '\\gcd', lcm: '\\operatorname{lcm}',
  deg: '\\deg', indeg: '\\operatorname{indeg}', outdeg: '\\operatorname{outdeg}',
  ord: '\\operatorname{ord}', ker: '\\ker', im: '\\operatorname{im}',
  ar: '\\operatorname{ar}', Aut: '\\operatorname{Aut}', Res: '\\operatorname{Res}',
  ITE: '\\operatorname{ITE}', Id: '\\mathrm{Id}', Pr: '\\Pr',
  max: '\\max', min: '\\min', sup: '\\sup', inf: '\\inf',
  log: '\\log', ln: '\\ln', exp: '\\exp', sin: '\\sin', cos: '\\cos', det: '\\det', dim: '\\dim',
};
const prefixSetOperators = new Set(['max', 'min', 'sup', 'inf']);

const relationSymbols: [string, string][] = [
  ['<==>', '\\iff'], ['<=>', '\\iff'], ['<->', '\\leftrightarrow'],
  ['|->', '\\mapsto'], ['==>', '\\implies'], ['<==', '\\impliedby'],
  ['=>', '\\implies'], ['->', '\\to'],
  [':=', ':='], ['=:', '=:'], ['===', '\\equiv'], ['!==', '\\not\\equiv'],
  ['~=', '\\cong'], ['=~', '\\cong'],
  ['<=', '\\le'], ['>=', '\\ge'], ['!=', '\\ne'], ['==', '='],
  ['≔', ':='], ['≕', '=:'],
  ['≤', '\\le'], ['≥', '\\ge'], ['≠', '\\ne'], ['≈', '\\approx'],
  ['≡', '\\equiv'], ['≢', '\\not\\equiv'], ['≅', '\\cong'], ['≇', '\\ncong'], ['≃', '\\simeq'], ['∼', '\\sim'],
  ['⪯', '\\preceq'], ['≺', '\\prec'], ['⪰', '\\succeq'], ['≻', '\\succ'], ['⊑', '\\sqsubseteq'], ['⊏', '\\sqsubset'],
  ['∈', '\\in'], ['∉', '\\notin'], ['∋', '\\ni'],
  ['⊆', '\\subseteq'], ['⊈', '\\nsubseteq'], ['⊊', '\\subsetneq'], ['⊂', '\\subset'],
  ['⊇', '\\supseteq'], ['⊉', '\\nsupseteq'], ['⊋', '\\supsetneq'], ['⊃', '\\supset'],
  ['↦', '\\mapsto'], ['↪', '\\hookrightarrow'], ['↠', '\\twoheadrightarrow'], ['↣', '\\rightarrowtail'],
  ['→', '\\to'], ['←', '\\leftarrow'], ['↔', '\\leftrightarrow'], ['⇒', '\\implies'], ['⇐', '\\impliedby'], ['⇔', '\\iff'],
  ['⊢', '\\vdash'], ['⊬', '\\nvdash'], ['⊨', '\\models'], ['⊭', '\\not\\models'],
  ['∣', '\\mid'], ['∤', '\\nmid'],
  ['=', '='], ['<', '<'], ['>', '>'],
];
const subscriptableRelations = new Set(['≡', '∼', '~', '⪯', '≺', '⪰', '≻', '≅', '<', '>']);
const relationWords: [string, string][] = [
  ['not in', '\\notin'], ['in', '\\in'],
  ['subseteq', '\\subseteq'], ['nsubseteq', '\\nsubseteq'], ['subsetneq', '\\subsetneq'], ['subset', '\\subset'],
  ['supseteq', '\\supseteq'], ['supsetneq', '\\supsetneq'], ['supset', '\\supset'],
  ['equals', '='], ['implies', '\\implies'], ['iff', '\\iff'],
];
const productOperators: [string, string][] = [
  ['×', '\\times'], ['⋅', '\\cdot'], ['·', '\\cdot'], ['*', '\\cdot'],
  ['∘', '\\circ'], ['∩', '\\cap'], ['∧', '\\land'], ['/\\', '\\land'],
  ['⊓', '\\sqcap'], ['⊗', '\\otimes'], ['⊙', '\\odot'], ['⋈', '\\bowtie'], ['⋆', '\\star'],
];
const sumOperators: [string, string][] = [
  ['+', '+'], ['-', '-'], ['−', '-'], ['⊕', '\\oplus'],
  ['∪', '\\cup'], ['⊎', '\\uplus'], ['∖', '\\setminus'], ['∆', '\\Delta'],
  ['∨', '\\lor'], ['\\/', '\\lor'], ['⊔', '\\sqcup'], ['⋄', '\\diamond'],
];
const sumWords: [string, string][] = [
  ['union', '\\cup'], ['intersection', '\\cap'], ['setminus', '\\setminus'], ['cup', '\\cup'], ['cap', '\\cap'],
];
const exponentComparisons: [string, string][] = [
  ['<=', '\\le '], ['>=', '\\ge '], ['≤', '\\le '], ['≥', '\\ge '], ['<', '< '], ['>', '> '],
];
const moduloWords = ['modulo', 'module', 'mod'];

function closesMarkdownEmphasis(source: string, starIndex: number, owned: readonly SourceRange[]) {
  if (source[starIndex] !== '*') return false;
  const lineStart = source.lastIndexOf('\n', starIndex - 1) + 1;
  const stack: number[] = [];
  let ownedIndex = 0;
  while (ownedIndex < owned.length && owned[ownedIndex].end <= lineStart) ownedIndex++;
  for (let pos = lineStart; pos < starIndex;) {
    while (ownedIndex < owned.length && owned[ownedIndex].end <= pos) ownedIndex++;
    if (ownedIndex < owned.length && pos >= owned[ownedIndex].start) {
      pos = owned[ownedIndex].end;
      continue;
    }
    if (source[pos] === '\\') { pos += 2; continue; }
    if (source[pos] === '\x60') {
      let tickEnd = pos + 1;
      while (tickEnd < starIndex && source[tickEnd] === '\x60') tickEnd++;
      const ticks = source.slice(pos, tickEnd);
      const close = source.indexOf(ticks, tickEnd);
      pos = close >= 0 && close < starIndex ? close + ticks.length : tickEnd;
      continue;
    }
    if (source[pos] !== '*') { pos++; continue; }
    let end = pos + 1;
    while (end < starIndex && source[end] === '*') end++;
    const len = end - pos;
    const before = pos > lineStart ? source[pos - 1] : ' ';
    const after = source[end] ?? ' ';
    const beforeSpace = /\s/u.test(before);
    const beforePunct = /[\p{P}\p{S}]/u.test(before);
    const afterSpace = /\s/u.test(after);
    const afterPunct = /[\p{P}\p{S}]/u.test(after);
    const canOpen = !afterSpace && (!afterPunct || beforeSpace || beforePunct);
    const canClose = !beforeSpace && (!beforePunct || afterSpace || afterPunct);
    let matched = -1;
    if (canClose) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === len || (stack[i] === 3 && len < 3)) { matched = i; break; }
      }
    }
    if (matched >= 0) {
      const remaining = stack[matched] - len;
      stack.length = matched;
      if (remaining > 0) stack.push(remaining);
    } else if (canOpen) {
      stack.push(len);
    }
    pos = end;
  }
  return stack.some((len) => len % 2 === 1);
}

function literalRanges(source: string): SourceRange[] {
  const ranges: SourceRange[] = [];
  const definedRefs = new Set<string>();
  for (const ref of source.matchAll(/^ {0,3}\[([^\]\r\n]+)\]:[ \t]*\S/gm)) {
    definedRefs.add(ref[1].toLowerCase());
    ranges.push({ start: ref.index, end: ref.index + ref[1].length + 3 });
  }
  let fence: { marker: string; length: number; start: number } | undefined;
  let previousLine: { text: string; start: number } | undefined;
  let insideTable = false;
  const separator = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$/u;
  const protectPipes = (text: string, start: number) => {
    for (const pipe of text.matchAll(/(?<!\\)\|/g)) ranges.push({ start: start + pipe.index, end: start + pipe.index + 1 });
  };
  for (const line of source.matchAll(/^[^\r\n]*(?:\r?\n|$)/gm)) {
    if (!line[0]) continue;
    const end = line.index + line[0].length;
    const text = line[0].trimEnd();
    // In a GFM table, field separators are Markdown syntax. Explicit TeX can still
    // use pipe characters inside a cell because those ranges are already owned.
    if (previousLine?.text.includes('|') && separator.test(text)) {
      protectPipes(previousLine.text, previousLine.start);
      protectPipes(text, line.index);
      insideTable = true;
    } else if (insideTable && text.includes('|')) {
      protectPipes(text, line.index);
    } else insideTable = false;
    previousLine = { text, start: line.index };
    const marker = /^(?: {0,3}>[ \t]?)* {0,3}(\x60{3,}|~{3,})([^\r\n]*)/.exec(line[0]);
    if (fence && marker?.[1][0] === fence.marker && marker[1].length >= fence.length && !marker[2].trim()) {
      ranges.push({ start: fence.start, end });
      fence = undefined;
      continue;
    }
    if (fence) continue;
    if (marker) {
      fence = { marker: marker[1][0], length: marker[1].length, start: line.index };
      continue;
    }
    // Indented code at a block boundary stays literal. List continuation lines keep their math.
    if (/^(?:\t| {4})\S/u.test(line[0]) && (line.index === 0 || /\r?\n[ \t]*\r?\n$/u.test(source.slice(Math.max(0, line.index - 80), line.index)))) {
      ranges.push({ start: line.index, end });
      continue;
    }
    // Protect GFM task list checkboxes such as "- [x] item" and "- [X] item".
    const checkbox = /^(?: {0,3}>[ \t]?)* {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+(\[[ xX]\])(?=[ \t])/u.exec(line[0]);
    if (checkbox) {
      const boxStart = line.index + checkbox[0].length - checkbox[1].length;
      ranges.push({ start: boxStart, end: boxStart + checkbox[1].length });
    }
    let inlineStart = -1;
    let tickCount = 0;
    for (const run of line[0].matchAll(/\x60+/g)) {
      if (inlineStart < 0) {
        inlineStart = line.index + run.index;
        tickCount = run[0].length;
      } else if (run[0].length === tickCount) {
        ranges.push({ start: inlineStart, end: line.index + run.index + tickCount });
        inlineStart = -1;
      }
    }
    if (inlineStart >= 0) ranges.push({ start: inlineStart, end });
  }
  if (fence) ranges.push({ start: fence.start, end: source.length });

  // Protect Markdown reference links and footnotes alongside URLs, link targets, HTML tags, and dates.
  for (const refUse of source.matchAll(/\[(\^[^\]\r\n]+|[^\]\r\n]+)\]/g)) {
    const label = refUse[1];
    if (label.startsWith('^') || definedRefs.has(label.toLowerCase())) {
      ranges.push({ start: refUse.index, end: refUse.index + refUse[0].length });
    }
  }
  const literalSpans = /(?:https?:\/\/|www\.)[^\s<>()]+|(?<=\]\()[^()\r\n]+(?=\))|<[A-Za-z/!][^<>]*>|\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b|(?<=\b(?:on|dated|due|date|until|since)[ \t]+)\d{1,2}\/\d{1,2}\b/gi;
  for (const span of source.matchAll(literalSpans)) ranges.push({ start: span.index, end: span.index + span[0].length });
  return ranges;
}

const pairedDelimiters: Record<string, [string, string, string]> = {
  '⌊': ['⌋', '\\lfloor ', ' \\rfloor'],
  '⌈': ['⌉', '\\lceil ', ' \\rceil'],
  '⟨': ['⟩', '\\langle ', ' \\rangle'],
  '⟦': ['⟧', '\\llbracket ', ' \\rrbracket'],
};

function matchInfixRelation(source: string, at: number, limit: number): Expression | null {
  infixRelation.lastIndex = at;
  const m = infixRelation.exec(source);
  if (!m) return null;
  const raw = m[0];
  const end = at + raw.length;
  if (end > limit || adjacentWord.test(source[end] ?? '')) return null;
  const rel = m[1];
  const sub = m[2] ?? m[3];
  const closure = m[4];
  const rhs = m[5] ?? m[6];
  const relIndex = raw.indexOf(rel);
  const lhs = raw.slice(0, relIndex);
  const relTex = sub ? rel + '_{' + sub + '}' : closure ? rel + '^{' + closure + '}' : rel;
  return { tex: lhs + '\\mathrel{' + relTex + '}' + rhs, end, recognized: true };
}

function readExpression(source: string, start: number, end: number, owned: readonly SourceRange[] = [], insideBars = false): Expression | null {
  const limit = Math.min(end, start + maxLength);
  const char = (at: number) => at < limit ? source[at] : '';
  const ready = (at: number, text: string) => at + text.length <= limit && source.startsWith(text, at);
  const spaces = (at: number, multiline = false) => {
    while (at < limit && (source[at] === ' ' || source[at] === '\t' || (multiline && /[\r\n]/u.test(source[at])))) at++;
    return at;
  };
  const word = (at: number, spelling: string) =>
    /\s/u.test(source[at - 1] ?? '') && ready(at, spelling) && /[ \t]/u.test(char(at + spelling.length));
  const signAt = (at: number) => /^[+\-−]$/.test(char(at)) ? char(at).replace('−', '-') : '';
  const combine = (left: Expression, op: string, right: Expression): Expression =>
    ({ tex: left.tex + ' ' + op + ' ' + right.tex, end: right.end, recognized: true });

  function commaList(at: number, close: string, depth: number, names: boolean, multiline: boolean): { items: Expression[]; next: number } | null {
    const items: Expression[] = [];
    let next = spaces(at, multiline);
    if (char(next) !== close) {
      while (next < limit) {
        const item = expression(next, depth + 1, names);
        if (!item) return null;
        items.push(item);
        next = spaces(item.end, multiline);
        if (char(next) !== ',') break;
        next = spaces(next + 1, multiline);
      }
    }
    return { items, next };
  }

  function atom(at: number, depth: number, names: boolean): Expression | null {
    if (depth > maxDepth) return null;
    const first = char(at);
    if (first === '{' || first === '(') {
      const close = first === '{' ? '}' : ')';
      const parsedList = commaList(at + 1, close, depth, names || first === '{', true);
      if (!parsedList) return null;
      const { items, next } = parsedList;
      if (first === '{' && items.length === 1 && (char(next) === '|' || char(next) === '∣')) {
        const condition = expression(spaces(next + 1, true), depth + 1, false);
        if (!condition || char(spaces(condition.end, true)) !== close) return null;
        return {
          tex: '\\{' + items[0].tex + ' \\mid ' + condition.tex + '\\}',
          end: spaces(condition.end, true) + 1,
          recognized: true,
        };
      }
      if (char(next) !== close || (!items.length && first === '(')) return null;
      const contents = items.map((item) => item.tex).join(',');
      if (first === '{') return { tex: '\\{' + contents + '\\}', end: next + 1, recognized: true };
      return {
        tex: '(' + contents + ')', end: next + 1,
        recognized: items.length > 1 || items[0].recognized,
      };
    }
    if (first === '[') {
      const innerStart = spaces(at + 1);
      const inner = expression(innerStart, depth + 1, false);
      const close = inner ? spaces(inner.end) : -1;
      if (!inner || char(close) !== ']') return null;
      const afterClose = char(close + 1);
      if (afterClose === '(' || afterClose === '[' || afterClose === ':') return null;
      const rawInner = source.slice(innerStart, inner.end).trim();
      const isIndexSet = /^\d{1,6}$/.test(rawInner) || indexLetters.has(rawInner);
      return {
        tex: '[' + inner.tex + ']',
        end: close + 1,
        recognized: isIndexSet || afterClose === '_',
      };
    }
    const paired = pairedDelimiters[first];
    if (paired) {
      const inner = expression(spaces(at + 1), depth + 1, names);
      const close = inner ? spaces(inner.end) : -1;
      if (!inner || char(close) !== paired[0]) return null;
      return { tex: paired[1] + inner.tex + paired[2], end: close + 1, recognized: true };
    }
    if (first === '|' && !insideBars && !/\s/u.test(char(at + 1))) {
      // Compact cardinality notation is distinct from spaced Markdown table boundaries.
      const inner = readExpression(source, at + 1, limit, owned, true);
      if (inner && char(inner.end) === '|' && !/\s/u.test(source[inner.end - 1] ?? '')) {
        return { tex: '\\lvert ' + inner.tex + '\\rvert', end: inner.end + 1, recognized: true };
      }
      return null;
    }
    if (first === '∅' || first === '∞' || first === '⊤' || first === '⊥' || first === '□') {
      return { tex: symbols[first], end: at + 1, recognized: true };
    }
    number.lastIndex = at;
    const digits = number.exec(source)?.[0];
    if (digits && at + digits.length <= limit && !/[\p{L}\p{N}]/u.test(source[at + digits.length] ?? '')) {
      return { tex: digits, end: at + digits.length, recognized: false };
    }
    identifier.lastIndex = at;
    const name = identifier.exec(source)?.[0];
    if (!name || at + name.length > limit || /[\p{L}\p{N}]/u.test(source[at + name.length] ?? '')) return null;
    if (name in symbols) return { tex: symbols[name], end: at + name.length, recognized: true };
    if (name in namedOperators) return { tex: namedOperators[name], end: at + name.length, recognized: false, namedOperator: true };
    if (!names && name.length !== 1) return null;
    return { tex: name.length > 1 ? '\\mathrm{' + name + '}' : name, end: at + name.length, recognized: false };
  }

  function readExponentBody(at: number, depth: number, names: boolean): { tex: string; end: number } | null {
    const cmp = exponentComparisons.find(([raw]) => ready(at, raw));
    if (cmp) {
      const bound = terms(spaces(at + cmp[0].length), depth + 1, names);
      return bound ? { tex: cmp[1] + bound.tex, end: bound.end } : null;
    }
    const list = commaList(at, '', depth, names, true);
    if (!list?.items.length) return null;
    return { tex: list.items.map((item) => item.tex).join(','), end: list.items.at(-1)!.end };
  }

  function readShortSubscript(at: number, depth: number, names: boolean): { tex: string; end: number } | null {
    if (char(at) === '{' || char(at) === '(') {
      const close = char(at) === '{' ? '}' : ')';
      const body = readExponentBody(spaces(at + 1, true), depth, true);
      const closeAt = body ? spaces(body.end, true) : -1;
      return body && char(closeAt) === close ? { tex: body.tex, end: closeAt + 1 } : null;
    }
    if (char(at) === '~' || char(at) === '∼') return { tex: '\\sim', end: at + 1 };
    if (char(at) === '≡') return { tex: '\\equiv', end: at + 1 };
    if (char(at) === '⊥') return { tex: '\\bot', end: at + 1 };
    const subSign = signAt(at);
    const subAtom = atom(subSign ? at + 1 : at, depth + 1, true);
    return subAtom ? { tex: subSign + subAtom.tex, end: subAtom.end } : null;
  }

  function power(at: number, depth: number, names: boolean): Expression | null {
    if (depth > maxDepth) return null;
    if (char(at) === '¬' || char(at) === '∼') {
      const unaryOp = char(at) === '¬' ? '\\neg ' : '\\sim ';
      const operand = power(spaces(at + 1), depth + 1, names);
      return operand ? { tex: unaryOp + operand.tex, end: operand.end, recognized: true } : null;
    }
    const sign = signAt(at);
    const baseStart = sign ? at + 1 : at;
    const base = atom(baseStart, depth, names);
    if (!base) return null;
    const rawBase = source.slice(baseStart, base.end);
    const numericBase = /^\d/.test(rawBase);
    const callableBase = Boolean(base.namedOperator) || (!numericBase && [...rawBase].length === 1 && /[\p{L}]/u.test(rawBase));
    let result: Expression = { ...base, tex: sign + base.tex };
    const used = new Set<string>();

    while (result.end <= limit) {
      // Prime notation such as A', G', V', L', f'(x), excluding contractions like I'm or A's.
      if (char(result.end) === "'") {
        let quoteEnd = result.end + 1;
        while (char(quoteEnd) === "'") quoteEnd++;
        if (!/[\p{L}\p{N}]/u.test(char(quoteEnd))) {
          result = { tex: result.tex + source.slice(result.end, quoteEnd), end: quoteEnd, recognized: true, namedOperator: result.namedOperator };
          continue;
        }
      }

      // Direct postfix closure / Kleene star / positive closure / unit group: E*, E+, Σ*, {0,1}*, (A ∪ B)+, Z_n*, Res*(K).
      const adjacent = char(result.end);
      if (!numericBase && !used.has('^') && (adjacent === '*' || adjacent === '+')) {
        const after = char(result.end + 1);
        const allowCallAfterStar = adjacent === '*' && result.namedOperator && after === '(';
        const blockedFollow = /[\p{L}\p{N}_{|]/u.test(after) || (after === '(' && !allowCallAfterStar);
        const validStar = adjacent === '*' && after !== '*' && !blockedFollow && !closesMarkdownEmphasis(source, result.end, owned);
        const validPlus = adjacent === '+' && after !== '+' && !blockedFollow;
        if (validStar || validPlus) {
          used.add('^');
          result = { tex: result.tex + '^{' + adjacent + '}', end: result.end + 1, recognized: true, namedOperator: result.namedOperator };
          continue;
        }
      }

      // Function / predicate / operator calls f(x), P(x, y), gcd(a, b), f^-1(Y), Res*(K) and bracketed G[U], Pr[A].
      if (callableBase && char(result.end) === '(') {
        const parsedArgs = commaList(result.end + 1, ')', depth, false, false);
        if (parsedArgs && parsedArgs.items.length > 0 && char(parsedArgs.next) === ')') {
          const closeEnd = parsedArgs.next + 1;
          const callRaw = source.slice(baseStart, closeEnd);
          if (!(callRaw === 'a(n)' && /^[ \t]+[a-z]/u.test(source.slice(closeEnd, limit)))) {
            result = {
              tex: result.tex + '(' + parsedArgs.items.map((item) => item.tex).join(',') + ')',
              end: closeEnd,
              recognized: true,
            };
            continue;
          }
        }
      }
      if ((rawBase === 'Pr' || /^[A-Z]$/.test(rawBase)) && char(result.end) === '[') {
        const subStart = spaces(result.end + 1);
        const subExpr = expression(subStart, depth + 1, false);
        const closeAt = subExpr ? spaces(subExpr.end) : -1;
        const afterClose = closeAt >= 0 ? char(closeAt + 1) : '';
        if (subExpr && char(closeAt) === ']' && afterClose !== '(' && afterClose !== '[' && afterClose !== ':') {
          result = { tex: result.tex + '[' + subExpr.tex + ']', end: closeAt + 1, recognized: true };
          continue;
        }
      }

      // Factorial n!, (n - k)!, 42!/19! while leaving != and prose headings ("Step 3!") intact.
      if (char(result.end) === '!' && char(result.end + 1) !== '=' && char(result.end + 1) !== '!') {
        const parenBase = rawBase.startsWith('(');
        const varFactorial = /^[b-z]$/.test(rawBase);
        const precededByLabel = /\b(?:step|chapter|part|sheet|problem|exercise|page|item|case)[ \t]+$/iu.test(source.slice(Math.max(0, at - 20), at));
        const numFactorial = numericBase && !precededByLabel;
        if ((parenBase || varFactorial || numFactorial) && !used.has('^') && !used.has('_')) {
          result = { tex: result.tex + '!', end: result.end + 1, recognized: true };
          continue;
        }
      }

      const cursor = spaces(result.end);
      const operator = char(cursor);
      if ((operator === '^' || operator === '_') && !used.has(operator)) {
        const next = spaces(cursor + 1);
        let suffixEnd = -1;
        let suffixTex = '';
        if (char(next) === '{' || char(next) === '(') {
          const close = char(next) === '{' ? '}' : ')';
          const body = readExponentBody(spaces(next + 1, true), depth, operator === '_' ? true : names);
          const closeAt = body ? spaces(body.end, true) : -1;
          if (body && char(closeAt) === close) {
            suffixEnd = closeAt + 1;
            suffixTex = body.tex;
          }
        } else if (operator === '^') {
          const cmp = exponentComparisons.find(([raw]) => ready(next, raw));
          if (cmp) {
            const bound = atom(spaces(next + cmp[0].length), depth + 1, names);
            if (bound) {
              suffixEnd = bound.end;
              suffixTex = cmp[1] + bound.tex;
            }
          } else if (!numericBase && /^[*+]$/.test(char(next))) {
            suffixEnd = next + 1;
            suffixTex = char(next);
          } else {
            const suffixSign = signAt(next);
            const suffix = atom(suffixSign ? next + 1 : next, depth + 1, names);
            if (suffix) {
              suffixEnd = suffix.end;
              suffixTex = suffixSign + suffix.tex;
            }
          }
        } else {
          const shortSub = readShortSubscript(next, depth, names);
          if (shortSub) {
            suffixEnd = shortSub.end;
            suffixTex = shortSub.tex;
          }
        }
        if (suffixEnd > 0) {
          used.add(operator);
          result = {
            tex: result.tex + operator + '{' + suffixTex + '}',
            end: suffixEnd,
            recognized: true,
            namedOperator: result.namedOperator,
          };
          continue;
        }
      }

      // Prefix operators with subscripts/sets such as sup_R X, max_R X, log_2 n, sup {a, b}.
      if (result.namedOperator && (used.size > 0 || prefixSetOperators.has(rawBase)) && cursor > result.end) {
        const arg = power(cursor, depth + 1, names);
        if (arg && (used.size > 0 || char(cursor) === '{')) {
          result = { tex: result.tex + ' ' + arg.tex, end: arg.end, recognized: true };
          continue;
        }
      }
      break;
    }
    return result;
  }

  function product(at: number, depth: number, names: boolean): Expression | null {
    let result = power(at, depth, names);
    if (!result) return null;
    while (result.end < limit) {
      const cursor = spaces(result.end);
      if (char(cursor) === '/' && char(cursor + 1) !== '\\') {
        const rightStart = spaces(cursor + 1);
        if (char(rightStart) === '~' || char(rightStart) === '∼') {
          if (char(rightStart + 1) === '~') break;
          result = { tex: result.tex + ' / {\\sim}', end: rightStart + 1, recognized: true };
          continue;
        }
        const right = power(rightStart, depth, names);
        if (!right || char(spaces(right.end)) === '/') break;
        const a = source.slice(at, result.end);
        const b = source.slice(rightStart, right.end);
        if ((/^(?:19|20)\d{2}$/.test(a) && /^(?:0?[1-9]|1[0-2])$/.test(b))
          || (/^\d{1,2}$/.test(a) && /^(?:19|20)\d{2}$/.test(b))) break;
        result = { tex: '\\frac{' + result.tex + '}{' + right.tex + '}', end: right.end, recognized: true };
        continue;
      }
      const operator = productOperators.find(([raw]) => ready(cursor, raw));
      if (!operator) break;
      let opEnd = cursor + operator[0].length;
      let opTex = operator[1];
      if ((operator[0] === '⋅' || operator[0] === '·') && char(opEnd) === '_') {
        const sub = readShortSubscript(opEnd + 1, depth, names);
        if (sub) { opTex += '_{' + sub.tex + '}'; opEnd = sub.end; }
      }
      const rightStart = spaces(opEnd);
      if (operator[0] === '*' && (cursor > result.end) !== (rightStart > opEnd)) break;
      const right = power(rightStart, depth, names);
      if (!right) break;
      // A trailing asterisk can close Markdown emphasis, as in 2 *x* or x*y*.
      if (operator[0] === '*' && char(right.end) === '*' && char(right.end + 1) !== '*'
        && !canStart.test(char(spaces(right.end + 1)))) break;
      result = combine(result, opTex, right);
    }
    return result;
  }

  function terms(at: number, depth: number, names: boolean): Expression | null {
    let result = product(at, depth, names);
    if (!result) return null;
    while (result.end < limit) {
      const cursor = spaces(result.end);
      const wordOp = sumWords.find(([raw]) => word(cursor, raw));
      const symbolOp = wordOp ? undefined : sumOperators.find(([raw]) => ready(cursor, raw));
      const operator = wordOp ?? symbolOp;
      if (!operator || ready(cursor, '->')) break;
      let opEnd = cursor + operator[0].length;
      let opTex = operator[1];
      if (!wordOp && (operator[0] === '+' || operator[0] === '-' || operator[0] === '−') && char(opEnd) === '_') {
        const sub = readShortSubscript(opEnd + 1, depth, names);
        if (sub) { opTex += '_{' + sub.tex + '}'; opEnd = sub.end; }
      }
      const right = product(spaces(opEnd), depth, names);
      if (!right) break;
      result = combine(result, opTex, right);
    }
    return result;
  }

  function expression(at: number, depth: number, names: boolean): Expression | null {
    if (depth > maxDepth) return null;
    const lead = char(at);
    if (lead === '∀' || lead === '∃') {
      const quant = lead === '∀' ? '\\forall ' : '\\exists ';
      const body = expression(spaces(at + 1), depth + 1, names);
      return body ? { tex: quant + body.tex, end: body.end, recognized: true } : null;
    }
    if (lead === '⊨' || lead === '⊭' || lead === '⊢') {
      const turnstile = lead === '⊨' ? '\\models ' : lead === '⊭' ? '\\not\\models ' : '\\vdash ';
      const claim = expression(spaces(at + 1), depth + 1, names);
      return claim ? { tex: turnstile + claim.tex, end: claim.end, recognized: true } : null;
    }

    const infix = matchInfixRelation(source, at, limit);
    if (infix) return infix;

    let result = terms(at, depth, names);
    if (!result) return null;

    // Function signature shorthand such as f: A -> B or β: V' -> {0,1}.
    const colonAt = spaces(result.end);
    if (depth === 0 && !insideBars && char(colonAt) === ':' && char(colonAt + 1) !== '=') {
      const rawFn = source.slice(at, result.end).trim();
      if (/^(?:[A-Za-zΑ-Ωα-ω](?:_\{?[^}\s]+\}?|')*)$/u.test(rawFn)) {
        const mapping = expression(spaces(colonAt + 1), depth + 1, names);
        if (mapping?.recognized && /\\(?:to|mapsto|hookrightarrow|twoheadrightarrow|rightarrowtail)\b/.test(mapping.tex)) {
          return { tex: result.tex + ': ' + mapping.tex, end: mapping.end, recognized: true };
        }
      }
    }

    let congruence = false;
    while (result.end < limit) {
      const cursor = spaces(result.end);
      if (insideBars && char(cursor) === '|') break;
      const modulo = moduloWords.find((candidate) => word(cursor, candidate));
      if (modulo) {
        const right = power(spaces(cursor + modulo.length), depth, names);
        if (!right) break;
        result = congruence
          ? { tex: result.tex + '\\pmod{' + right.tex + '}', end: right.end, recognized: true }
          : combine(result, '\\bmod', right);
        continue;
      }
      let operator: [string, string] | undefined = relationSymbols.find(([raw]) => ready(cursor, raw));
      if (!operator && char(cursor) === '~' && source[cursor - 1] !== '~' && char(cursor + 1) !== '~') {
        operator = ['~', '\\sim'];
      }
      operator ??= relationWords.find(([raw]) => word(cursor, raw));
      if (!operator) break;
      let opEnd = cursor + operator[0].length;
      let opTex = operator[1];
      if (subscriptableRelations.has(operator[0]) && char(opEnd) === '_') {
        const sub = readShortSubscript(opEnd + 1, depth, names);
        if (sub) { opTex += '_{' + sub.tex + '}'; opEnd = sub.end; }
      }
      const rightStart = spaces(opEnd);
      const right = terms(rightStart, depth, names);
      if (!right) break;
      if ((operator[0] === 'in' || operator[0] === 'not in')
        && !standaloneSet.test(char(rightStart)) && !right.recognized) break;
      congruence ||= operator[1] === '\\equiv';
      result = combine(result, opTex, right);
    }
    return result;
  }

  const modulo = moduloWords.find((candidate) => ready(start, candidate) && /[ \t]/u.test(char(start + candidate.length)));
  if (modulo) {
    const modulus = power(spaces(start + modulo.length), 0, false);
    if (modulus && /^\d/u.test(modulus.tex)) {
      return { tex: '\\bmod ' + modulus.tex, end: modulus.end, recognized: true };
    }
  }
  return expression(start, 0, false);
}

function canPromoteStandaloneUppercase(source: string, start: number, end: number, limit: number) {
  if (end !== start + 1 || !/^[A-Z]$/.test(source[start])) return false;
  const next = source[end] ?? '';
  const afterNext = source[end + 1] ?? '';
  // Leave abbreviations (U.S.), contractions/possessives (I'm, A's), C++, and unfinished definitions (A = {1,2) literal.
  if (next === '.' && /\p{L}/u.test(afterNext)) return false;
  if ((next === "'" || next === '’') && /\p{L}/u.test(afterNext)) return false;
  if (next === '+' && afterNext === '+') return false;
  if (/^[ \t]*:?=[ \t]*(?:$|[{([]|\r|\n)/u.test(source.slice(end, limit))) return false;
  return true;
}

/** Recognize complete mathematical shorthand while leaving source offsets and prose intact. */
export function findNoteShorthand(source: string, excluded: readonly SourceRange[] = []): NoteMath[] {
  const ranges = [...excluded, ...literalRanges(source)].sort((a, b) => a.start - b.start);
  const result: NoteMath[] = [];
  let rangeIndex = 0;
  for (let start = 0; start < source.length;) {
    while (ranges[rangeIndex]?.end <= start) rangeIndex++;
    const blocked = ranges[rangeIndex];
    if (blocked && start >= blocked.start) {
      start = blocked.end;
      continue;
    }
    const previous = source[start - 1] ?? '';
    if (!canStart.test(source[start]) || adjacentWord.test(previous)
      || (previous === '.' && /\w/u.test(source[start - 2] ?? ''))) {
      start++;
      continue;
    }
    const limit = blocked?.start ?? source.length;
    const infix = matchInfixRelation(source, start, limit);
    if (infix) {
      result.push({ start, end: infix.end, math: infix.tex, display: false });
      start = infix.end;
      continue;
    }
    let parsed = readExpression(source, start, limit, result);
    if (parsed && !parsed.recognized && canPromoteStandaloneUppercase(source, start, parsed.end, limit)) {
      parsed = { ...parsed, recognized: true };
    }
    if (parsed?.recognized && !adjacentWord.test(source[parsed.end] ?? '')) {
      result.push({ start, end: parsed.end, math: parsed.tex, display: false });
      start = parsed.end;
    } else start++;
  }
  return result;
}

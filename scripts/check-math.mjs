import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import katex from 'katex';

// Validate the actual JSX literals and dictionary values, including hidden solutions.
// Rendering checks complement the mathematical review against the supplied PDFs.
let checked = 0;
const failures = [];
function check(math, location) {
  checked++;
  try {
    assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/u.test(math), 'Damaged string escape or character');
    katex.renderToString(math, { throwOnError: true, strict: 'error' });
  } catch (error) {
    failures.push(`${location}: ${math}\n  ${error.message}`);
  }
}

const courseTextModule = ts.transpileModule(readFileSync('src/lib/courseText.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { parseCourseText, splitCourseInline } = await import(
  `data:text/javascript;base64,${Buffer.from(courseTextModule).toString('base64')}`
);
function checkInline(text, path) {
  splitCourseInline(text).forEach((token, index) => {
    if (index % 2 === 0) {
      if (/(?<!\\)\$/.test(token)) failures.push(`${path}: unclosed inline math in ${text}`);
    } else if (token.startsWith('$')) check(token.slice(1, -1), path);
    else if (token.startsWith('*')) {
      const width = token.startsWith('**') ? 2 : 1;
      checkInline(token.slice(width, -width), path);
    }
  });
}
function checkBlocks(blocks, path) {
  for (const block of blocks) {
    switch (block.kind) {
      case 'math': check(block.text, path); break;
      case 'paragraph': case 'heading': case 'quote': checkInline(block.text, path); break;
      case 'list': block.items.forEach((text) => checkInline(text, path)); break;
      case 'table':
        if (block.rows.some((row) => row.length !== block.rows[0].length)) failures.push(`${path}: uneven column counts in table ${block.rows[0].join(' | ')}`);
        block.rows.flat().forEach((text) => checkInline(text, path));
        break;
      case 'practice':
        checkInline(block.title, path);
        checkBlocks(block.prompt, path);
        checkBlocks(block.answer, path);
        break;
      case 'manim': checkBlocks(block.caption, path); break;
    }
  }
}
for (const file of readdirSync('src/chapters', { recursive: true }).filter((name) => name.endsWith('.md'))) {
  const path = `src/chapters/${file}`;
  try { checkBlocks(parseCourseText(readFileSync(path, 'utf8')), path); }
  catch (error) { failures.push(`${path}: ${error.message}`); }
}

for (const file of readdirSync('src', { recursive: true }).filter((name) => name.endsWith('.tsx'))) {
  const path = `src/${file}`;
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxAttribute(node) && ['math', 'titleTex'].includes(node.name.text) && node.initializer) {
      let value = node.initializer;
      if (ts.isJsxExpression(value)) value = value.expression;
      const location = `${path}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
      if (value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) {
        check(value.text, location);
      } else if (value && ts.isTaggedTemplateExpression(value) && value.tag.getText(source) === 'String.raw'
        && ts.isNoSubstitutionTemplateLiteral(value.template)) {
        check(value.template.rawText ?? value.template.text, location);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

// The notation data has no runtime imports, so it can be evaluated without a build artifact.
const dictionaryModule = ts.transpileModule(readFileSync('src/data/notation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { GLOBAL_SYMBOL_DICTIONARY: dictionary, NOTATION_SECTIONS: sections } = await import(
  `data:text/javascript;base64,${Buffer.from(dictionaryModule).toString('base64')}`
);
for (const entry of dictionary) {
  assert(entry.part && entry.name && entry.meaning, 'Missing dictionary field');
  check(entry.tex, entry.name);
  const segments = entry.meaning.split('$');
  assert(segments.length % 2 === 1, `Unclosed math delimiter in ${entry.name}`);
  for (let i = 1; i < segments.length; i += 2) check(segments[i], entry.name);
}

assert.equal(new Set(dictionary.map((entry) => entry.id)).size, dictionary.length, 'Duplicate notation IDs');
assert.equal(new Set(dictionary.map((entry) => entry.part)).size, 5, 'Missing a course part');
for (const section of sections) {
  assert(dictionary.some((entry) => entry.topic === section.id), `Empty notation group: ${section.title}`);
}
for (const entry of dictionary) {
  assert(sections.some((section) => section.id === entry.topic && section.part === entry.part), `Unclassified entry: ${entry.id}`);
  assert(Array.isArray(entry.aliases), `Missing search aliases: ${entry.id}`);
}

const sourceAuditModule = ts.transpileModule(readFileSync('src/data/notationSources.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { NOTATION_SOURCE_AUDIT: sourceAudit, AUDITED_NOTATION_IDS: auditedIds, NOTATION_OMISSIONS: omissions } = await import(
  `data:text/javascript;base64,${Buffer.from(sourceAuditModule).toString('base64')}`
);
const coveredIds = dictionary.flatMap((entry) => [entry.id, ...(entry.covers ?? [])]);
assert.equal(new Set(coveredIds).size, coveredIds.length, 'Repeated coverage mapping');
for (const omission of omissions) assert(omission.ids.length && omission.reason, 'Unexplained notation exclusion');
const reviewedIds = [...coveredIds, ...omissions.flatMap((omission) => omission.ids)];
assert.equal(new Set(reviewedIds).size, reviewedIds.length, 'A notation variant was both retained and excluded');
assert.deepEqual([...reviewedIds].sort(), [...auditedIds].sort(), 'Unreviewed notation change');
const entryFor = (id) => dictionary.find((entry) => entry.id === id || entry.covers?.includes(id));
assert.deepEqual(Object.keys(sourceAudit).sort(), sections.map((section) => section.id).sort(), 'Unmapped notation group');
const hasLocalSources = existsSync('data');
for (const section of sections) {
  const source = sourceAudit[section.id];
  assert.equal(`Part ${source.part}`, section.part, `Incorrect source part: ${section.id}`);
  for (const location of [source, ...(source.additionalSources ?? [])]) {
    assert(location.pdfPages && location.file, `Missing source reference: ${section.id}`);
    if (hasLocalSources) assert(existsSync(location.file), `Missing local source: ${section.id}`);
  }
}

// Keep the formerly missing set operations, and distinct meanings of overloaded symbols.
const required = [
  'I.sets.union', 'I.sets.intersection', 'I.sets.big-union', 'I.sets.finite-union',
  'I.sets.family-union', 'I.sets.big-intersection', 'I.sets.family-intersection',
  'I.sets.disjoint-union', 'I.sets.complement', 'I.sets.difference', 'I.sets.symmetric-difference',
  'I.functions.preimage', 'I.functions.inverse', 'I.words.all-words', 'I.relations.star-closure',
  'III.invariants.neighbourhood', 'III.families.cartesian-product', 'IV.subgroups.cayley',
  'IV.groups.group-exponent', 'IV.modular.carmichael', 'V.boolean.join',
  'V.connectives.big-and', 'V.connectives.big-or', 'V.normal.literal-complement',
  'V.clauses.empty-clause', 'V.fol-semantics.update', 'V.herbrand.expansion',
];
for (const id of required) assert(entryFor(id), `Missing reviewed notation: ${id}`);

// Logic slides, PDF p. 89: empty clause set vs. the set containing the empty clause.
assert.equal(dictionary.find((entry) => entry.name === 'empty clause set, set containing the empty clause')?.tex.replace(/\s/g, ''),
  '\\emptyset\\quad\\text{vs.}\\quad\\{\\emptyset\\}');

const searchModule = ts.transpileModule(readFileSync('src/data/notationSearch.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { matchesNotation } = await import(`data:text/javascript;base64,${Buffer.from(searchModule).toString('base64')}`);
for (const [query, id] of [
  ['∪', 'I.sets.union'], ['big U', 'I.sets.big-union'], ['∩', 'I.sets.intersection'],
  ['⋂', 'I.sets.big-intersection'], ['upside-down U', 'I.sets.intersection'],
  ['Γ', 'III.invariants.neighbourhood'], ['Γ', 'IV.subgroups.cayley'],
  ['⊢', 'I.reading.derivation'], ['⪯', 'I.words.word-suffix'],
  ['preimage', 'I.functions.preimage'], ['empty clause', 'V.clauses.empty-clause'],
]) {
  assert(matchesNotation(entryFor(id), query), `Cannot find ${id} using ${query}`);
}
assert(!matchesNotation(entryFor('I.sets.ambiguous-subset'), 'big U'),
  'Short search terms must not match inside unrelated words');
for (const query of ['Fibonacci', 'BFS', 'NP-complete', 'DPLL']) {
  assert(!dictionary.some((entry) => matchesNotation(entry, query)), `Removed glossary material still appears in symbol searches: ${query}`);
}

if (failures.length) {
  console.error(failures.join('\n\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${checked} static mathematical expressions, ${dictionary.length} dictionary rows, ${reviewedIds.length} reviewed retain/exclude decisions, and symbol searches.`);
}

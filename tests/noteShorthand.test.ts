import { describe, expect, it } from 'vitest';
import { findNoteMath } from '../src/lib/noteMath';
import { findNoteShorthand } from '../src/lib/noteShorthand';

const format = (source: string) => findNoteShorthand(source).map(({ start, end, math }) => [source.slice(start, end), math]);

describe('note shorthand', () => {
  it('recognizes relation names, infix pairs and closure notation in prose', () => {
    expect(format('Let R be transitive. Then aRb, (aR_sb), (aR_s b), and 1R2 belong to R^* and S^+.')).toEqual([
      ['R', 'R'],
      ['aRb', 'a\\mathrel{R}b'],
      ['(aR_sb)', '(a\\mathrel{R_{s}}b)'],
      ['(aR_s b)', '(a\\mathrel{R_{s}}b)'],
      ['1R2', '1\\mathrel{R}2'],
      ['R^*', 'R^{*}'],
      ['S^+', 'S^{+}'],
    ]);
    expect(format('Review the module handbook and the Remainder example.')).toEqual([]);
  });
  it('reads natural prose around a set, partition, and Cartesian pairs', () => {
    const text = 'If two objects are in the same block, they are related. Given A = {1,2,3} the partition {{1,2},{3}} gives R = {(1,1), (1,2), (2,1), (2,2), (3,3)}.';
    expect(format(text)).toEqual([
      ['A = {1,2,3}', 'A = \\{1,2,3\\}'],
      ['{{1,2},{3}}', '\\{\\{1,2\\},\\{3\\}\\}'],
      ['R = {(1,1), (1,2), (2,1), (2,2), (3,3)}', 'R = \\{(1,1),(1,2),(2,1),(2,2),(3,3)\\}'],
    ]);
  });

  it('recognizes arithmetic, indices, and balanced exponents without evaluating them', () => {
    expect(format('Use 2^3, 2/3, x/y, x^(n+1), 2^-3, R_1, and -1/2 + 3/4.')).toEqual([
      ['2^3', '2^{3}'],
      ['2/3', '\\frac{2}{3}'],
      ['x/y', '\\frac{x}{y}'],
      ['x^(n+1)', 'x^{n + 1}'],
      ['2^-3', '2^{-3}'],
      ['R_1', 'R_{1}'],
      ['-1/2 + 3/4', '\\frac{-1}{2} + \\frac{3}{4}'],
    ]);
  });

  it('normalizes discrete symbols and mathematical wording while keeping ordinary module prose', () => {
    expect(format('Read the module handbook. Use remainder module 3. Now a ≡ b modulo 5, x in A, x not in B, B ⊆ A, A union B, |A|=3, A→B and A={x in ℕ | x<=3}.')).toEqual([
      ['module 3', '\\bmod 3'],
      ['a ≡ b modulo 5', 'a \\equiv b\\pmod{5}'],
      ['x in A', 'x \\in A'],
      ['x not in B', 'x \\notin B'],
      ['B ⊆ A', 'B \\subseteq A'],
      ['A union B', 'A \\cup B'],
      ['|A|=3', '\\lvert A\\rvert = 3'],
      ['A→B', 'A \\to B'],
      ['A={x in ℕ | x<=3}', 'A = \\{x \\in \\mathbb{N} \\mid x \\le 3\\}'],
    ]);
    expect(format('Compute 8 mod 3, n module 5 and x modulo m.')).toEqual([
      ['8 mod 3', '8 \\bmod 3'],
      ['n module 5', 'n \\bmod 5'],
      ['x modulo m', 'x \\bmod m'],
    ]);
  });

  it('keeps dates, paths, words, incomplete shorthand, and Markdown emphasis literal', () => {
    expect(format('On 2/3, the dates 2026-11-26, 2026/11/26, 11/26/2026 and 11/2026. https://example.com/2/3 and /2/3, [file](2/3). Use and/or, file_name, 2 *x*, x*y*, x^, and A = {1,2')).toEqual([]);
    expect(format('Try **2*3** as well as 2 * 3.')).toEqual([['2*3', '2 \\cdot 3'], ['2 * 3', '2 \\cdot 3']]);
  });

  it('keeps inline and fenced code and established explicit TeX separate', () => {
    const note = 'Keep \x602/3\x60 and \\(2/3\\) then 2/3.\n\n~~~text\nA = {1,2}\n~~~\n\n$$x^3$$\n\n    2/3';
    const explicit = findNoteMath(note);
    expect(explicit.map(({ math }) => math)).toEqual(['2/3', 'x^3']);
    expect(findNoteShorthand(note, explicit).map(({ start, end }) => note.slice(start, end))).toEqual(['2/3']);
  });

  it('keeps Markdown table pipes while rendering math inside a cell', () => {
    expect(format('| X | Y |\n|---|---|\n|3| 2/3 |\n\nNow |A|=3.')).toEqual([
      ['X', 'X'],
      ['Y', 'Y'],
      ['2/3', '\\frac{2}{3}'],
      ['|A|=3', '\\lvert A\\rvert = 3'],
    ]);
  });

  it('typesets lonely uppercase letters and standalone symbols while leaving contractions, initialisms, C++, and checkboxes literal', () => {
    expect(format('Let A, L, G, V, E, and R be given over ℕ and Σ with ε.')).toEqual([
      ['A', 'A'], ['L', 'L'], ['G', 'G'], ['V', 'V'], ['E', 'E'], ['R', 'R'],
      ['ℕ', '\\mathbb{N}'], ['Σ', '\\Sigma'], ['ε', '\\varepsilon'],
    ]);
    expect(format("I'm checking A's size in the U.S. with C++ and max 3 items.\n- [x] lower\n- [X] upper")).toEqual([]);
  });

  it('lifts direct postfix closures E*, E+, Σ*, {0,1}*, (A ∪ B)+, Z_n*, and Res*(K) while respecting Markdown emphasis', () => {
    expect(format('Closures E*, E+, R*, R+, L*, L+, A*, A+, Σ*, Σ+, {0,1}*, {0,1}+, (A ∪ B)*, (a+b)+, ℤ_n*, Z_n*, Res*(K), E^*, E^+, R^<=k, Σ^<=k.')).toEqual([
      ['E*', 'E^{*}'], ['E+', 'E^{+}'], ['R*', 'R^{*}'], ['R+', 'R^{+}'],
      ['L*', 'L^{*}'], ['L+', 'L^{+}'], ['A*', 'A^{*}'], ['A+', 'A^{+}'],
      ['Σ*', '\\Sigma^{*}'], ['Σ+', '\\Sigma^{+}'],
      ['{0,1}*', '\\{0,1\\}^{*}'], ['{0,1}+', '\\{0,1\\}^{+}'],
      ['(A ∪ B)*', '(A \\cup B)^{*}'], ['(a+b)+', '(a + b)^{+}'],
      ['ℤ_n*', '\\mathbb{Z}_{n}^{*}'], ['Z_n*', 'Z_{n}^{*}'], ['Res*(K)', '\\operatorname{Res}^{*}(K)'],
      ['E^*', 'E^{*}'], ['E^+', 'E^{+}'], ['R^<=k', 'R^{\\le k}'], ['Σ^<=k', '\\Sigma^{\\le k}'],
    ]);
    expect(format('*Take E* and **Take L** and **Closure E* here**.')).toEqual([
      ['E', 'E'], ['L', 'L'], ['E*', 'E^{*}'],
    ]);
  });

  it('recognizes primes, functions, named operators, factorials, classes, logic, and discrete structures delimiters', () => {
    expect(format("Check G' = (V', E'), f: A -> B, x |-> x^2, gcd(a, b) = 1, lcm(4, 6) = 12, deg(v) = 3, Id_A, Pr[A], G[U], n!/(n-k)!, K_{3,3}, [3]_R = {0,3,6}, ¬(A ∧ B), ∀x ∈ A, ⊨ F, X := Y, a ~ b, G / ~, a ≡_m b, aLb, uEv, ⌊b/a⌋, ⟨Σ⟩, and ⟦F⟧.")).toEqual([
      ["G' = (V', E')", "G' = (V',E')"],
      ['f: A -> B', 'f: A \\to B'],
      ['x |-> x^2', 'x \\mapsto x^{2}'],
      ['gcd(a, b) = 1', '\\gcd(a,b) = 1'],
      ['lcm(4, 6) = 12', '\\operatorname{lcm}(4,6) = 12'],
      ['deg(v) = 3', '\\deg(v) = 3'],
      ['Id_A', '\\mathrm{Id}_{A}'],
      ['Pr[A]', '\\Pr[A]'],
      ['G[U]', 'G[U]'],
      ['n!/(n-k)!', '\\frac{n!}{(n - k)!}'],
      ['K_{3,3}', 'K_{3,3}'],
      ['[3]_R = {0,3,6}', '[3]_{R} = \\{0,3,6\\}'],
      ['¬(A ∧ B)', '\\neg (A \\land B)'],
      ['∀x ∈ A', '\\forall x \\in A'],
      ['⊨ F', '\\models F'],
      ['X := Y', 'X := Y'],
      ['a ~ b', 'a \\sim b'],
      ['G / ~', 'G / {\\sim}'],
      ['a ≡_m b', 'a \\equiv_{m} b'],
      ['aLb', 'a\\mathrel{L}b'],
      ['uEv', 'u\\mathrel{E}v'],
      ['⌊b/a⌋', '\\lfloor \\frac{b}{a} \\rfloor'],
      ['⟨Σ⟩', '\\langle \\Sigma \\rangle'],
      ['⟦F⟧', '\\llbracket F \\rrbracket'],
    ]);
  });

  it('returns original UTF-16 offsets with multiline and named sets', () => {
    const note = '🟣 A = {apple,\nbanana} and B = {}.';
    expect(format(note)).toEqual([
      ['A = {apple,\nbanana}', 'A = \\{\\mathrm{apple},\\mathrm{banana}\\}'],
      ['B = {}', 'B = \\{\\}'],
    ]);
  });
});

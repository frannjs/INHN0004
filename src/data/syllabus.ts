import { getChapterOutline } from './courseContent';

export interface ChapterMeta {
  id: string;
  number: string;
  part: 'I' | 'II' | 'III' | 'IV' | 'V';
  title: string;
  summary: string;
  sections: { id: string; num: string; title: string }[];
}

export const BOOK_PARTS: {
  part: 'I' | 'II' | 'III' | 'IV' | 'V';
  title: string;
  description: string;
}[] = [
  {
    part: 'I',
    title: 'Part I · Foundations',
    description:
      'Start with one claim and ask what would make it false. Truth tables and quantifiers tell us what to check. Sets, tuples, and words give us objects to reason about, and induction lets us prove claims for every size of a construction. Then we follow arrows through relations and matrices to find what is reachable, what belongs in one group, and what comes before what. A function is the case where each input gets exactly one outgoing arrow.',
  },
  {
    part: 'II',
    title: 'Part II · Cardinality and Combinatorics',
    description:
      'Pair each positive integer with its double. Every positive even number gets exactly one partner, though all the odd numbers are absent from the second set. That is the idea behind comparing sizes by bijections. We use diagonalization to see why some sets cannot be listed in a sequence indexed by the natural numbers. For finite sets, we decide what counts as one outcome, then use the urn model for order and repetition, inclusion–exclusion for overlaps, and partitions for grouping or splitting a total.',
  },
  {
    part: 'III',
    title: 'Part III · Graph Theory',
    description:
      'Follow an arrow, then see whether you can get back. That test grows into strongly connected components, and adjacency matrices let us count paths of a given length. We combine graphs using products and use isomorphisms to recognise the same structure under new labels. Breadth-first and depth-first search build spanning trees. The final chapter asks whether a drawing can avoid crossings, how many colours are needed, and what changes when a tour must use each edge or visit each vertex.',
  },
  {
    part: 'IV',
    title: 'Part IV · Number Theory and Group Theory',
    description:
      'Two inputs can give the same remainder after multiplication. When can we recover the input? Divisibility and the extended Euclidean algorithm let us tell when a modular inverse exists and find it. Groups extend the question of undoing an operation to permutations and other systems. Element orders, subgroups, and Cayley graphs describe what repeated moves produce. The Chinese Remainder Theorem combines remainders with pairwise coprime moduli into one residue class.',
  },
  {
    part: 'V',
    title: 'Part V · Formal Logic',
    description:
      'We return to truth tables with a larger question. Can all these rules hold at once? Syntax trees show how the formula was built, Karnaugh–Veitch maps simplify small formulas, and Tseytin encoding gives DPLL a compact clause set to search. Resolution gives a way to show that no assignment works. In first-order logic, we also have objects and quantified choices. Skolemization keeps track of what a witness can depend on, and Herbrand expansion brings the resulting instances back to propositional reasoning.',
  },
];

const chapterPlan: (Omit<ChapterMeta, 'sections'> & Partial<Pick<ChapterMeta, 'sections'>>)[] = [
  {
    id: 'ch01',
    number: 'Chapter 1',
    part: 'I',
    title: 'Propositions, Connectives, Quantifiers, and Proofs',
    summary: 'Declarative propositions, truth tables, conditionals, restricted quantifiers, Euler diagrams, and rules of inference.',
  },
  {
    id: 'ch02',
    number: 'Chapter 2',
    part: 'I',
    title: 'Sets, Power Sets, Tuples, and Words',
    summary: 'Set operations, arbitrary unions and intersections, power sets, Cartesian products, alphabets, and infinite word trees.',
  },
  {
    id: 'ch03',
    number: 'Chapter 3',
    part: 'I',
    title: 'Natural Numbers and Proof by Induction',
    summary: 'Inductive definitions, sums and products, mathematical induction, strong induction, recurrences, and Tower of Hanoi.',
  },
  {
    id: 'ch04',
    number: 'Chapter 4',
    part: 'I',
    title: 'Binary Relations, Composition, and Closures',
    summary: 'Relations as sets, graphs, and matrices. Relational products, Boolean matrix multiplication, bounded powers, closures $R^+$ and $R^*$, and reachability invariants.',
    sections: [
      { id: 'sec-4-1', num: '4.1', title: 'k-ary Relations, Joins, and Projections' },
      { id: 'sec-4-2', num: '4.2', title: 'Binary Relations, Directed Graphs, and Matrices' },
      { id: 'sec-4-3', num: '4.3', title: 'Relational Product and Boolean Matrix Multiplication' },
      { id: 'sec-4-4', num: '4.4', title: 'Bounded Iteration, Matrix–Vector Products, and Closures' },
      { id: 'sec-4-5', num: '4.5', title: 'Properties of Endorelations, Orders, and Equivalences' },
      { id: 'sec-4-6', num: '4.6', title: 'Reachability Invariants (MU System) and Exercises' },
    ],
  },
  {
    id: 'ch05',
    number: 'Chapter 5',
    part: 'I',
    title: 'Equivalence Relations, Partial Orders, and Hasse Diagrams',
    summary: 'Partitions and quotient sets, Myhill–Nerode equivalence, partial and total orders, Hasse diagram reduction, extremal elements, suprema, infima, and lattices.',
  },
  {
    id: 'ch06',
    number: 'Chapter 6',
    part: 'I',
    title: 'Functions, Bijections, and Permutations',
    summary: 'Functions as right-unique left-total relations, function spaces, composition order, images and preimages, injective/surjective/bijective maps, and cycle notation.',
  },
  {
    id: 'ch07',
    number: 'Chapter 7',
    part: 'II',
    title: 'Comparing Cardinalities, Countability, and Diagonalization',
    summary: 'Size comparison via injections and bijections, Cantor–Schroeder–Bernstein, Cantor pairing, countable sets, Cantor diagonalization, currying, and an introduction to finite counting and inclusion–exclusion.',
  },
  {
    id: 'ch08',
    number: 'Chapter 8',
    part: 'II',
    title: 'Inclusion–Exclusion, the Urn Model, and Partitions',
    summary: 'Sum rule, inclusion–exclusion, pigeonhole principle, the four urn cases, multisets, binomial and multinomial theorems, Stirling numbers, and integer partitions.',
  },
  {
    id: 'ch09',
    number: 'Chapter 9',
    part: 'III',
    title: 'Directed Graphs, Paths, Components, Isomorphisms, and Products',
    summary: 'Adjacency matrices, walk counting via matrix powers, DAGs, connected and strongly connected components, quotient graphs, isomorphisms, automorphisms, and graph products.',
  },
  {
    id: 'ch10',
    number: 'Chapter 10',
    part: 'III',
    title: 'Simple Graphs, Trees, Spanning Trees, and Degree Sequences',
    summary: 'Standard graph families, trees and spanning trees, BFS and DFS traversal trees, the handshaking lemma, and the Havel–Hakimi algorithm.',
  },
  {
    id: 'ch11',
    number: 'Chapter 11',
    part: 'III',
    title: 'Planar Graphs, Node Colourings, and Eulerian/Hamiltonian Cycles',
    summary: 'Euler’s formula, non-planarity of $K_5$ and $K_{3,3}$, chromatic number and conflict scheduling, and Eulerian and Hamiltonian cycles.',
  },
  {
    id: 'ch12',
    number: 'Chapter 12',
    part: 'IV',
    title: 'Divisibility, Modular Arithmetic, and the Extended Euclidean Algorithm',
    summary: 'Prime factorization, residue classes, modular arithmetic, coprime units and Euler totient, tabular Extended Euclidean Algorithm, Bezout lemma, and linear congruences.',
  },
  {
    id: 'ch13',
    number: 'Chapter 13',
    part: 'IV',
    title: 'Groups, Permutations, Element Order, Subgroups, Cayley Graphs, and CRT',
    summary: 'Group axioms, symmetric groups, rings and linear systems mod p, element order, cyclic groups, Euler and Fermat theorems, Lagrange theorem, Cayley graphs, homomorphisms, and Chinese Remainder Theorem.',
  },
  {
    id: 'ch14',
    number: 'Chapter 14',
    part: 'V',
    title: 'Propositional Syntax, Semantics, KV Maps, Normal Forms, and Tseytin',
    summary: 'Formula grammar and syntax trees, short-circuit truth tables, Karnaugh–Veitch maps, semantic equivalence rewriting, NNF/DNF/CNF minimization, and linear-size Tseytin CNF.',
  },
  {
    id: 'ch15',
    number: 'Chapter 15',
    part: 'V',
    title: 'SAT Modelling, DPLL, Resolution, and First-Order Logic',
    summary: 'Clause sets, unit and pure literal rules in DPLL, Horn formulas, resolution refutation graphs, first-order structures, Skolemization, Herbrand expansions, and ground resolution.',
  },
];

export const CHAPTERS: ChapterMeta[] = chapterPlan.map((chapter) => {
  const sections = chapter.sections ?? getChapterOutline(chapter.id);
  if (!sections?.length) throw new Error(`Missing outline for ${chapter.id}`);
  return { ...chapter, sections };
});

export { GLOBAL_SYMBOL_DICTIONARY, NOTATION_SECTIONS } from './notation';
export type { GlobalSymbolEntry, NotationSection } from './notation';

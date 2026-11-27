// Concise course-wide notation. Source locations and variant coverage stay internal.
export interface GlobalSymbolEntry {
  id: string;
  part: string;
  topic: string;
  tex: string;
  name: string;
  meaning: string;
  aliases: string[];
  covers?: string[];
}

export interface NotationSection {
  id: string;
  part: string;
  title: string;
  description: string;
}

export const NOTATION_SECTIONS: NotationSection[] = [
  {
    "id": "I.reading",
    "part": "Part I",
    "title": "Reading mathematical statements",
    "description": "Definitions, logical words, and proof notation."
  },
  {
    "id": "I.sets",
    "part": "Part I",
    "title": "Sets and set operations",
    "description": "Membership, the U-shaped symbols, complements, and families of sets."
  },
  {
    "id": "I.numbers",
    "part": "Part I",
    "title": "Number sets and indexed notation",
    "description": "The number universes, finite index sets, sums, and products used throughout."
  },
  {
    "id": "I.words",
    "part": "Part I",
    "title": "Tuples, words, and languages",
    "description": "Ordered objects, Cartesian powers, alphabets, and concatenation."
  },
  {
    "id": "I.relations",
    "part": "Part I",
    "title": "Relations and their matrices",
    "description": "Successors, composition, powers, and closures."
  },
  {
    "id": "I.orders",
    "part": "Part I",
    "title": "Equivalence, orders, and lattices",
    "description": "Classes, quotients, comparisons, and bounds."
  },
  {
    "id": "I.functions",
    "part": "Part I",
    "title": "Functions and permutations",
    "description": "Mapping arrows, images, inverse images, and repeated application."
  },
  {
    "id": "II.cardinality",
    "part": "Part II",
    "title": "Cardinality and countability",
    "description": "Comparing sizes and distinguishing finite words from infinite sequences."
  },
  {
    "id": "II.counting",
    "part": "Part II",
    "title": "Counting and the urn model",
    "description": "Factorials, binomial coefficients, and the four counting cases."
  },
  {
    "id": "II.partitions",
    "part": "Part II",
    "title": "Multisets, partitions, and fixed points",
    "description": "Multiplicity functions and the named counting sequences."
  },
  {
    "id": "III.graphs",
    "part": "Part III",
    "title": "Graph notation",
    "description": "Vertices, edges, subgraphs, and structural comparisons."
  },
  {
    "id": "III.paths",
    "part": "Part III",
    "title": "Paths and connected components",
    "description": "Path length, distance, and the two kinds of component."
  },
  {
    "id": "III.families",
    "part": "Part III",
    "title": "Graph families and products",
    "description": "The subscripted graph names and operations on graphs."
  },
  {
    "id": "III.invariants",
    "part": "Part III",
    "title": "Graph degrees, colouring, and counting",
    "description": "Neighbourhoods, graph invariants, and the symbols in tree counting."
  },
  {
    "id": "IV.divisibility",
    "part": "Part IV",
    "title": "Divisibility and prime factorization",
    "description": "Divisors, gcd, lcm, prime multiplicities, and Bézout coefficients."
  },
  {
    "id": "IV.modular",
    "part": "Part IV",
    "title": "Modular arithmetic",
    "description": "Congruences, residue classes, modular operations, and units."
  },
  {
    "id": "IV.groups",
    "part": "Part IV",
    "title": "Group operations and powers",
    "description": "The operation, neutral element, inverse, and cyclic subgroup."
  },
  {
    "id": "IV.subgroups",
    "part": "Part IV",
    "title": "Permutations, subgroups, and homomorphisms",
    "description": "Structural maps, cosets, and Cayley graphs."
  },
  {
    "id": "V.connectives",
    "part": "Part V",
    "title": "Logical connectives and quantifiers",
    "description": "What the formula symbols mean, and which arrows belong inside formulas."
  },
  {
    "id": "V.propositional",
    "part": "Part V",
    "title": "Propositional syntax and semantics",
    "description": "Formulas, variables, assignments, and their truth values."
  },
  {
    "id": "V.boolean",
    "part": "Part V",
    "title": "Boolean-algebra notation",
    "description": "Meet, join, complement, and their induced order."
  },
  {
    "id": "V.normal",
    "part": "Part V",
    "title": "Literals, normal forms, and substitutions",
    "description": "Signs on literals, indexed terms, and formula rewriting."
  },
  {
    "id": "V.clauses",
    "part": "Part V",
    "title": "Clause sets, SAT, and resolution",
    "description": "The two empty objects, solver rules, and resolution closures."
  },
  {
    "id": "V.fol-syntax",
    "part": "Part V",
    "title": "First-order syntax",
    "description": "Symbol sets, arities, terms, and free or bound variables."
  },
  {
    "id": "V.fol-semantics",
    "part": "Part V",
    "title": "First-order structures and evaluation",
    "description": "Universes, interpretations, semantic values, and variable updates."
  },
  {
    "id": "V.herbrand",
    "part": "Part V",
    "title": "Ground terms and Herbrand expansion",
    "description": "Variable-free terms, finite expansions, and ground resolution."
  }
];

export const GLOBAL_SYMBOL_DICTIONARY: GlobalSymbolEntry[] = [
  {
    "id": "I.reading.defined",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\coloneqq,\\quad:=,\\quad\\eqqcolon",
    "name": "is defined as",
    "meaning": "The colon marks the side being defined: $X:=Y$ defines X using Y; $Y\\eqqcolon X$ does the same. “:iff” defines a property by an if-and-only-if condition.",
    "aliases": [
      ":=",
      "≔",
      "≕",
      "eqqcolon",
      "definition",
      "X≔Y,X:=Y",
      "X\\coloneqq Y,\\quad X:=Y",
      "X is defined as Y",
      "≔,:=,≕"
    ]
  },
  {
    "id": "I.reading.forall",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\forall,\\quad\\exists",
    "name": "for all; there exists",
    "meaning": "$\\forall x\\in A$ requires the condition for every x in A; $\\exists x\\in A$ requires at least one witness. In first-order formulas, the variable ranges over the structure’s universe.",
    "aliases": [
      "∀",
      "for all",
      "all",
      "universal quantifier",
      "∀x∈A: P(x)",
      "\\forall x\\in A:\\ P(x)",
      "for every x in A, P of x",
      "∃",
      "some",
      "existential quantifier",
      "∃x∈A: P(x)",
      "\\exists x\\in A:\\ P(x)",
      "there exists an x in A such that P of x",
      "for every",
      "∀x F",
      "\\forall x\\,F",
      "for all x, F",
      "∃x F",
      "\\exists x\\,F",
      "there exists x such that F",
      "∀,∃"
    ],
    "covers": [
      "I.reading.exists",
      "V.connectives.forall",
      "V.connectives.exists"
    ]
  },
  {
    "id": "I.reading.negation",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\neg P",
    "name": "not P",
    "meaning": "Reverses the truth value: true becomes false, and false becomes true.",
    "aliases": [
      "¬",
      "negation",
      "not",
      "¬P",
      "\\neg P",
      "not P",
      "¬F",
      "\\neg F",
      "not F, the negation of F"
    ],
    "covers": [
      "V.connectives.not"
    ]
  },
  {
    "id": "I.reading.and",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\land,\\quad\\lor",
    "name": "and; or",
    "meaning": "Conjunction requires both statements to be true. Disjunction requires at least one, and allows both.",
    "aliases": [
      "∧",
      "conjunction",
      "and",
      "P∧Q",
      "P\\land Q",
      "P and Q",
      "∨",
      "disjunction",
      "or",
      "P∨Q",
      "P\\lor Q",
      "P or Q",
      "F∧G",
      "F\\land G",
      "F and G, a conjunction",
      "F∨G",
      "F\\lor G",
      "F or G, a disjunction",
      "∧,∨"
    ],
    "covers": [
      "I.reading.or",
      "V.connectives.and",
      "V.connectives.or"
    ]
  },
  {
    "id": "I.reading.conditional",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\to,\\quad\\leftrightarrow",
    "name": "implies; if and only if",
    "meaning": "$P\\to Q$ is false only when P is true and Q is false; $P\\leftrightarrow Q$ is true when their values agree. Use these signs for formula connectives here; $\\Rightarrow$ and $\\Leftrightarrow$ are not admitted inside formulas.",
    "aliases": [
      "→",
      "conditional",
      "implication",
      "subjunction",
      "P→Q",
      "P\\to Q",
      "if P, then Q",
      "↔",
      "biconditional",
      "iff",
      "P↔Q",
      "P\\leftrightarrow Q",
      "P if and only if Q",
      "F→G",
      "F\\to G",
      "if F, then G, the conditional",
      "F↔G",
      "F\\leftrightarrow G",
      "F if and only if G",
      "⇒",
      "⇔",
      "double arrow",
      "meta implication",
      "⇒,⇔",
      "\\Rightarrow,\\quad\\Leftrightarrow",
      "double arrows: meta-level or author-dependent notation",
      "→,↔"
    ],
    "covers": [
      "I.reading.biconditional",
      "V.connectives.implies",
      "V.connectives.iff",
      "V.connectives.double-arrows"
    ]
  },
  {
    "id": "I.reading.xor",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\oplus",
    "name": "exclusive or",
    "meaning": "True exactly when the two statements have different truth values.",
    "aliases": [
      "⊕",
      "exclusive or",
      "xor",
      "P⊕Q",
      "P\\oplus Q",
      "either P or Q",
      "F⊕G",
      "F\\oplus G",
      "F exclusive-or G"
    ],
    "covers": [
      "V.connectives.xor"
    ]
  },
  {
    "id": "I.reading.derivation",
    "part": "Part I",
    "topic": "I.reading",
    "tex": "\\vdash",
    "name": "is derivable from",
    "meaning": "The claim on the right has a formal proof from the assumptions on the left.",
    "aliases": [
      "⊢",
      "vdash",
      "turnstile",
      "derivation",
      "formal proof",
      "provable"
    ]
  },
  {
    "id": "I.sets.membership",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\in,\\quad\\notin,\\quad\\ni",
    "name": "is an element of; is not; contains",
    "meaning": "$x\\in A$ means x belongs to A. $x\\notin A$ denies membership; $A\\ni x$ writes membership in reverse order.",
    "aliases": [
      "∈",
      "membership",
      "belongs to",
      "in",
      "x∈A",
      "x\\in A",
      "x is an element of A",
      "∉",
      "not in",
      "not a member",
      "x∉A",
      "x\\notin A",
      "x is not an element of A",
      "∋",
      "contains as member",
      "reverse membership",
      "A∋x",
      "A\\ni x",
      "A contains x as an element",
      "∈,∉,∋"
    ],
    "covers": [
      "I.sets.not-member",
      "I.sets.contains"
    ]
  },
  {
    "id": "I.sets.empty",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\emptyset,\\quad\\{\\},\\quad\\{a\\}",
    "name": "empty set; singleton",
    "meaning": "$\\emptyset=\\{\\}$ has no elements. $\\{a\\}$ has one element, even when $a=\\emptyset$: $\\{\\emptyset\\}$ is not empty.",
    "aliases": [
      "∅",
      "empty set",
      "{}",
      "∅,{}",
      "\\emptyset,\\quad\\{\\}",
      "the empty set",
      "singleton",
      "{∅}",
      "braces",
      "{a},{∅}",
      "\\{a\\},\\quad\\{\\emptyset\\}",
      "the singleton containing a",
      "∅,{},{a}"
    ],
    "covers": [
      "I.sets.singleton"
    ]
  },
  {
    "id": "I.sets.builder",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\{x\\in A\\mid P(x)\\}",
    "name": "the set of x in A such that P of x",
    "meaning": "The bar means “such that” and selects elements satisfying P. In $\\{e(x)\\mid x\\in A\\}$, collect the expression values instead; duplicates merge.",
    "aliases": [
      "set builder",
      "such that",
      "vertical bar",
      "separation",
      "{x∈A∣P(x)}",
      "\\{x\\in A\\mid P(x)\\}",
      "the set of x in A such that P of x",
      "replacement",
      "set comprehension",
      "image set",
      "{e(x)∣x∈A}",
      "\\{e(x)\\mid x\\in A\\}",
      "the set of values e of x for x in A"
    ],
    "covers": [
      "I.sets.replacement"
    ]
  },
  {
    "id": "I.sets.subset",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\subseteq,\\quad\\nsubseteq,\\quad\\subsetneq,\\quad\\subset",
    "name": "subset; not a subset; proper subset",
    "meaning": "$A\\subseteq B$ allows equality; $A\\subsetneq B$ excludes it. $A\\nsubseteq B$ means an element of A is missing from B. The bare $\\subset$ has conflicting conventions.",
    "aliases": [
      "⊆",
      "subset",
      "contained in",
      "A⊆B",
      "A\\subseteq B",
      "A is a subset of B",
      "⊈",
      "not a subset",
      "A⊈B",
      "A\\nsubseteq B",
      "A is not a subset of B",
      "⊊",
      "strict subset",
      "proper subset",
      "A⊊B",
      "A\\subsetneq B",
      "A is a proper subset of B",
      "⊂",
      "subset ambiguity",
      "A⊂B",
      "A\\subset B",
      "A subset B: convention must be checked",
      "⊆,⊈,⊊,⊂"
    ],
    "covers": [
      "I.sets.not-subset",
      "I.sets.proper-subset",
      "I.sets.ambiguous-subset"
    ]
  },
  {
    "id": "I.sets.superset",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\supseteq,\\quad\\supsetneq,\\quad\\nsupseteq",
    "name": "superset; proper superset; not a superset",
    "meaning": "The reversed subset comparisons: $A\\supseteq B$ means $B\\subseteq A$. The crossed form denies inclusion; the strict form excludes equality.",
    "aliases": [
      "⊇",
      "⊋",
      "superset",
      "proper superset",
      "A⊇B,A⊋B",
      "A\\supseteq B,\\quad A\\supsetneq B",
      "A is a superset, or a proper superset, of B",
      "⊉",
      "not a superset",
      "A⊉B",
      "A\\nsupseteq B",
      "A is not a superset of B",
      "⊇,⊋,⊉"
    ],
    "covers": [
      "I.sets.not-superset"
    ]
  },
  {
    "id": "I.sets.union",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "A\\cup B",
    "name": "A union B",
    "meaning": "Elements in A or B, including those in both.",
    "aliases": [
      "∪",
      "union",
      "cup",
      "U",
      "U-shaped symbol",
      "A∪B",
      "A\\cup B",
      "A union B"
    ]
  },
  {
    "id": "I.sets.intersection",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "A\\cap B",
    "name": "A intersection B",
    "meaning": "Elements belonging to both A and B.",
    "aliases": [
      "∩",
      "intersection",
      "cap",
      "upside-down U",
      "A∩B",
      "A\\cap B",
      "A intersection B"
    ]
  },
  {
    "id": "I.sets.difference",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "A\\setminus B",
    "name": "A minus B",
    "meaning": "Elements of A outside B. The order of the sets matters.",
    "aliases": [
      "∖",
      "\\\\",
      "set difference",
      "relative complement",
      "minus",
      "A∖B",
      "A\\setminus B",
      "A minus B"
    ]
  },
  {
    "id": "I.sets.symmetric-difference",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "A\\mathbin{\\Delta}B",
    "name": "A symmetric difference B",
    "meaning": "Elements in exactly one of the sets: $(A\\setminus B)\\cup(B\\setminus A)$.",
    "aliases": [
      "∆",
      "Δ",
      "symmetric difference",
      "delta",
      "AΔB",
      "A\\mathbin{\\Delta}B",
      "A symmetric difference B"
    ]
  },
  {
    "id": "I.sets.universe",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\Omega,\\quad\\overline A",
    "name": "universe; complement of A",
    "meaning": "Fix a universe $\\Omega$. Then $\\overline A=\\Omega\\setminus A$ contains its elements outside A. Complements depend on that choice.",
    "aliases": [
      "Ω",
      "universe",
      "universal set",
      "omega",
      "\\Omega",
      "Omega, the universe",
      "complement",
      "overbar",
      "bar A",
      "A‾=Ω∖A",
      "\\overline A=\\Omega\\setminus A",
      "the complement of A",
      "Ω,A‾"
    ],
    "covers": [
      "I.sets.complement"
    ]
  },
  {
    "id": "I.sets.disjoint",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "A\\cap B=\\emptyset,\\quad A\\uplus B",
    "name": "disjoint; disjoint union",
    "meaning": "Disjoint sets have no common element. $\\uplus$ marks their union with this condition; for finite sets its size is $|A|+|B|$.",
    "aliases": [
      "disjoint",
      "pairwise disjoint",
      "A∩B=∅",
      "A\\cap B=\\emptyset",
      "A and B are disjoint",
      "⊎",
      "disjoint union",
      "uplus",
      "U with plus",
      "A⊎B",
      "A\\uplus B",
      "A disjoint union B",
      "A∩B=∅,A⊎B"
    ],
    "covers": [
      "I.sets.disjoint-union"
    ]
  },
  {
    "id": "I.sets.big-union",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\bigcup_{i\\in I}A_i",
    "name": "indexed union",
    "meaning": "Take elements in at least one indexed set. $\\bigcup\\mathcal S$ unites the sets in a family; an empty union is $\\emptyset$.",
    "aliases": [
      "⋃",
      "big union",
      "indexed union",
      "big U",
      "bigcup",
      "⋃i∈IAi",
      "\\bigcup_{i\\in I}A_i",
      "the union of A sub i over i in I",
      "finite union",
      "union limits",
      "⋃i=1nAi",
      "\\bigcup_{i=1}^{n}A_i",
      "the union from i equals one to n",
      "union of a family",
      "flatten a set of sets",
      "⋃S=⋃M∈SM",
      "\\bigcup\\mathcal S=\\bigcup_{M\\in\\mathcal S}M",
      "the union of the family S"
    ],
    "covers": [
      "I.sets.finite-union",
      "I.sets.family-union"
    ]
  },
  {
    "id": "I.sets.big-intersection",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "\\bigcap_{i\\in I}A_i",
    "name": "indexed intersection",
    "meaning": "Take elements in every member of a nonempty family; also written $\\bigcap\\mathcal S$. Without a fixed universe, the empty-family intersection is undefined here.",
    "aliases": [
      "⋂",
      "big intersection",
      "indexed intersection",
      "big upside-down U",
      "bigcap",
      "⋂i∈IAi",
      "\\bigcap_{i\\in I}A_i",
      "the intersection of A sub i over i in I",
      "family intersection",
      "⋂S=⋂M∈SM",
      "\\bigcap\\mathcal S=\\bigcap_{M\\in\\mathcal S}M",
      "the intersection of the family S"
    ],
    "covers": [
      "I.sets.family-intersection"
    ]
  },
  {
    "id": "I.sets.cardinality",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "|A|,\\quad\\#A",
    "name": "cardinality",
    "meaning": "For finite A, the number of elements. $|A|\\le|B|$ means an injection exists from A to B; equality means a bijection exists; strict inequality excludes a bijection.",
    "aliases": [
      "cardinality",
      "size",
      "number of elements",
      "vertical bars",
      "∣A∣",
      "|A|",
      "the cardinality of A",
      "cardinal",
      "#A",
      "∣A∣,#A",
      "|A|,\\quad\\#A",
      "cardinality comparison",
      "injection",
      "∣A∣≤∣B∣",
      "|A|\\le|B|",
      "A has cardinality at most B",
      "equinumerous",
      "same size",
      "bijection",
      "∣A∣=∣B∣",
      "|A|=|B|",
      "A and B have the same cardinality",
      "strict cardinal inequality",
      "∣A∣<∣B∣",
      "|A|<|B|",
      "A has strictly smaller cardinality than B"
    ],
    "covers": [
      "II.cardinality.cardinal",
      "II.cardinality.comparison",
      "II.cardinality.equinumerous",
      "II.cardinality.strict-comparison"
    ]
  },
  {
    "id": "I.sets.power-set",
    "part": "Part I",
    "topic": "I.sets",
    "tex": "2^A,\\quad\\mathcal P(A)",
    "name": "power set",
    "meaning": "All subsets of A, including $\\emptyset$ and A itself. For finite A, $|2^A|=2^{|A|}$.",
    "aliases": [
      "power set",
      "powerset",
      "P(A)",
      "2A,P(A)",
      "2^A,\\quad\\mathcal P(A)",
      "the power set of A"
    ]
  },
  {
    "id": "I.numbers.naturals",
    "part": "Part I",
    "topic": "I.numbers",
    "tex": "\\mathbb N,\\quad\\mathbb N_0",
    "name": "N, and N with subscript zero",
    "meaning": "Here $\\mathbb N=\\{1,2,3,\\ldots\\}$ and $\\mathbb N_0=\\{0,1,2,\\ldots\\}$. Zero is included only in the second notation.",
    "aliases": [
      "ℕ",
      "N0",
      "natural numbers",
      "nonnegative integers",
      "N,N0",
      "\\mathbb N,\\quad\\mathbb N_0",
      "N, and N with subscript zero"
    ]
  },
  {
    "id": "I.numbers.primes",
    "part": "Part I",
    "topic": "I.numbers",
    "tex": "\\mathbb P",
    "name": "P, the set of prime numbers",
    "meaning": "The positive integers with exactly two positive divisors: $\\{2,3,5,7,11,\\ldots\\}$. In particular, neither zero nor one is prime.",
    "aliases": [
      "ℙ",
      "prime numbers",
      "primes",
      "P",
      "\\mathbb P",
      "P, the set of prime numbers"
    ]
  },
  {
    "id": "I.numbers.one-based",
    "part": "Part I",
    "topic": "I.numbers",
    "tex": "[n],\\quad\\mathbb Z_n",
    "name": "one-based and zero-based index sets",
    "meaning": "$[n]=\\{1,\\ldots,n\\}$, with $[0]=\\emptyset$; $\\mathbb Z_n=\\{0,\\ldots,n-1\\}$. The latter also gives remainder representatives modulo n.",
    "aliases": [
      "[n]",
      "one-based",
      "initial segment",
      "[n]={1,…,n}",
      "[n]=\\{1,\\ldots,n\\}",
      "one through n",
      "ℤₙ",
      "Zn",
      "zero-based",
      "remainders",
      "Zn={0,…,n−1}",
      "\\mathbb Z_n=\\{0,\\ldots,n-1\\}",
      "Z sub n",
      "[n],Zn"
    ],
    "covers": [
      "I.numbers.zero-based"
    ]
  },
  {
    "id": "I.numbers.sum",
    "part": "Part I",
    "topic": "I.numbers",
    "tex": "\\sum,\\quad\\prod",
    "name": "sum; product",
    "meaning": "Add or multiply the indexed terms. Empty finite sums equal zero; empty finite products equal one.",
    "aliases": [
      "∑",
      "Σ",
      "summation",
      "sum",
      "sigma",
      "∑i∈Iai,∑i=1nai",
      "\\sum_{i\\in I}a_i,\\quad\\sum_{i=1}^{n}a_i",
      "the sum over the indicated indices",
      "∏",
      "Π",
      "product",
      "pi",
      "∏i∈Iai,∏i=1nai",
      "\\prod_{i\\in I}a_i,\\quad\\prod_{i=1}^{n}a_i",
      "the product over the indicated indices",
      "∑,∏"
    ],
    "covers": [
      "I.numbers.product"
    ]
  },
  {
    "id": "I.numbers.floor",
    "part": "Part I",
    "topic": "I.numbers",
    "tex": "\\lfloor x\\rfloor,\\quad\\lceil x\\rceil",
    "name": "floor; ceiling",
    "meaning": "The greatest integer at most x; the least integer at least x. For example, $\\lfloor-1.2\\rfloor=-2$ and $\\lceil-1.2\\rceil=-1$.",
    "aliases": [
      "⌊",
      "⌋",
      "floor",
      "round down",
      "⌊x⌋",
      "\\lfloor x\\rfloor",
      "the floor of x",
      "⌈",
      "⌉",
      "ceiling",
      "round up",
      "⌈x⌉",
      "\\lceil x\\rceil",
      "the ceiling of x",
      "⌊x⌋,⌈x⌉"
    ],
    "covers": [
      "I.numbers.ceiling"
    ]
  },
  {
    "id": "I.words.tuple",
    "part": "Part I",
    "topic": "I.words",
    "tex": "(a_1,\\ldots,a_n),\\quad()",
    "name": "tuple; empty tuple",
    "meaning": "Order and repeated entries matter. $()$ has zero entries; $\\{()\\}$ is a one-element set, not the empty set.",
    "aliases": [
      "tuple",
      "sequence",
      "indexed sequence",
      "(a1,…,an),(ai)i∈I",
      "(a_1,\\ldots,a_n),\\quad(a_i)_{i\\in I}",
      "an ordered tuple; an indexed sequence",
      "empty tuple",
      "zero tuple",
      "()",
      "the empty tuple",
      "(a1,…,an),()"
    ],
    "covers": [
      "I.words.empty-tuple"
    ]
  },
  {
    "id": "I.words.cartesian",
    "part": "Part I",
    "topic": "I.words",
    "tex": "A\\times B,\\quad A^k",
    "name": "Cartesian product; Cartesian power",
    "meaning": "Products collect tuples with one entry from each factor; $A^k$ uses A in all k positions and $A^0=\\{()\\}$. In direct products of groups, operations act coordinate by coordinate.",
    "aliases": [
      "×",
      "Cartesian product",
      "ordered pairs",
      "cross",
      "A×B",
      "A\\times B",
      "A Cartesian product B",
      "indexed Cartesian product",
      "product of sets",
      "×i=1kAi",
      "\\mathop{\\times}_{i=1}^{k}A_i",
      "the Cartesian product of A one through A k",
      "Cartesian power",
      "tuple space",
      "Ak",
      "A^k",
      "A to the k-th Cartesian power",
      "direct product of groups",
      "group product",
      "G1×⋯×Gk,∏i∈IGi",
      "G_1\\times\\cdots\\times G_k,\\quad\\prod_{i\\in I}G_i",
      "the direct product of groups",
      "A×B,Ak"
    ],
    "covers": [
      "I.words.indexed-cartesian",
      "I.words.cartesian-power",
      "IV.groups.group-product"
    ]
  },
  {
    "id": "I.words.alphabet",
    "part": "Part I",
    "topic": "I.words",
    "tex": "\\Sigma,\\quad\\Gamma,\\quad L\\subseteq\\Sigma^*",
    "name": "alphabet; language",
    "meaning": "An alphabet is a set of symbols; a language is a set of finite words over it. Sigma and Gamma name alphabets here.",
    "aliases": [
      "Σ",
      "Γ",
      "alphabet",
      "sigma",
      "gamma",
      "Σ,Γ",
      "\\Sigma,\\quad\\Gamma",
      "Sigma or Gamma, an alphabet",
      "language",
      "formal language",
      "L⊆Σ∗",
      "L\\subseteq\\Sigma^*",
      "a language L over Sigma",
      "Σ,Γ,L⊆Σ∗"
    ],
    "covers": [
      "I.words.language"
    ]
  },
  {
    "id": "I.words.empty-word",
    "part": "Part I",
    "topic": "I.words",
    "tex": "\\varepsilon\\quad(\\text{also }\\lambda)",
    "name": "epsilon, the empty word",
    "meaning": "The word of length zero. It is the identity for concatenation: $u\\varepsilon=\\varepsilon u=u$.",
    "aliases": [
      "ε",
      "ϵ",
      "λ",
      "empty word",
      "empty string",
      "epsilon",
      "ε(also λ)",
      "\\varepsilon\\quad(\\text{also }\\lambda)",
      "epsilon, the empty word"
    ]
  },
  {
    "id": "I.words.fixed-length",
    "part": "Part I",
    "topic": "I.words",
    "tex": "\\Sigma^k,\\quad\\Sigma^*,\\quad\\Sigma^{\\le k}",
    "name": "words of length k; all finite words; bounded-length words",
    "meaning": "$\\Sigma^k$ contains words of length k; $\\Sigma^*=\\bigcup_{k\\in\\mathbb N_0}\\Sigma^k$ contains every finite length. $\\le k$ allows lengths up to k, while $<k$ excludes k. $\\Sigma^0=\\{\\varepsilon\\}$.",
    "aliases": [
      "words of length k",
      "alphabet power",
      "Σk",
      "\\Sigma^k",
      "Sigma to the k",
      "Σ*",
      "Kleene star",
      "finite words",
      "star",
      "Σ∗=⋃k∈N0Σk",
      "\\Sigma^*=\\bigcup_{k\\in\\mathbb N_0}\\Sigma^k",
      "Sigma star",
      "bounded words",
      "shorter words",
      "Σ≤k,Σ<k",
      "\\Sigma^{\\le k},\\quad\\Sigma^{<k}",
      "words of length at most k; of length less than k",
      "Σk,Σ∗,Σ≤k"
    ],
    "covers": [
      "I.words.all-words",
      "I.words.bounded-words"
    ]
  },
  {
    "id": "I.words.word-length",
    "part": "Part I",
    "topic": "I.words",
    "tex": "|w|,\\quad |w|_a",
    "name": "word length; symbol count",
    "meaning": "The first counts all positions in w; the subscripted form counts occurrences of the symbol a.",
    "aliases": [
      "word length",
      "occurrence count",
      "letter count",
      "∣w∣,∣w∣a",
      "|w|,\\quad |w|_a",
      "the length of w; the number of a symbols in w"
    ]
  },
  {
    "id": "I.words.concatenation",
    "part": "Part I",
    "topic": "I.words",
    "tex": "uv,\\quad u\\circ v,\\quad LL'",
    "name": "concatenation of words or languages",
    "meaning": "Put u before v; order generally matters. $LL'$ contains all such concatenations with one word from each language. The empty word is the identity.",
    "aliases": [
      "concatenation",
      "word product",
      "string product",
      "uv,u∘v",
      "uv,\\quad u\\circ v",
      "u concatenated with v",
      "language concatenation",
      "language product",
      "LL′={uv∣u∈L, v∈L′}",
      "LL'=\\{uv\\mid u\\in L,\\ v\\in L'\\}",
      "the concatenation of two languages",
      "uv,u∘v,LL′"
    ],
    "covers": [
      "I.words.language-product"
    ]
  },
  {
    "id": "I.words.word-prefix",
    "part": "Part I",
    "topic": "I.words",
    "tex": "\\preceq_p,\\quad\\preceq_s,\\quad\\preceq_i",
    "name": "is a prefix; suffix; infix",
    "meaning": "For $u\\preceq_p v$, v starts with u; for $u\\preceq_s v$, it ends with u. An infix occurs contiguously inside v. Empty and whole words are allowed.",
    "aliases": [
      "⪯",
      "prefix",
      "preceq p",
      "u⪯pv",
      "u\\preceq_p v",
      "u is a prefix of v",
      "suffix",
      "preceq s",
      "u⪯sv",
      "u\\preceq_s v",
      "u is a suffix of v",
      "infix",
      "factor",
      "subword",
      "u⪯iv",
      "u\\preceq_i v",
      "u is an infix of v",
      "⪯p,⪯s,⪯i"
    ],
    "covers": [
      "I.words.word-suffix",
      "I.words.word-infix"
    ]
  },
  {
    "id": "I.words.conjugacy",
    "part": "Part I",
    "topic": "I.words",
    "tex": "u\\cong_c v",
    "name": "u and v are conjugate words",
    "meaning": "There exist words w and $w'$ such that $u=ww'$ and $v=w' w$. The words differ by a cyclic cut.",
    "aliases": [
      "≅",
      "word conjugacy",
      "cyclic shift",
      "cong c",
      "u≅cv",
      "u\\cong_c v",
      "u and v are conjugate words"
    ]
  },
  {
    "id": "I.relations.k-ary",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "aRb,\\quad a\\not R b",
    "name": "a is related to b; is not related to b",
    "meaning": "Abbreviations for $(a,b)\\in R$ and $(a,b)\\notin R$. The order of a and b matters.",
    "aliases": [
      "relation",
      "arity",
      "k-ary",
      "binary relation",
      "R⊆A1×⋯×Ak",
      "R\\subseteq A_1\\times\\cdots\\times A_k",
      "a k-ary relation",
      "infix relation",
      "not related",
      "aRb,aR̸b",
      "aRb,\\quad a\\not R b",
      "a is related to b; a is not related to b",
      "R⊆A1×⋯×Ak,aRb"
    ],
    "covers": [
      "I.relations.infix"
    ]
  },
  {
    "id": "I.relations.successors",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "aR,\\quad XR,\\quad Rb,\\quad RY",
    "name": "successors; predecessors",
    "meaning": "aR and Rb collect one-step successors of a and predecessors of b. XR takes successors from any element of X; RY takes predecessors leading to any element of Y.",
    "aliases": [
      "successors",
      "image under relation",
      "outgoing",
      "aR,XR",
      "aR,\\quad XR",
      "the R-successors of a; of X",
      "predecessors",
      "incoming",
      "Rb,RY",
      "Rb,\\quad RY",
      "the R-predecessors of b; of Y",
      "aR,XR,Rb,RY"
    ],
    "covers": [
      "I.relations.predecessors"
    ]
  },
  {
    "id": "I.relations.identity",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "\\mathrm{Id}_A",
    "name": "the identity relation on A",
    "meaning": "Exactly the pairs $(a,a)$ for $a\\in A$. On a graph it consists of all self-loops; as a function it maps each input to itself.",
    "aliases": [
      "Id",
      "identity relation",
      "identity function",
      "IdA",
      "\\mathrm{Id}_A",
      "the identity relation on A"
    ]
  },
  {
    "id": "I.relations.converse",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "R^\\top=R^{-1},\\quad M_R^\\top",
    "name": "converse relation; transpose",
    "meaning": "Reverse every relation pair. Transposing the corresponding matrix exchanges rows and columns. A converse exists even when no inverse function does.",
    "aliases": [
      "⊤",
      "transpose",
      "converse",
      "inverse relation",
      "R⊤=R−1",
      "R^\\top=R^{-1}",
      "R transpose, converse, or inverse relation",
      "matrix transpose",
      "transposed matrix",
      "MR⊤=MR⊤",
      "M_R^\\top=M_{R^\\top}",
      "the transpose of the matrix of R",
      "R⊤=R−1,MR⊤"
    ],
    "covers": [
      "I.relations.matrix-transpose"
    ]
  },
  {
    "id": "I.relations.join",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "R\\bowtie_{i_0=j_0}S",
    "name": "join R and S on the specified coordinates",
    "meaning": "Concatenates a tuple from R and one from S only when their selected entries agree. Both matched coordinates remain in the concatenated tuple.",
    "aliases": [
      "⋈",
      "bowtie",
      "join",
      "conditional concatenation",
      "R⋈i0=j0S",
      "R\\bowtie_{i_0=j_0}S",
      "join R and S on the specified coordinates"
    ]
  },
  {
    "id": "I.relations.projection",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "\\pi_{i_1,\\ldots,i_\\ell}(R)",
    "name": "projection onto selected coordinates",
    "meaning": "Keep the listed coordinates in that order. Coordinates may be reordered or repeated; duplicate output tuples merge.",
    "aliases": [
      "π",
      "projection",
      "pi",
      "tau",
      "coordinate selection",
      "πi1,…,iℓ(R),πτ(R)",
      "\\pi_{i_1,\\ldots,i_\\ell}(R),\\quad\\pi_\\tau(R)",
      "project R onto the listed coordinates",
      "πi1,…,iℓ(R)"
    ]
  },
  {
    "id": "I.relations.composition",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "RS,\\quad R;S",
    "name": "R then S",
    "meaning": "Pairs $(a,d)$ for which some x satisfies $(a,x)\\in R$ and $(x,d)\\in S$. Relational products are read left to right here.",
    "aliases": [
      "relational product",
      "relation composition",
      "semicolon",
      "RS,R;S",
      "RS,\\quad R;S",
      "R then S"
    ]
  },
  {
    "id": "I.relations.matrix",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "M_R=(r_{i,j})",
    "name": "relation or adjacency matrix",
    "meaning": "Entries indicate membership (1) or nonmembership (0), with fixed row and column enumerations. Boolean multiplication uses maximum instead of sum, recording whether an intermediate witness exists.",
    "aliases": [
      "relation matrix",
      "adjacency matrix",
      "M_R",
      "MR=(ri,j)",
      "M_R=(r_{i,j})",
      "the matrix of relation R",
      "vertex enumeration",
      "(ai,j)i,j∈[n]",
      "(a_{i,j})_{i,j\\in[n]}",
      "the adjacency matrix",
      "Boolean product",
      "Boolean matrix multiplication",
      "max k",
      "(MRS)i,j=maxk(ri,ksk,j)",
      "(M_{RS})_{i,j}=\\max_k(r_{i,k}s_{k,j})",
      "the Boolean matrix product",
      "(MRS)i,j=max⁡k(ri,ksk,j)"
    ],
    "covers": [
      "III.graphs.adjacency",
      "I.relations.boolean-product"
    ]
  },
  {
    "id": "I.relations.zero-power",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "R^0,\\quad R^k,\\quad R^{\\le k},\\quad R^{<k}",
    "name": "zero; exact; bounded relation powers",
    "meaning": "$R^0=\\mathrm{Id}_A$ means zero steps; $R^k$ means exactly k. The bounded powers unite lengths from zero through k, or strictly below k, respectively.",
    "aliases": [
      "zero steps",
      "zero power",
      "R0=IdA",
      "R^0=\\mathrm{Id}_A",
      "R to the zeroth power",
      "relation power",
      "exact steps",
      "Rk",
      "R^k",
      "R to the k-th relational power",
      "bounded relation power",
      "at most k",
      "R≤k=⋃i=0kRi",
      "R^{\\le k}=\\bigcup_{i=0}^kR^i",
      "R in at most k steps",
      "fewer than k",
      "strict bound",
      "R<k=⋃i=0k−1Ri",
      "R^{<k}=\\bigcup_{i=0}^{k-1}R^i",
      "R in fewer than k steps",
      "R0,Rk,R≤k,R<k"
    ],
    "covers": [
      "I.relations.power",
      "I.relations.bounded-power",
      "I.relations.strict-bound"
    ]
  },
  {
    "id": "I.relations.positive-closure",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "R^+,\\quad R^*",
    "name": "transitive closure; reflexive-transitive closure",
    "meaning": "$R^+$ allows any positive finite number of steps. $R^*$ also allows zero steps, so it contains the identity relation.",
    "aliases": [
      "R+",
      "positive closure",
      "transitive closure",
      "R+=⋃k∈NRk",
      "R^+=\\bigcup_{k\\in\\mathbb N}R^k",
      "R plus, the transitive closure",
      "R*",
      "reflexive transitive closure",
      "reachability",
      "R∗=⋃k∈N0Rk",
      "R^*=\\bigcup_{k\\in\\mathbb N_0}R^k",
      "R star, the reflexive-transitive closure",
      "edge powers",
      "path powers",
      "Ek,E+,E∗",
      "E^k,\\quad E^+,\\quad E^*",
      "exact-step reachability; positive reachability; reachability",
      "R+,R∗"
    ],
    "covers": [
      "I.relations.star-closure",
      "III.paths.reachability"
    ]
  },
  {
    "id": "I.relations.restriction",
    "part": "Part I",
    "topic": "I.relations",
    "tex": "R|_X",
    "name": "R restricted to X",
    "meaning": "Keeps only pairs whose two entries lie in X. For an order, this gives the induced order on the smaller carrier.",
    "aliases": [
      "restriction",
      "induced relation",
      "R∣X=R∩(X×X)",
      "R|_X=R\\cap(X\\times X)",
      "R restricted to X"
    ]
  },
  {
    "id": "I.orders.equivalence",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "a\\sim b",
    "name": "a is equivalent to b",
    "meaning": "A general notation for an equivalence relation. Its meaning must be defined in the given setting; the relation must be reflexive, symmetric, and transitive.",
    "aliases": [
      "∼",
      "equivalence relation",
      "tilde",
      "a∼b",
      "a\\sim b",
      "a is equivalent to b"
    ]
  },
  {
    "id": "I.orders.class",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "[a]_R,\\quad A/R,\\quad X_R",
    "name": "equivalence class; quotient; representatives",
    "meaning": "$[a]_R$ contains all elements equivalent to a. A/R is the set of these classes; $X_R$ chooses one representative from each. This subscript differs from the relation image XR.",
    "aliases": [
      "equivalence class",
      "[a]",
      "[a]R=aR",
      "[a]_R=aR",
      "the equivalence class of a under R",
      "quotient set",
      "modulo an equivalence",
      "A/R",
      "A modulo R, the quotient set",
      "representatives",
      "transversal",
      "XR",
      "X_R",
      "a system of representatives for R",
      "[a]R,A/R,XR"
    ],
    "covers": [
      "I.orders.quotient",
      "I.orders.representatives"
    ]
  },
  {
    "id": "I.orders.nerode",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "\\sim_L,\\quad[w]_L",
    "name": "Myhill–Nerode equivalence for L; the class of w",
    "meaning": "Words u and v are equivalent when every continuation z makes $uz\\in L$ and $vz\\in L$ agree.",
    "aliases": [
      "Myhill Nerode",
      "Nerode",
      "language equivalence",
      "∼L,[w]L",
      "\\sim_L,\\quad[w]_L",
      "Myhill–Nerode equivalence for L; the class of w"
    ]
  },
  {
    "id": "I.orders.order",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "a\\preceq b,\\quad a\\prec b",
    "name": "partial order; strict order",
    "meaning": "A partial order is reflexive, antisymmetric, and transitive. Removing its equality pairs gives a strict order, $R\\setminus\\mathrm{Id}_A$, which is asymmetric and transitive.",
    "aliases": [
      "⪯",
      "partial order",
      "poset",
      "preceq",
      "(A,R),a⪯b",
      "(A,R),\\quad a\\preceq b",
      "a partially ordered set; a precedes b",
      "≺",
      "strict order",
      "subterm",
      "R∖IdA,a≺b",
      "R\\setminus\\mathrm{Id}_A,\\quad a\\prec b",
      "the associated strict order; a strictly precedes b",
      "a⪯b,a≺b"
    ],
    "covers": [
      "I.orders.strict-order"
    ]
  },
  {
    "id": "I.orders.weak-order",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "a\\sqsubset b",
    "name": "a precedes b in the specified strict weak order",
    "meaning": "A strict order whose incomparability relation is an equivalence relation. The square comparison symbol here is not set inclusion.",
    "aliases": [
      "⊏",
      "strict weak order",
      "SWO",
      "a⊏b",
      "a\\sqsubset b",
      "a precedes b in the specified strict weak order"
    ]
  },
  {
    "id": "I.orders.lexicographic",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "<_{\\mathrm{lex}}",
    "name": "lexicographic order",
    "meaning": "Compares words at their first differing symbol, using the chosen order on the alphabet; a proper prefix comes before the longer word.",
    "aliases": [
      "lexicographic",
      "dictionary order",
      "<lex",
      "<_{\\mathrm{lex}}",
      "lexicographic order"
    ]
  },
  {
    "id": "I.orders.maximum",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "\\max_R X,\\quad\\min_R X",
    "name": "the maximum or minimum of X under R",
    "meaning": "A greatest or least element of X itself. A maximal element merely has no strictly larger member; it need not be above all members.",
    "aliases": [
      "max",
      "min",
      "greatest",
      "least",
      "maximal",
      "minimal",
      "maxRX,minRX",
      "\\max_R X,\\quad\\min_R X",
      "the maximum or minimum of X under R",
      "max⁡RX,min⁡RX"
    ]
  },
  {
    "id": "I.orders.supremum",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "\\sup_R X,\\quad\\inf_R X",
    "name": "supremum; infimum",
    "meaning": "The least upper bound and greatest lower bound in the ambient order. Unlike a maximum or minimum, a bound need not belong to X.",
    "aliases": [
      "sup",
      "supremum",
      "least upper bound",
      "LUB",
      "supRX",
      "\\sup_R X",
      "the supremum of X under R",
      "inf",
      "infimum",
      "greatest lower bound",
      "GLB",
      "infRX",
      "\\inf_R X",
      "the infimum of X under R",
      "sup⁡RX,inf⁡RX"
    ],
    "covers": [
      "I.orders.infimum"
    ]
  },
  {
    "id": "I.orders.meet",
    "part": "Part I",
    "topic": "I.orders",
    "tex": "a\\sqcap b,\\quad a\\sqcup b",
    "name": "meet; join",
    "meaning": "The greatest lower bound and least upper bound of a pair. A meet-semilattice guarantees a meet for every pair, and a join-semilattice guarantees a join. In the inclusion order these are intersection and union.",
    "aliases": [
      "⊓",
      "meet",
      "meet semilattice",
      "square cap",
      "a⊓b=inf{a,b}",
      "a\\sqcap b=\\inf\\{a,b\\}",
      "a meet b",
      "⊔",
      "lattice join",
      "join semilattice",
      "square cup",
      "a⊔b=sup{a,b}",
      "a\\sqcup b=\\sup\\{a,b\\}",
      "a join b",
      "x⊓y",
      "x\\sqcap y",
      "x meet y",
      "join",
      "x⊔y",
      "x\\sqcup y",
      "x join y",
      "a⊓b,a⊔b"
    ],
    "covers": [
      "I.orders.join",
      "V.boolean.meet",
      "V.boolean.join"
    ]
  },
  {
    "id": "I.functions.function",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "f:A\\to B,\\quad a\\mapsto f(a)",
    "name": "function from A to B; maps a to f of a",
    "meaning": "A is the domain and B the codomain; each input has exactly one output. The second arrow specifies the output of an individual input.",
    "aliases": [
      "function",
      "mapping",
      "domain",
      "codomain",
      "f:A→B",
      "f:A\\to B",
      "f maps A to B",
      "↦",
      "mapsto",
      "maps to",
      "a↦f(a)",
      "a\\mapsto f(a)",
      "a maps to f of a",
      "f:A→B,a↦f(a)"
    ],
    "covers": [
      "I.functions.mapsto"
    ]
  },
  {
    "id": "I.functions.injective-arrow",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "\\xrightarrow{\\mathrm{inj}},\\quad\\xrightarrow{\\mathrm{surj}},\\quad\\xrightarrow{\\mathrm{bij}},\\quad\\hookrightarrow",
    "name": "injective; surjective; bijective",
    "meaning": "Injective: distinct inputs have distinct outputs. Surjective: every codomain element is reached. Bijective: both. A hooked arrow indicates injectivity; in partial-matching notation, totality is a separate requirement.",
    "aliases": [
      "injection",
      "inj",
      "injective",
      "f:A→injB",
      "f:A\\xrightarrow{\\mathrm{inj}}B",
      "an injective map from A to B",
      "surjection",
      "surj",
      "onto",
      "f:A→surjB",
      "f:A\\xrightarrow{\\mathrm{surj}}B",
      "a surjective map from A to B",
      "bijection",
      "bij",
      "one-to-one correspondence",
      "f:A→bijB",
      "f:A\\xrightarrow{\\mathrm{bij}}B",
      "a bijection from A to B",
      "↪",
      "hooked arrow",
      "matching",
      "Hall",
      "m:A↪B,m⊆R",
      "m:A\\hookrightarrow B,\\quad m\\subseteq R",
      "an injective matching along R",
      "→inj,→surj,→bij,↪"
    ],
    "covers": [
      "I.functions.surjective-arrow",
      "I.functions.bijective-arrow",
      "II.cardinality.matching"
    ]
  },
  {
    "id": "I.functions.partial-map",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "|af|\\le1,\\quad f_\\bot",
    "name": "partial function; undefined-value extension",
    "meaning": "A partial function gives at most one output per input. A fresh $\\bot$ outside the codomain can mark missing outputs; it means undefined here.",
    "aliases": [
      "partial function",
      "partial map",
      "f⊆A×B,∣af∣≤1",
      "f\\subseteq A\\times B,\\quad|af|\\le1",
      "a partial function from A to B",
      "⊥",
      "undefined",
      "error value",
      "bottom",
      "f⊥,⊥",
      "f_\\bot,\\quad\\bot",
      "a totalized partial map; an undefined value",
      "∣af∣≤1,f⊥"
    ],
    "covers": [
      "I.functions.undefined"
    ]
  },
  {
    "id": "I.functions.function-space",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "B^A",
    "name": "B to the A, the function space",
    "meaning": "All total functions from A to B. The domain is the exponent and the codomain is the base. For finite sets, $|B^A|=|B|^{|A|}$.",
    "aliases": [
      "function space",
      "set of functions",
      "BA",
      "B^A",
      "B to the A, the function space"
    ]
  },
  {
    "id": "I.functions.composition",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "g\\circ f,\\quad f^k",
    "name": "function composition; iteration",
    "meaning": "Apply f before g. For a self-map, $f^k$ repeats f k times and $f^0=\\mathrm{Id}_A$. As a left-to-right relational product, $g\\circ f=fg$.",
    "aliases": [
      "∘",
      "function composition",
      "circle",
      "g∘f",
      "g\\circ f",
      "g after f",
      "iterate",
      "function power",
      "repeated application",
      "fk,f0=IdA",
      "f^k,\\quad f^0=\\mathrm{Id}_A",
      "the k-th iterate of f",
      "g∘f,fk"
    ],
    "covers": [
      "I.functions.iterate"
    ]
  },
  {
    "id": "I.functions.image-set",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "f(X),\\quad\\operatorname{im}(f)=f(A)",
    "name": "the image of X; the image of f",
    "meaning": "The outputs reached by inputs in X. The full image is obtained from the whole domain.",
    "aliases": [
      "image",
      "range",
      "im",
      "f(X),im(f)=f(A)",
      "f(X),\\quad\\operatorname{im}(f)=f(A)",
      "the image of X; the image of f",
      "image subgroup",
      "im(h)=h(GA)",
      "\\operatorname{im}(h)=h(G_A)",
      "the image subgroup of h",
      "f(X),im⁡(f)=f(A)"
    ],
    "covers": [
      "IV.subgroups.image"
    ]
  },
  {
    "id": "I.functions.preimage",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "f^{-1}(Y),\\quad f^{-1}",
    "name": "preimage; inverse function",
    "meaning": "A preimage collects all inputs mapping into Y; $f^{-1}(b)$ abbreviates the fiber over b. It always exists. An inverse function returning one input for each output requires a bijection.",
    "aliases": [
      "preimage",
      "inverse image",
      "fiber",
      "fibre",
      "f−1(Y),f−1(b)",
      "f^{-1}(Y),\\quad f^{-1}(b)",
      "the inverse image of Y; the fiber over b",
      "inverse function",
      "inverse map",
      "f−1:B→A",
      "f^{-1}:B\\to A",
      "the inverse function of f",
      "f−1(Y),f−1"
    ],
    "covers": [
      "I.functions.inverse"
    ]
  },
  {
    "id": "I.functions.indicator",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "\\delta_X,\\quad\\chi_X,\\quad v_X",
    "name": "indicator function; indicator vector",
    "meaning": "The function is one on X and zero outside X. The vector lists these membership values in a fixed enumeration; a transpose changes row and column orientation.",
    "aliases": [
      "δ",
      "χ",
      "indicator",
      "characteristic function",
      "δX:A→{0,1},χX",
      "\\delta_X:A\\to\\{0,1\\},\\quad\\chi_X",
      "the characteristic function of X",
      "characteristic vector",
      "indicator vector",
      "row vector",
      "column vector",
      "vX,vY⊤",
      "v_X,\\quad v_Y^\\top",
      "the characteristic row vector of X; column vector of Y",
      "matrix-vector reachability",
      "relation image",
      "vXMR=vXR,MRvY⊤=vRY⊤",
      "v_XM_R=v_{XR},\\quad M_Rv_Y^\\top=v_{RY}^\\top",
      "matrix-vector descriptions of successors and predecessors",
      "δX,χX,vX"
    ],
    "covers": [
      "I.relations.indicator-vector",
      "I.relations.matrix-image"
    ]
  },
  {
    "id": "I.functions.symmetric",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "S_A,\\quad S_n,\\quad(a_1\\,\\cdots\\,a_k)",
    "name": "symmetric group; cycle notation",
    "meaning": "$S_A$ contains all bijections of A to itself; $S_n=S_{[n]}$. A cycle maps each listed element to the next and the last to the first; in two-line notation, inputs sit above outputs.",
    "aliases": [
      "symmetric group",
      "permutations",
      "S_n",
      "SA,Sn=S[n]",
      "S_A,\\quad S_n=S_{[n]}",
      "the permutations of A; the symmetric group on n elements",
      "cycle notation",
      "permutation cycle",
      "(a1,a2,…,ak)",
      "(a_1,a_2,\\ldots,a_k)",
      "the permutation cycle a one through a k",
      "two-line notation",
      "one-line notation",
      "value table",
      "(a1⋯anf(a1)⋯f(an))",
      "\\begin{pmatrix}a_1&\\cdots&a_n\\\\f(a_1)&\\cdots&f(a_n)\\end{pmatrix}",
      "the two-line notation of a function",
      "permutation group",
      "(SA,∘,IdA),Sn",
      "(S_A,\\circ,\\mathrm{Id}_A),\\quad S_n",
      "the symmetric group",
      "π",
      "ζ",
      "pi",
      "zeta",
      "permutation order",
      "cycle length",
      "π=ζ1⋯ζk,∣ζi∣",
      "\\pi=\\zeta_1\\cdots\\zeta_k,\\quad|\\zeta_i|",
      "a permutation written in disjoint cycles; a cycle length",
      "SA,Sn,(a1 ⋯ ak)"
    ],
    "covers": [
      "I.functions.cycle",
      "I.functions.two-line",
      "IV.subgroups.symmetric-group",
      "IV.subgroups.cycle-length"
    ]
  },
  {
    "id": "I.functions.kernel-equivalence",
    "part": "Part I",
    "topic": "I.functions",
    "tex": "\\equiv_f,\\quad[a]_f,\\quad[\\cdot]_f,\\quad\\widetilde f",
    "name": "same-value equivalence; class map; induced map",
    "meaning": "$a\\equiv_f b$ means $f(a)=f(b)$. The class map sends a to its fiber $[a]_f$; the induced map sends that class to $f(a)$, bijectively onto the image.",
    "aliases": [
      "≡",
      "kernel equivalence",
      "same value",
      "equal image",
      "a≡fb,[a]f",
      "a\\equiv_f b,\\quad[a]_f",
      "same output under f; its equivalence class",
      "class map",
      "induced map",
      "tilde f",
      "[⋅]f,f~",
      "[\\cdot]_f,\\quad\\widetilde f",
      "the class map; the induced map on classes",
      "quotient by a homomorphism",
      "kernel congruence",
      "tilde h",
      "G/≡h,h~",
      "G/{\\equiv_h},\\quad\\widetilde h",
      "the quotient by equal image; the induced isomorphism",
      "≡f,[a]f,[⋅]f,f~"
    ],
    "covers": [
      "I.functions.quotient-map",
      "IV.subgroups.homomorphism-quotient"
    ]
  },
  {
    "id": "II.cardinality.countable",
    "part": "Part II",
    "topic": "II.cardinality",
    "tex": "|A|\\le|\\mathbb N|,\\quad |A|\\le\\infty",
    "name": "countable; countably infinite",
    "meaning": "Countable includes finite sets. Countably infinite means $|A|=|\\mathbb N|$. Here $|A|\\le\\infty$ abbreviates countability, rather than treating all infinite sizes as equal.",
    "aliases": [
      "countable",
      "denumerable",
      "at most countable",
      "∣A∣≤∣N∣",
      "|A|\\le|\\mathbb N|",
      "A is countable",
      "countably infinite",
      "enumerably infinite",
      "∣A∣=∣N∣",
      "|A|=|\\mathbb N|",
      "A is countably infinite",
      "countable shorthand",
      "infinite cardinal notation",
      "∣A∣≤∞",
      "|A|\\le\\infty",
      "A has at most countable cardinality, in this shorthand",
      "∣A∣≤∣N∣,∣A∣≤∞"
    ],
    "covers": [
      "II.cardinality.countably-infinite",
      "II.cardinality.countable-shorthand"
    ]
  },
  {
    "id": "II.cardinality.infinite-word",
    "part": "Part II",
    "topic": "II.cardinality",
    "tex": "\\Sigma^\\omega,\\quad u^\\omega",
    "name": "infinite words; infinite repetition of u",
    "meaning": "Omega as an exponent indicates an infinite sequence of symbols. For a nonempty finite word u, $u^\\omega$ repeats u indefinitely; it is not in $\\Sigma^*$.",
    "aliases": [
      "ω",
      "omega",
      "infinite word",
      "infinite repetition",
      "Σω,uω",
      "\\Sigma^\\omega,\\quad u^\\omega",
      "infinite words; infinite repetition of u"
    ]
  },
  {
    "id": "II.counting.probability",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "\\Pr[A]=\\frac{|A|}{|\\Omega|}",
    "name": "the probability of A in a uniform finite space",
    "meaning": "When all outcomes in the finite nonempty universe are equally likely, divide the number of favourable outcomes by the total.",
    "aliases": [
      "Pr",
      "probability",
      "uniform probability",
      "Pr[A]=∣A∣∣Ω∣",
      "\\Pr[A]=\\frac{|A|}{|\\Omega|}",
      "the probability of A in a uniform finite space",
      "Pr⁡[A]=∣A∣∣Ω∣"
    ]
  },
  {
    "id": "II.counting.multiplicity-switch",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "+M,\\quad-M,\\quad+A,\\quad-A",
    "name": "with or without repetition; with or without order",
    "meaning": "M controls repeated selection of an object; A controls whether order distinguishes outcomes. A plus permits or distinguishes it, and a minus removes it.",
    "aliases": [
      "+M",
      "-M",
      "multiplicity",
      "replacement",
      "repetition",
      "+M,−M",
      "+M,\\quad-M",
      "with repetition; without repetition",
      "+A",
      "-A",
      "arrangement",
      "ordered",
      "unordered",
      "+A,−A",
      "+A,\\quad-A",
      "order matters; order does not matter",
      "+M,−M,+A,−A"
    ],
    "covers": [
      "II.counting.arrangement-switch"
    ]
  },
  {
    "id": "II.counting.factorial",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "n!",
    "name": "n factorial",
    "meaning": "The product of the positive integers through n, with $0!=1$. It counts permutations of n distinct objects.",
    "aliases": [
      "factorial",
      "n!",
      "n factorial"
    ]
  },
  {
    "id": "II.counting.ordered-repetition",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "n^{\\underline{k}}",
    "name": "falling factorial",
    "meaning": "Counts ordered selections without repetition: $n(n-1)\\cdots(n-k+1)$. With repetition, the count is $n^k$.",
    "aliases": [
      "ordered selection with repetition",
      "power rule",
      "nk",
      "n^k",
      "n to the k",
      "falling factorial",
      "underlined exponent",
      "partial permutation",
      "nk‾",
      "n^{\\underline{k}}",
      "n falling k, the falling factorial"
    ],
    "covers": [
      "II.counting.falling-factorial"
    ]
  },
  {
    "id": "II.counting.binomial",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "\\binom nk,\\quad\\binom{n+k-1}{k}",
    "name": "binomial coefficient; multiset selection count",
    "meaning": "The first counts k-element subsets of n objects. The second counts size-k selections allowing repetitions but ignoring order, for n ≥ 1.",
    "aliases": [
      "binomial coefficient",
      "n choose k",
      "combination",
      "(nk)",
      "\\binom nk",
      "multichoose",
      "multiset coefficient",
      "+M -A",
      "(n+k−1k)",
      "\\binom{n+k-1}{k}",
      "n plus k minus one choose k",
      "(nk),(n+k−1k)"
    ],
    "covers": [
      "II.counting.multichoose"
    ]
  },
  {
    "id": "II.counting.multinomial",
    "part": "Part II",
    "topic": "II.counting",
    "tex": "\\binom{n}{n_1,\\ldots,n_k}",
    "name": "the multinomial coefficient",
    "meaning": "For nonnegative counts summing to n, equals $n!/(n_1!\\cdots n_k!)$. Counts arrangements with those multiplicities, or labelled blocks with those prescribed sizes.",
    "aliases": [
      "multinomial coefficient",
      "prescribed block sizes",
      "(nn1,…,nk)",
      "\\binom{n}{n_1,\\ldots,n_k}",
      "the multinomial coefficient"
    ]
  },
  {
    "id": "II.partitions.multiset",
    "part": "Part II",
    "topic": "II.partitions",
    "tex": "\\{a,a,b\\}_M,\\quad\\mu_M(a),\\quad|M|",
    "name": "multiset; multiplicity; total size",
    "meaning": "Order is ignored but repetitions count. $\\mu_M(a)$, $\\#_aM$, or $|M|_a$ counts copies of a; $|M|=\\sum_a\\mu_M(a)$ counts all copies.",
    "aliases": [
      "multiset",
      "bag",
      "subscript M",
      "{a,b,a}M",
      "\\{a,b,a\\}_M",
      "the multiset containing a twice and b once",
      "μ",
      "mu",
      "multiplicity",
      "occurrences",
      "μM(a),#aM,∣M∣a",
      "\\mu_M(a),\\quad\\#_aM,\\quad|M|_a",
      "the multiplicity of a in M",
      "multiset size",
      "total multiplicity",
      "∣M∣=∑aμM(a)",
      "|M|=\\sum_a\\mu_M(a)",
      "the size of a multiset",
      "{a,a,b}M,μM(a),∣M∣"
    ],
    "covers": [
      "II.partitions.multiplicity",
      "II.partitions.multiset-size"
    ]
  },
  {
    "id": "II.partitions.stirling-second",
    "part": "Part II",
    "topic": "II.partitions",
    "tex": "S_{n,k},\\quad s_{n,k}",
    "name": "Stirling numbers of the second and first kinds",
    "meaning": "Capital S counts partitions into k nonempty unordered blocks; lowercase s counts permutations with k disjoint cycles. The latter counts are unsigned here.",
    "aliases": [
      "Stirling second kind",
      "S n k",
      "Sn,k",
      "S_{n,k}",
      "Stirling number of the second kind",
      "Stirling first kind",
      "cycle count",
      "s n k",
      "sn,k",
      "s_{n,k}",
      "unsigned Stirling number of the first kind",
      "Sn,k,sn,k"
    ],
    "covers": [
      "II.partitions.stirling-first"
    ]
  },
  {
    "id": "II.partitions.integer-partition",
    "part": "Part II",
    "topic": "II.partitions",
    "tex": "P_{n,k},\\quad P(n)",
    "name": "integer partitions into k parts; all integer partitions",
    "meaning": "$P_{n,k}$ counts unordered sums of k positive integers giving n. Summing over k gives P(n), which differs from partitions of a labelled set.",
    "aliases": [
      "integer partition",
      "number partition",
      "P n k",
      "Pn,k",
      "P_{n,k}",
      "the number of partitions of n into k parts",
      "partition number",
      "P(n)",
      "P(n)=∑kPn,k",
      "P(n)=\\sum_kP_{n,k}",
      "the partition number of n",
      "Pn,k,P(n)"
    ],
    "covers": [
      "II.partitions.partition-number"
    ]
  },
  {
    "id": "II.partitions.bell",
    "part": "Part II",
    "topic": "II.partitions",
    "tex": "B_n=\\sum_kS_{n,k}",
    "name": "the n-th Bell number",
    "meaning": "Counts all partitions of an n-element set, without fixing the number of blocks. It differs from the integer-partition count P(n).",
    "aliases": [
      "Bell number",
      "B_n",
      "Bn=∑kSn,k",
      "B_n=\\sum_kS_{n,k}",
      "the n-th Bell number"
    ]
  },
  {
    "id": "II.partitions.least-fixed-point",
    "part": "Part II",
    "topic": "II.partitions",
    "tex": "\\mu f",
    "name": "the least fixed point of f",
    "meaning": "For a monotone self-map of a complete lattice, $\\mu f=\\inf\\{a\\mid f(a)\\le a\\}$. This mu has a different role from multiset multiplicity.",
    "aliases": [
      "μ",
      "least fixed point",
      "mu f",
      "Knaster Tarski",
      "μf",
      "\\mu f",
      "the least fixed point of f"
    ]
  },
  {
    "id": "III.graphs.graph",
    "part": "Part III",
    "topic": "III.graphs",
    "tex": "G=(V,E),\\quad\\binom V2",
    "name": "graph; set of two-element vertex subsets",
    "meaning": "V is the vertex set and E the edge set. Directed edges are pairs $(u,v)$; simple undirected edges are two-element sets $\\{u,v\\}$. The set $\\binom V2$ contains all possible simple edges.",
    "aliases": [
      "graph",
      "vertices",
      "nodes",
      "edges",
      "G=(V,E)",
      "a graph with vertex set V and edge set E",
      "directed edge",
      "arrow",
      "loop",
      "self-loop",
      "(u,v)∈E,uEv",
      "(u,v)\\in E,\\quad uEv",
      "an edge from u to v",
      "undirected edge",
      "simple graph",
      "{u,v}∈E",
      "\\{u,v\\}\\in E",
      "an undirected edge between u and v",
      "two-element subsets",
      "possible edges",
      "binomial set",
      "(V2)",
      "\\binom V2",
      "the two-element subsets of V",
      "G=(V,E),(V2)"
    ],
    "covers": [
      "III.graphs.directed-edge",
      "III.graphs.simple-edge",
      "III.graphs.two-subsets"
    ]
  },
  {
    "id": "III.graphs.subgraph",
    "part": "Part III",
    "topic": "III.graphs",
    "tex": "G[W]",
    "name": "induced subgraph",
    "meaning": "Keep the vertices in W and every original edge between them.",
    "aliases": [
      "subgraph",
      "G prime",
      "G′=(V′,E′)",
      "G'=(V',E')",
      "a subgraph G prime",
      "induced subgraph",
      "G[W]",
      "the subgraph induced by W"
    ],
    "covers": [
      "III.graphs.induced"
    ]
  },
  {
    "id": "III.graphs.isomorphism",
    "part": "Part III",
    "topic": "III.graphs",
    "tex": "\\cong,\\quad\\not\\cong,\\quad\\operatorname{Aut}(G)",
    "name": "isomorphic; not isomorphic; automorphisms",
    "meaning": "An isomorphism is a bijection preserving structure: adjacency for graphs, or the operation for groups. The crossed sign denies one exists. Aut(G) contains the graph’s isomorphisms to itself.",
    "aliases": [
      "≅",
      "graph isomorphism",
      "cong",
      "G≅H",
      "G\\cong H",
      "G is isomorphic to H",
      "≇",
      "not isomorphic",
      "G≇H",
      "G\\not\\cong H",
      "G and H are not isomorphic",
      "Aut",
      "automorphism",
      "symmetry",
      "Aut(G)",
      "\\operatorname{Aut}(G)",
      "the automorphisms of G",
      "homomorphism",
      "structure preserving map",
      "h:GA→GB",
      "h:G_A\\to G_B",
      "a group homomorphism",
      "group isomorphism",
      "GA≅GB",
      "G_A\\cong G_B",
      "the groups are isomorphic",
      "≅,≇,Aut⁡(G)"
    ],
    "covers": [
      "III.graphs.not-isomorphic",
      "III.graphs.automorphisms",
      "IV.subgroups.homomorphism",
      "IV.subgroups.isomorphism"
    ]
  },
  {
    "id": "III.graphs.quotient",
    "part": "Part III",
    "topic": "III.graphs",
    "tex": "G/{\\sim}",
    "name": "the quotient graph under equivalence",
    "meaning": "Vertices are equivalence classes. There is an edge between two classes when at least one original edge has endpoints in those classes.",
    "aliases": [
      "quotient graph",
      "condensation",
      "G/∼",
      "G/{\\sim}",
      "the quotient graph under equivalence"
    ]
  },
  {
    "id": "III.graphs.complement",
    "part": "Part III",
    "topic": "III.graphs",
    "tex": "\\overline G",
    "name": "the complement graph",
    "meaning": "For a simple graph on V, keeps V and replaces its edge set by $\\binom V2\\setminus E$. No self-loops are added.",
    "aliases": [
      "complement graph",
      "overbar graph",
      "G‾",
      "\\overline G",
      "the complement graph"
    ]
  },
  {
    "id": "III.paths.distance",
    "part": "Part III",
    "topic": "III.paths",
    "tex": "d(u,v)",
    "name": "the distance from u to v",
    "meaning": "The least number of edges in a directed path from u to v; infinity if none exists. In directed graphs, the two directions can have different distances.",
    "aliases": [
      "distance",
      "shortest path",
      "d(u,v)",
      "the distance from u to v"
    ]
  },
  {
    "id": "III.families.complete",
    "part": "Part III",
    "topic": "III.families",
    "tex": "K_n,\\quad C_n,\\quad P_n",
    "name": "complete graph; cycle graph; path graph",
    "meaning": "The subscript counts vertices. $K_n$ joins every distinct pair; $C_n$ is a ring for $n\\ge3$; $P_n$ is a chain with $n-1$ edges.",
    "aliases": [
      "K_n",
      "complete graph",
      "clique",
      "Kn",
      "the complete graph on n vertices",
      "C_n",
      "cycle graph",
      "Cn",
      "the cycle graph on n vertices",
      "P_n",
      "path graph",
      "Pn",
      "the path graph on n vertices",
      "Kn,Cn,Pn"
    ],
    "covers": [
      "III.families.cycle-graph",
      "III.families.path-graph"
    ]
  },
  {
    "id": "III.families.bipartite",
    "part": "Part III",
    "topic": "III.families",
    "tex": "K_{m,n}",
    "name": "the complete bipartite graph",
    "meaning": "Two disjoint vertex classes of sizes m and n, with every cross-class edge and no edges inside either class.",
    "aliases": [
      "K_m,n",
      "complete bipartite graph",
      "Km,n",
      "K_{m,n}",
      "the complete bipartite graph"
    ]
  },
  {
    "id": "III.families.mesh",
    "part": "Part III",
    "topic": "III.families",
    "tex": "M_{m,n},\\quad Q_d,\\quad B_h",
    "name": "grid; hypercube; perfect binary tree",
    "meaning": "An m by n grid joins horizontal and vertical neighbours. A d-dimensional hypercube joins bit strings differing in one position. B sub h is a perfect binary tree of height h.",
    "aliases": [
      "M_m,n",
      "mesh",
      "grid graph",
      "Mm,n",
      "M_{m,n}",
      "the m by n mesh or grid graph",
      "Q_d",
      "hypercube",
      "Hamming distance one",
      "Qd",
      "the d-dimensional hypercube graph",
      "B_h",
      "perfect binary tree",
      "complete binary tree",
      "Bh",
      "the perfect binary tree of height h",
      "Mm,n,Qd,Bh"
    ],
    "covers": [
      "III.families.hypercube",
      "III.families.binary-tree"
    ]
  },
  {
    "id": "III.families.direct-product",
    "part": "Part III",
    "topic": "III.families",
    "tex": "G_1\\times G_2,\\quad G_1\\square G_2",
    "name": "direct graph product; Cartesian graph product",
    "meaning": "Both have pairs as vertices. The direct product follows an edge in both coordinates simultaneously; the Cartesian product follows one edge while keeping the other coordinate fixed.",
    "aliases": [
      "×",
      "direct graph product",
      "tensor graph product",
      "G1×G2",
      "G_1\\times G_2",
      "the direct product of two graphs",
      "□",
      "Cartesian graph product",
      "box",
      "square",
      "G1□G2",
      "G_1\\square G_2",
      "the Cartesian product of two graphs",
      "G1×G2,G1□G2"
    ],
    "covers": [
      "III.families.cartesian-product"
    ]
  },
  {
    "id": "III.families.disjoint-union",
    "part": "Part III",
    "topic": "III.families",
    "tex": "G\\oplus H",
    "name": "the disjoint union of two graphs",
    "meaning": "Places the graphs in separate components, renaming vertices if necessary to keep their vertex sets disjoint. This circled plus is not logical XOR here.",
    "aliases": [
      "⊕",
      "disjoint union of graphs",
      "graph sum",
      "G⊕H",
      "G\\oplus H",
      "the disjoint union of two graphs"
    ]
  },
  {
    "id": "III.invariants.neighbourhood",
    "part": "Part III",
    "topic": "III.invariants",
    "tex": "\\Gamma(u),\\quad\\deg(u)",
    "name": "neighbourhood; degree",
    "meaning": "In a simple graph, $\\Gamma(u)$ is the set of neighbours of u and $\\deg(u)=|\\Gamma(u)|$.",
    "aliases": [
      "Γ",
      "neighbourhood",
      "neighborhood",
      "gamma",
      "Γ(u)",
      "\\Gamma(u)",
      "Gamma of u, the neighbourhood of u",
      "deg",
      "degree",
      "indegree",
      "outdegree",
      "deg(u)=∣Γ(u)∣",
      "\\deg(u)=|\\Gamma(u)|",
      "the degree of u",
      "degree sequence",
      "graphic sequence",
      "(d1,…,dn)",
      "(d_1,\\ldots,d_n)",
      "the degree sequence",
      "Γ(u),deg⁡(u)"
    ],
    "covers": [
      "III.invariants.degree",
      "III.invariants.degree-sequence"
    ]
  },
  {
    "id": "III.invariants.colouring",
    "part": "Part III",
    "topic": "III.invariants",
    "tex": "\\chi(G)",
    "name": "chromatic number",
    "meaning": "The least number of colours needed so that adjacent vertices have different colours.",
    "aliases": [
      "colouring",
      "coloring",
      "colour map",
      "c:V→N",
      "c:V\\to\\mathbb N",
      "a vertex colouring",
      "χ",
      "chi",
      "chromatic number",
      "χ(G)",
      "\\chi(G)",
      "chi of G, the chromatic number"
    ],
    "covers": [
      "III.invariants.chromatic"
    ]
  },
  {
    "id": "III.invariants.catalan",
    "part": "Part III",
    "topic": "III.invariants",
    "tex": "C_n",
    "name": "Catalan number",
    "meaning": "Counts balanced bracket words with n pairs, or ordered full binary trees with n inner nodes. In graph-family notation, $C_n$ instead names a cycle graph.",
    "aliases": [
      "Catalan number",
      "Dyck word",
      "C_n",
      "Cn=1n+1(2nn)",
      "C_n=\\frac{1}{n+1}\\binom{2n}{n}",
      "the n-th Catalan number",
      "Cn"
    ]
  },
  {
    "id": "IV.divisibility.divides",
    "part": "Part IV",
    "topic": "IV.divisibility",
    "tex": "a\\mid b,\\quad a\\nmid b,\\quad a\\mathbb Z",
    "name": "divides; does not divide; integer multiples",
    "meaning": "$a\\mid b$ means $b=ka$ for some integer k; the crossed bar denies this. $a\\mathbb Z$ collects all integer multiples of a.",
    "aliases": [
      "∣",
      "divides",
      "divisibility",
      "vertical bar",
      "a∣b",
      "a\\mid b",
      "a divides b",
      "∤",
      "does not divide",
      "a∤b",
      "a\\nmid b",
      "a does not divide b",
      "multiples",
      "aZ",
      "integer multiples",
      "a\\mathbb Z",
      "the integer multiples of a",
      "a∣b,a∤b,aZ"
    ],
    "covers": [
      "IV.divisibility.not-divides",
      "IV.divisibility.multiples"
    ]
  },
  {
    "id": "IV.divisibility.gcd",
    "part": "Part IV",
    "topic": "IV.divisibility",
    "tex": "\\gcd(a,b),\\quad\\operatorname{lcm}(a,b)",
    "name": "greatest common divisor; least common multiple",
    "meaning": "These are $\\inf_{\\mid}$ and $\\sup_{\\mid}$ in the nonnegative divisibility order. Signs are ignored; $\\gcd(a,0)=|a|$ and $\\operatorname{lcm}(a,0)=0$.",
    "aliases": [
      "gcd",
      "greatest common divisor",
      "coprime",
      "gcd(a,b)",
      "\\gcd(a,b)",
      "the greatest common divisor of a and b",
      "lcm",
      "least common multiple",
      "lcm(a,b)",
      "\\operatorname{lcm}(a,b)",
      "the least common multiple of a and b",
      "divisor lattice",
      "divisibility order",
      "inf∣,sup∣",
      "\\inf_{\\mid},\\quad\\sup_{\\mid}",
      "infimum and supremum in the divisibility order",
      "gcd⁡(a,b),lcm⁡(a,b)"
    ],
    "covers": [
      "IV.divisibility.lcm",
      "IV.divisibility.divisor-bounds"
    ]
  },
  {
    "id": "IV.divisibility.valuation",
    "part": "Part IV",
    "topic": "IV.divisibility",
    "tex": "\\nu_p(n)",
    "name": "prime multiplicity",
    "meaning": "For positive n, the exponent of the prime p in its factorization; equivalently, the greatest k with $p^k\\mid n$. Set $\\nu_p(0)=\\infty$.",
    "aliases": [
      "ν",
      "nu",
      "p-adic order",
      "valuation",
      "prime multiplicity",
      "νp(n)",
      "\\nu_p(n)",
      "the p-adic order of n",
      "prime factorization",
      "fundamental theorem of arithmetic",
      "n=∏p∈Ppνp(n)",
      "n=\\prod_{p\\in\\mathbb P}p^{\\nu_p(n)}",
      "the prime factorization of n"
    ],
    "covers": [
      "IV.divisibility.prime-factorization"
    ]
  },
  {
    "id": "IV.divisibility.bezout",
    "part": "Part IV",
    "topic": "IV.divisibility",
    "tex": "a\\mathbb Z+b\\mathbb Z",
    "name": "sum of integer-multiple sets",
    "meaning": "All integer combinations $ax+by$; this set equals $\\gcd(a,b)\\mathbb Z$.",
    "aliases": [
      "α",
      "β",
      "alpha",
      "beta",
      "Bezout",
      "Bézout",
      "EEA",
      "gcd(a,b)=αa+βb",
      "\\gcd(a,b)=\\alpha a+\\beta b",
      "a Bézout identity",
      "sum of subgroups",
      "integer combinations",
      "aZ+bZ",
      "a\\mathbb Z+b\\mathbb Z",
      "the sum of two sets of multiples"
    ],
    "covers": [
      "IV.divisibility.sum-of-multiples"
    ]
  },
  {
    "id": "IV.modular.congruence",
    "part": "Part IV",
    "topic": "IV.modular",
    "tex": "a\\equiv_n b,\\quad a\\bmod n",
    "name": "congruent modulo n; remainder",
    "meaning": "Congruence means $n\\mid(a-b)$. For positive n, $a\\bmod n$ is the unique representative in $\\mathbb Z_n=\\{0,\\ldots,n-1\\}$.",
    "aliases": [
      "≡",
      "congruence",
      "modular congruence",
      "a≡nb",
      "a\\equiv_n b",
      "a is congruent to b modulo n",
      "mod",
      "modulo",
      "remainder",
      "a mod n",
      "a\\bmod n",
      "a modulo n",
      "a≡nb,a mod n"
    ],
    "covers": [
      "IV.modular.remainder"
    ]
  },
  {
    "id": "IV.modular.residue-class",
    "part": "Part IV",
    "topic": "IV.modular",
    "tex": "[a]_n=a+n\\mathbb Z,\\quad\\mathbb Z/n\\mathbb Z",
    "name": "residue class; set of residue classes",
    "meaning": "$[a]_n$ is the set of integers congruent to a. $\\mathbb Z/n\\mathbb Z$ collects these classes; its elements are sets, unlike the representatives in $\\mathbb Z_n$.",
    "aliases": [
      "residue class",
      "congruence class",
      "a+nZ",
      "[a]n=a+nZ",
      "[a]_n=a+n\\mathbb Z",
      "the residue class of a modulo n",
      "ℤ/nℤ",
      "quotient integers",
      "Z/nZ",
      "\\mathbb Z/n\\mathbb Z",
      "the integers modulo n",
      "[a]n=a+nZ,Z/nZ"
    ],
    "covers": [
      "IV.modular.quotient"
    ]
  },
  {
    "id": "IV.modular.modular-add",
    "part": "Part IV",
    "topic": "IV.modular",
    "tex": "+_n,\\quad\\cdot_n",
    "name": "addition and multiplication modulo n",
    "meaning": "Perform the ordinary operation and return its standard remainder modulo n. The subscript specifies the modulus.",
    "aliases": [
      "+ₙ",
      "modular addition",
      "plus n",
      "a+nb=(a+b) mod n",
      "a+_n b=(a+b)\\bmod n",
      "addition modulo n",
      "·ₙ",
      "modular multiplication",
      "times n",
      "a⋅nb=(ab) mod n",
      "a\\cdot_n b=(ab)\\bmod n",
      "multiplication modulo n",
      "+n,⋅n"
    ],
    "covers": [
      "IV.modular.modular-multiply"
    ]
  },
  {
    "id": "IV.modular.units",
    "part": "Part IV",
    "topic": "IV.modular",
    "tex": "\\mathbb Z_n^*,\\quad(\\mathbb Z/n\\mathbb Z)^*,\\quad\\varphi(n)",
    "name": "units modulo n; Euler’s totient",
    "meaning": "The star selects multiplicatively invertible remainders or classes: those coprime to n. Their number is $\\varphi(n)$; for a prime p it is $p-1$.",
    "aliases": [
      "ℤₙ*",
      "Zn*",
      "units",
      "coprime remainders",
      "Zn∗",
      "\\mathbb Z_n^*",
      "the coprime remainders modulo n",
      "quotient units",
      "unit group",
      "(Z/nZ)∗",
      "(\\mathbb Z/n\\mathbb Z)^*",
      "the units of the residue-class ring",
      "φ",
      "ϕ",
      "phi",
      "Euler totient",
      "φ(n)=∣Zn∗∣",
      "\\varphi(n)=|\\mathbb Z_n^*|",
      "Euler’s phi or totient function",
      "Zn∗,(Z/nZ)∗,φ(n)"
    ],
    "covers": [
      "IV.modular.quotient-units",
      "IV.modular.totient"
    ]
  },
  {
    "id": "IV.modular.modular-inverse",
    "part": "Part IV",
    "topic": "IV.modular",
    "tex": "a^{-1}\\pmod n",
    "name": "modular inverse",
    "meaning": "Satisfies $aa^{-1}\\equiv_n1$ and exists exactly when $\\gcd(a,n)=1$. Modular division means multiplication by this inverse.",
    "aliases": [
      "modular inverse",
      "inverse modulo",
      "a−1(modn)",
      "a^{-1}\\pmod n",
      "the multiplicative inverse of a modulo n",
      "modular division",
      "finite field division",
      "x/y=x⋅y−1",
      "x/y=x\\cdot y^{-1}",
      "division in the modular field"
    ],
    "covers": [
      "IV.modular.modular-division"
    ]
  },
  {
    "id": "IV.groups.inverse",
    "part": "Part IV",
    "topic": "IV.groups",
    "tex": "a^{-1},\\quad-a,\\quad a^k",
    "name": "group inverse; integer powers",
    "meaning": "The inverse satisfies $aa^{-1}=a^{-1}a=1$, where 1 denotes the group neutral. Additive notation uses $-a$. Integer powers repeat the operation, using the neutral for zero and inverses for negatives.",
    "aliases": [
      "group triple",
      "neutral",
      "identity element",
      "(G,⋅,1),(G,+,0)",
      "(G,\\cdot,1),\\quad(G,+,0)",
      "a group in multiplicative or additive notation",
      "group inverse",
      "inverse element",
      "a−1,−a",
      "a^{-1},\\quad-a",
      "the inverse of a",
      "group power",
      "negative power",
      "ak(k∈Z)",
      "a^k\\quad(k\\in\\mathbb Z)",
      "an integer power in a group",
      "integer multiple in a group",
      "additive notation",
      "ka(k∈Z)",
      "ka\\quad(k\\in\\mathbb Z)",
      "an integer multiple in additive notation",
      "(G,⋅,1),(G,+,0),a−1"
    ],
    "covers": [
      "IV.groups.powers",
      "IV.groups.multiples"
    ]
  },
  {
    "id": "IV.groups.abstract-operation",
    "part": "Part IV",
    "topic": "IV.groups",
    "tex": "\\diamond,\\quad\\oplus,\\quad\\odot,\\quad\\otimes,\\quad\\star",
    "name": "symbols for specified binary operations",
    "meaning": "Their meaning is defined in the surrounding problem. A circled plus need not mean ordinary addition or XOR, and a circled times need not mean multiplication of numbers.",
    "aliases": [
      "⋄",
      "⊕",
      "⊙",
      "⊗",
      "⋆",
      "diamond",
      "oplus",
      "odot",
      "otimes",
      "star",
      "binary operation",
      "⋄,⊕,⊙,⊗,⋆",
      "\\diamond,\\quad\\oplus,\\quad\\odot,\\quad\\otimes,\\quad\\star",
      "symbols for specified binary operations"
    ]
  },
  {
    "id": "IV.groups.one-sided-neutral",
    "part": "Part IV",
    "topic": "IV.groups",
    "tex": "e_\\ell,\\quad e_r",
    "name": "left and right neutral elements",
    "meaning": "For the operation $\\diamond$, a left neutral satisfies $e_\\ell\\diamond a=a$ for every $a$. A right neutral satisfies $a\\diamond e_r=a$ for every $a$. When both exist, they are equal.",
    "aliases": [
      "left neutral", "right neutral", "one-sided identity", "identity on one side", "e_\\ell", "e_r"
    ]
  },
  {
    "id": "IV.groups.left-right",
    "part": "Part IV",
    "topic": "IV.groups",
    "tex": "l_a(x)=ax,\\quad r_a(x)=xa",
    "name": "left and right multiplication by a",
    "meaning": "Both maps are permutations of G. They differ in a noncommutative group and their composition order must be tracked carefully.",
    "aliases": [
      "left translation",
      "right translation",
      "l_a",
      "r_a",
      "la(x)=ax,ra(x)=xa",
      "l_a(x)=ax,\\quad r_a(x)=xa",
      "left and right multiplication by a"
    ]
  },
  {
    "id": "IV.groups.element-order",
    "part": "Part IV",
    "topic": "IV.groups",
    "tex": "\\operatorname{ord}(a),\\quad\\lambda_G,\\quad\\lambda(n)",
    "name": "element order; group exponent; Carmichael function",
    "meaning": "The element order is $|\\langle a\\rangle|$. For finite G, $\\lambda_G$ is the lcm of all element orders. $\\lambda(n)$ is the exponent of the unit group $\\mathbb Z_n^*$.",
    "aliases": [
      "ord",
      "order of element",
      "period",
      "ord(a)=∣⟨a⟩∣",
      "\\operatorname{ord}(a)=|\\langle a\\rangle|",
      "the order of the element a",
      "order of group",
      "group size",
      "∣G∣",
      "|G|",
      "the order of the group",
      "λ",
      "group exponent",
      "lambda G",
      "λG",
      "\\lambda_G",
      "the exponent of G",
      "lambda",
      "Carmichael function",
      "λ(n)=λZn∗",
      "\\lambda(n)=\\lambda_{\\mathbb Z_n^*}",
      "the Carmichael function",
      "ord⁡(a),λG,λ(n)"
    ],
    "covers": [
      "IV.groups.group-order",
      "IV.groups.group-exponent",
      "IV.modular.carmichael"
    ]
  },
  {
    "id": "IV.subgroups.subgroup",
    "part": "Part IV",
    "topic": "IV.subgroups",
    "tex": "H\\le G,\\quad\\langle\\Sigma\\rangle,\\quad xH",
    "name": "subgroup; generated subgroup; left coset",
    "meaning": "$H\\le G$ means subgroup. $\\langle\\Sigma\\rangle$ contains products of generators and their inverses; $\\langle a\\rangle$ is the single-generator case. The coset $xH=\\{xh\\mid h\\in H\\}$.",
    "aliases": [
      "≤",
      "subgroup",
      "H≤G",
      "H\\le G",
      "H is a subgroup of G",
      "⟨Σ⟩",
      "generated subgroup",
      "generating set",
      "\\langle\\Sigma\\rangle",
      "the subgroup generated by Sigma",
      "left coset",
      "coset",
      "xH",
      "xH,x⟨Σ⟩",
      "xH,\\quad x\\langle\\Sigma\\rangle",
      "a left coset of H",
      "⟨a⟩",
      "cyclic subgroup",
      "generated by one element",
      "⟨a⟩=aZ",
      "\\langle a\\rangle=a^{\\mathbb Z}",
      "the subgroup generated by a",
      "additive cyclic subgroup",
      "\\langle a\\rangle=a\\mathbb Z",
      "the additive subgroup generated by a",
      "H≤G,⟨Σ⟩,xH"
    ],
    "covers": [
      "IV.subgroups.generated",
      "IV.subgroups.coset",
      "IV.groups.cyclic-subgroup",
      "IV.groups.additive-cyclic"
    ]
  },
  {
    "id": "IV.subgroups.cayley",
    "part": "Part IV",
    "topic": "IV.subgroups",
    "tex": "\\Gamma(G,\\Sigma)",
    "name": "the Cayley graph of G with respect to Sigma",
    "meaning": "Its vertices are the elements of G and its directed edges are $(x,xa)$ for $a\\in\\Sigma$. This Gamma denotes a graph, unlike the neighbourhood $\\Gamma(u)$.",
    "aliases": [
      "Γ",
      "Cayley graph",
      "gamma",
      "Γ(G,Σ)",
      "\\Gamma(G,\\Sigma)",
      "the Cayley graph of G with respect to Sigma"
    ]
  },
  {
    "id": "IV.subgroups.kernel",
    "part": "Part IV",
    "topic": "IV.subgroups",
    "tex": "\\ker(h)",
    "name": "kernel of a group homomorphism",
    "meaning": "The subgroup $h^{-1}(1_B)$ of elements mapped to the target neutral. The homomorphism is injective exactly when its kernel is $\\{1_A\\}$.",
    "aliases": [
      "ker",
      "kernel",
      "neutral preimage",
      "ker(h)=h−1(1B)",
      "\\ker(h)=h^{-1}(1_B)",
      "the kernel of h",
      "ker⁡(h)"
    ]
  },
  {
    "id": "V.connectives.true",
    "part": "Part V",
    "topic": "V.connectives",
    "tex": "\\top,\\quad\\bot",
    "name": "true; false; top; bottom",
    "meaning": "The formula constants always evaluating to one and zero. In a Boolean algebra they also name its greatest and least elements.",
    "aliases": [
      "⊤",
      "top",
      "true",
      "tautology",
      "\\top",
      "top, the true formula",
      "⊥",
      "bottom",
      "false",
      "contradiction",
      "\\bot",
      "bottom, the false formula",
      "least element",
      "greatest element",
      "⊥,⊤",
      "\\bot,\\quad\\top",
      "the least and greatest elements",
      "⊤,⊥"
    ],
    "covers": [
      "V.connectives.false",
      "V.boolean.bounds"
    ]
  },
  {
    "id": "V.connectives.nand",
    "part": "Part V",
    "topic": "V.connectives",
    "tex": "\\overline\\land,\\quad\\overline\\lor",
    "name": "NAND; NOR",
    "meaning": "The negations of conjunction and disjunction. The bar above the connective is part of the notation.",
    "aliases": [
      "NAND",
      "not and",
      "bar wedge",
      "F∧‾G",
      "F\\mathbin{\\overline\\land}G",
      "F NAND G",
      "NOR",
      "not or",
      "bar vee",
      "F∨‾G",
      "F\\mathbin{\\overline\\lor}G",
      "F NOR G",
      "∧‾,∨‾"
    ],
    "covers": [
      "V.connectives.nor"
    ]
  },
  {
    "id": "V.connectives.big-and",
    "part": "Part V",
    "topic": "V.connectives",
    "tex": "\\bigwedge_i F_i,\\quad\\bigvee_i F_i",
    "name": "indexed conjunction; indexed disjunction",
    "meaning": "All indicated formulas, or at least one, must hold. For finite families these abbreviate repeated connectives. The empty conjunction is $\\top$; the empty disjunction is $\\bot$.",
    "aliases": [
      "⋀",
      "big conjunction",
      "bigwedge",
      "indexed and",
      "⋀i∈IFi",
      "\\bigwedge_{i\\in I}F_i",
      "the conjunction over i in I",
      "⋁",
      "big disjunction",
      "bigvee",
      "indexed or",
      "⋁i∈IFi",
      "\\bigvee_{i\\in I}F_i",
      "the disjunction over i in I",
      "⋀iFi,⋁iFi"
    ],
    "covers": [
      "V.connectives.big-or"
    ]
  },
  {
    "id": "V.propositional.variables",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "V_F,\\quad\\mathrm{Fml}_k,\\quad\\mathrm{Fml}",
    "name": "variables of F; formula-construction stages; formulas",
    "meaning": "$V_F$ contains the propositional variables occurring in F. The stages $\\mathrm{Fml}_k$ unite to form the set $\\mathrm{Fml}$ of well-formed formulas.",
    "aliases": [
      "variable set",
      "V_F",
      "propositional variables",
      "V,VF",
      "V,\\quad V_F",
      "the declared variables; variables occurring in F",
      "Fml",
      "formula grammar",
      "formation rules",
      "Fmlk,Fml",
      "\\mathrm{Fml}_k,\\quad\\mathrm{Fml}",
      "formulas constructed by stage k; all formulas",
      "VF,Fmlk,Fml"
    ],
    "covers": [
      "V.propositional.formulas"
    ]
  },
  {
    "id": "V.propositional.boolean-values",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "\\mathbb B,\\quad\\beta:V'\\to\\{0,1\\}",
    "name": "Boolean values; truth assignment",
    "meaning": "$\\mathbb B=\\{0,1\\}$. An assignment fits F when it covers $V_F$, and is minimal when defined exactly there. $\\{0,1\\}^V$ is the set of total assignments on V.",
    "aliases": [
      "𝔹",
      "Boolean values",
      "truth values",
      "B={0,1}",
      "\\mathbb B=\\{0,1\\}",
      "B, the Boolean truth values",
      "β",
      "beta",
      "valuation",
      "assignment",
      "minimal assignment",
      "β:V′→{0,1}",
      "\\beta:V'\\to\\{0,1\\}",
      "beta, an assignment",
      "assignment space",
      "Boolean cube",
      "{0,1}V",
      "\\{0,1\\}^V",
      "the assignments to V",
      "B,β:V′→{0,1}"
    ],
    "covers": [
      "V.propositional.assignment",
      "V.propositional.all-assignments"
    ]
  },
  {
    "id": "V.propositional.semantics",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "\\llbracket F\\rrbracket",
    "name": "semantics of F",
    "meaning": "Evaluation under a fitting assignment $\\beta$ or structure S gives $\\llbracket F\\rrbracket(\\beta)$ or $\\llbracket F\\rrbracket(S)$, a truth value of zero or one.",
    "aliases": [
      "⟦",
      "⟧",
      "semantic brackets",
      "interpretation",
      "⟦F⟧",
      "\\llbracket F\\rrbracket",
      "the semantics of F",
      "formula evaluation",
      "truth value under assignment",
      "⟦F⟧(β)",
      "\\llbracket F\\rrbracket(\\beta)",
      "the value of F under beta",
      "first-order semantics",
      "formula value in structure",
      "⟦F⟧(S)",
      "\\llbracket F\\rrbracket(S)",
      "the truth value of F in S"
    ],
    "covers": [
      "V.propositional.evaluation",
      "V.fol-semantics.formula-value"
    ]
  },
  {
    "id": "V.propositional.satisfies",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "\\beta\\models F,\\quad S\\models F",
    "name": "satisfies F; is a model of F",
    "meaning": "F evaluates to one under that assignment or structure. The crossed sign $\\not\\models$ means it evaluates to zero there.",
    "aliases": [
      "⊨",
      "⊭",
      "satisfies",
      "falsifies",
      "models",
      "β⊨F,β⊭F",
      "\\beta\\models F,\\quad\\beta\\not\\models F",
      "beta satisfies F; beta falsifies F",
      "model",
      "satisfaction in a structure",
      "S⊨F",
      "S\\models F",
      "S is a model of F",
      "β⊨F,S⊨F"
    ],
    "covers": [
      "V.fol-semantics.model"
    ]
  },
  {
    "id": "V.propositional.truth-set",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "T_F",
    "name": "truth set; syntax tree",
    "meaning": "In semantics, the assignments making F true. In syntax, the tree recording F’s construction. The surrounding context determines which meaning is intended.",
    "aliases": [
      "truth set",
      "satisfying assignments",
      "T_F",
      "TF={β∈Ω∣⟦F⟧(β)=1}",
      "T_F=\\{\\beta\\in\\Omega\\mid\\llbracket F\\rrbracket(\\beta)=1\\}",
      "the truth set of F",
      "syntax tree",
      "parse tree",
      "TF",
      "the syntax tree of F"
    ],
    "covers": [
      "V.propositional.syntax-tree"
    ]
  },
  {
    "id": "V.propositional.valid",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "\\models F,\\quad\\not\\models F",
    "name": "F is valid; F is not valid",
    "meaning": "Validity quantifies over every fitting assignment. Not valid means at least one assignment falsifies F; it does not mean F is unsatisfiable.",
    "aliases": [
      "⊨",
      "⊭",
      "valid",
      "tautology",
      "invalid",
      "⊨F,⊭F",
      "\\models F,\\quad\\not\\models F",
      "F is valid; F is not valid"
    ]
  },
  {
    "id": "V.propositional.consequence",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "F\\models G,\\quad F_1,\\ldots,F_n\\models G",
    "name": "logically entails; follows from the premises",
    "meaning": "Every fitting assignment satisfying the premise or all premises must satisfy G. This relates formulas, rather than being a connective inside one.",
    "aliases": [
      "⊨",
      "entails",
      "semantic consequence",
      "logical consequence",
      "F⊨G",
      "F\\models G",
      "G is a semantic consequence of F",
      "premises",
      "multiple assumptions",
      "entailment",
      "F1,…,Fn⊨G",
      "F_1,\\ldots,F_n\\models G",
      "G follows from the given premises",
      "F⊨G,F1,…,Fn⊨G"
    ],
    "covers": [
      "V.propositional.premises"
    ]
  },
  {
    "id": "V.propositional.equivalence",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "F\\equiv G,\\quad F\\not\\equiv G,\\quad F\\equiv_e G",
    "name": "equivalent; not equivalent; equisatisfiable",
    "meaning": "Equivalence means the same value under every fitting assignment; its negation needs one counterexample. Equisatisfiability only means both formulas have a model or both have none.",
    "aliases": [
      "≡",
      "semantic equivalence",
      "logically equivalent",
      "F≡G",
      "F\\equiv G",
      "F and G are semantically equivalent",
      "≢",
      "not equivalent",
      "counterassignment",
      "F≢G",
      "F\\not\\equiv G",
      "F and G are not semantically equivalent",
      "equisatisfiable",
      "equiv e",
      "equivalence of satisfiability",
      "F≡eG",
      "F\\equiv_e G",
      "F and G are equisatisfiable",
      "F≡G,F≢G,F≡eG"
    ],
    "covers": [
      "V.propositional.not-equivalent",
      "V.propositional.equisatisfiable"
    ]
  },
  {
    "id": "V.propositional.dont-care",
    "part": "Part V",
    "topic": "V.propositional",
    "tex": "*",
    "name": "an unevaluated or irrelevant truth-table entry",
    "meaning": "In short-circuit tables, this marks an entry that need not be computed once the result is determined. It is not an additional truth value.",
    "aliases": [
      "*",
      "asterisk",
      "short circuit",
      "don’t care",
      "dont care",
      "∗",
      "an unevaluated or irrelevant truth-table entry"
    ]
  },
  {
    "id": "V.boolean.complement",
    "part": "Part V",
    "topic": "V.boolean",
    "tex": "\\sim x,\\quad x\\sqsubseteq y",
    "name": "Boolean complement; Boolean order",
    "meaning": "Complement is the unary operation of the Boolean algebra. Its order satisfies $x\\sqsubseteq y$ iff $x\\sqcup y=y$; for sets, this becomes inclusion.",
    "aliases": [
      "∼",
      "Boolean complement",
      "tilde",
      "∼x",
      "\\sim x",
      "the Boolean complement of x",
      "⊑",
      "square order",
      "sqsubseteq",
      "x⊑y",
      "x\\sqsubseteq y",
      "x is below y in the Boolean-algebra order",
      "∼x,x⊑y"
    ],
    "covers": [
      "V.boolean.order"
    ]
  },
  {
    "id": "V.normal.literal",
    "part": "Part V",
    "topic": "V.normal",
    "tex": "\\overline L,\\quad p^1,\\quad p^0",
    "name": "complementary literal; signed variable",
    "meaning": "A literal is p or $\\neg p$; its bar switches these forms. The superscripts select signs: $p^1=p$ and $p^0=\\neg p$.",
    "aliases": [
      "literal",
      "positive literal",
      "negative literal",
      "L∈{p,¬p∣p∈V}",
      "L\\in\\{p,\\neg p\\mid p\\in V\\}",
      "a literal L",
      "complementary literal",
      "bar L",
      "opposite literal",
      "L‾",
      "\\overline L",
      "the complementary literal",
      "literal exponent",
      "p1=p,p0=¬p",
      "p^1=p,\\quad p^0=\\neg p",
      "the positive or negative literal selected by an exponent",
      "L‾,p1,p0"
    ],
    "covers": [
      "V.normal.literal-complement",
      "V.normal.literal-exponent"
    ]
  },
  {
    "id": "V.normal.minterm",
    "part": "Part V",
    "topic": "V.normal",
    "tex": "m_\\beta,\\quad M_\\beta",
    "name": "minterm; maxterm",
    "meaning": "For a total assignment on finitely many variables, the minterm is true only under beta; the maxterm is false only under beta.",
    "aliases": [
      "mβ",
      "minterm",
      "mβ=⋀p∈Vpβ(p)",
      "m_\\beta=\\bigwedge_{p\\in V}p^{\\beta(p)}",
      "the minterm belonging to beta",
      "Mβ",
      "maxterm",
      "Mβ=⋁p∈Vp1−β(p)",
      "M_\\beta=\\bigvee_{p\\in V}p^{1-\\beta(p)}",
      "the maxterm belonging to beta",
      "mβ,Mβ"
    ],
    "covers": [
      "V.normal.maxterm"
    ]
  },
  {
    "id": "V.normal.ite",
    "part": "Part V",
    "topic": "V.normal",
    "tex": "\\operatorname{ITE}(p,q,r)",
    "name": "if p, then q, else r",
    "meaning": "The Boolean function represented by $(p\\land q)\\lor(\\neg p\\land r)$. Its third argument matters when the first is false.",
    "aliases": [
      "ITE",
      "if then else",
      "ITE(p,q,r)",
      "\\operatorname{ITE}(p,q,r)",
      "if p, then q, else r",
      "ITE⁡(p,q,r)"
    ]
  },
  {
    "id": "V.normal.tseytin",
    "part": "Part V",
    "topic": "V.normal",
    "tex": "E_F",
    "name": "Tseytin encoding of F",
    "meaning": "A CNF equisatisfiable with F, constructed using auxiliary variables for subformulas.",
    "aliases": [
      "Tseytin",
      "auxiliary variable",
      "root variable",
      "E_F",
      "EF,qε, q0, q1",
      "E_F,\\quad q_\\varepsilon,\\ q_0,\\ q_1",
      "a Tseytin encoding and its auxiliary variables",
      "EF"
    ]
  },
  {
    "id": "V.normal.substitution",
    "part": "Part V",
    "topic": "V.normal",
    "tex": "F[t/x],\\quad F[t_1/x_1,\\ldots,t_k/x_k]",
    "name": "substitution",
    "meaning": "Replace x by t. A list in one pair of brackets is simultaneous; separate pairs such as $F[t/x][u/y]$ act in order. In first-order formulas avoid capturing free variables.",
    "aliases": [
      "substitution",
      "replacement",
      "[t/x]",
      "F[t/x],F[t1/x1,…,tk/xk]",
      "F[t/x],\\quad F[t_1/x_1,\\ldots,t_k/x_k]",
      "F with t substituted for x",
      "successive substitution",
      "sequential substitution",
      "F[t/x][u/y]",
      "successive substitutions in F",
      "unification",
      "unifier",
      "substitution in resolution",
      "[y/x],[f(y)/x]",
      "[y/x],\\quad[f(y)/x]",
      "substitutions used in unification"
    ],
    "covers": [
      "V.normal.sequential-substitution",
      "V.herbrand.unification"
    ]
  },
  {
    "id": "V.clauses.clause",
    "part": "Part V",
    "topic": "V.clauses",
    "tex": "C,\\quad K,\\quad\\{L\\}",
    "name": "clause; clause set; unit clause",
    "meaning": "A clause is a set of literals interpreted as their disjunction. A clause set is a set of clauses interpreted as their conjunction. A unit clause contains just one literal, forcing it true.",
    "aliases": [
      "clause",
      "literal set",
      "C⊆{p,¬p∣p∈V}",
      "C\\subseteq\\{p,\\neg p\\mid p\\in V\\}",
      "a clause represented as a set of literals",
      "clause set",
      "knowledge base",
      "K",
      "K⊆2{p,¬p∣p∈V}",
      "K\\subseteq 2^{\\{p,\\neg p\\mid p\\in V\\}}",
      "a set of clauses",
      "unit clause",
      "one literal",
      "{L}∈K",
      "\\{L\\}\\in K",
      "a unit clause in K",
      "C,K,{L}"
    ],
    "covers": [
      "V.clauses.clause-set",
      "V.clauses.unit"
    ]
  },
  {
    "id": "V.clauses.empty-objects",
    "part": "Part V",
    "topic": "V.clauses",
    "tex": "\\emptyset\\quad\\text{vs.}\\quad\\{\\emptyset\\}",
    "name": "empty clause set, set containing the empty clause",
    "meaning": "The clause set $\\emptyset$ represents the formula $\\top$ (no clause to satisfy); the clause set $\\{\\emptyset\\}$ represents $\\bot$ (the empty clause cannot be satisfied).",
    "aliases": [
      "∅",
      "{∅}",
      "\\varnothing",
      "empty clause set",
      "empty conjunction",
      "empty disjunction",
      "∅vs.{∅}",
      "\\emptyset\\quad\\text{vs.}\\quad\\{\\emptyset\\}",
      "empty clause set, set containing the empty clause"
    ]
  },
  {
    "id": "V.clauses.empty-clause",
    "part": "Part V",
    "topic": "V.clauses",
    "tex": "\\square",
    "name": "resolution shorthand; end of proof",
    "meaning": "A resolution derivation may label the empty clause $\\emptyset$ with $\\square$. At the end of a written proof, a square marks completion.",
    "aliases": [
      "□",
      "box",
      "empty clause",
      "resolution contradiction",
      "\\square",
      "the empty clause in a resolution proof",
      "QED",
      "end of proof",
      "tombstone"
    ],
    "covers": [
      "I.reading.qed"
    ]
  },
  {
    "id": "V.clauses.resolution-step",
    "part": "Part V",
    "topic": "V.clauses",
    "tex": "\\operatorname{Res}(K),\\quad\\operatorname{Res}^k(K),\\quad\\operatorname{Res}^*(K)",
    "name": "resolution expansion; iteration; closure",
    "meaning": "One expansion retains K and adds its one-step resolvents. The k-th iteration repeats this, starting at K for k = 0. The star collects all clauses obtained in finitely many expansions.",
    "aliases": [
      "Res",
      "resolution operator",
      "Res(K)",
      "\\operatorname{Res}(K)",
      "one resolution expansion of K",
      "resolution iteration",
      "Res k",
      "Resk(K)",
      "\\operatorname{Res}^k(K)",
      "k iterations of resolution expansion",
      "Res*",
      "resolution closure",
      "Res∗(K)=⋃k∈N0Resk(K)",
      "\\operatorname{Res}^*(K)=\\bigcup_{k\\in\\mathbb N_0}\\operatorname{Res}^k(K)",
      "the resolution closure of K",
      "Res⁡(K),Res⁡k(K),Res⁡∗(K)"
    ],
    "covers": [
      "V.clauses.resolution-power",
      "V.clauses.resolution-closure"
    ]
  },
  {
    "id": "V.fol-syntax.vsy",
    "part": "Part V",
    "topic": "V.fol-syntax",
    "tex": "\\mathrm{VSy},\\quad\\mathrm{CSy},\\quad\\mathrm{PSy},\\quad\\mathrm{FSy}",
    "name": "variable; constant; predicate; function symbols",
    "meaning": "The four syntactic symbol sets. A subscript F restricts them to occurrences in F; $\\mathrm{VSy}^{\\mathrm{free}}_F$ keeps variables with a free occurrence.",
    "aliases": [
      "VSy",
      "CSy",
      "variable symbol",
      "constant symbol",
      "VSy,CSy",
      "\\mathrm{VSy},\\quad\\mathrm{CSy}",
      "variable symbols and constant symbols",
      "PSy",
      "FSy",
      "predicate symbol",
      "function symbol",
      "PSy,FSy",
      "\\mathrm{PSy},\\quad\\mathrm{FSy}",
      "predicate symbols and function symbols",
      "symbols in a formula",
      "signature of formula",
      "VSyF, CSyF, PSyF, FSyF",
      "\\mathrm{VSy}_F,\\ \\mathrm{CSy}_F,\\ \\mathrm{PSy}_F,\\ \\mathrm{FSy}_F",
      "the symbols of each type occurring in F",
      "free variables",
      "VSy free",
      "unbound variables",
      "VSyFfree",
      "\\mathrm{VSy}^{\\mathrm{free}}_F",
      "the free variables of F",
      "VSy,CSy,PSy,FSy"
    ],
    "covers": [
      "V.fol-syntax.psy-fsy",
      "V.fol-syntax.symbols-in-formula",
      "V.fol-syntax.free"
    ]
  },
  {
    "id": "V.fol-syntax.arity",
    "part": "Part V",
    "topic": "V.fol-syntax",
    "tex": "\\operatorname{ar}(P),\\quad\\operatorname{ar}(f)",
    "name": "the arity of a predicate or function symbol",
    "meaning": "The number of arguments the symbol takes. A binary predicate names a relation on pairs; a binary function takes two arguments and returns one object.",
    "aliases": [
      "ar",
      "arity",
      "number of arguments",
      "ar(P),ar(f)",
      "\\operatorname{ar}(P),\\quad\\operatorname{ar}(f)",
      "the arity of a predicate or function symbol",
      "ar⁡(P),ar⁡(f)"
    ]
  },
  {
    "id": "V.fol-syntax.terms",
    "part": "Part V",
    "topic": "V.fol-syntax",
    "tex": "\\mathrm{Trm}_k,\\quad\\mathrm{Fml}_k",
    "name": "term stages; formula stages",
    "meaning": "Their unions are $\\mathrm{Trm}$ and $\\mathrm{Fml}$. Terms denote objects; formulas built from predicates, identities, connectives, and quantifiers have truth values.",
    "aliases": [
      "Trm",
      "term",
      "term grammar",
      "Trmk,Trm",
      "\\mathrm{Trm}_k,\\quad\\mathrm{Trm}",
      "terms at construction stage k; all terms",
      "Fml",
      "first-order formula",
      "FOL",
      "Fmlk,Fml",
      "\\mathrm{Fml}_k,\\quad\\mathrm{Fml}",
      "first-order formulas at stage k; all first-order formulas",
      "Trmk,Fmlk"
    ],
    "covers": [
      "V.fol-syntax.formula"
    ]
  },
  {
    "id": "V.fol-semantics.structure",
    "part": "Part V",
    "topic": "V.fol-semantics",
    "tex": "S=(\\Omega_S,I_S)",
    "name": "structure; universe; interpretation",
    "meaning": "A nonempty universe and an interpretation of the required symbols: objects for variables and constants, relations for predicates, and operations for functions.",
    "aliases": [
      "structure",
      "interpretation",
      "model structure",
      "S=(ΩS,IS)",
      "S=(\\Omega_S,I_S)",
      "a structure S",
      "Ω",
      "universe of a structure",
      "domain of structure",
      "ΩS",
      "\\Omega_S",
      "the universe of S",
      "I_S",
      "interpretation map",
      "IS",
      "the interpretation map of S"
    ],
    "covers": [
      "V.fol-semantics.universe",
      "V.fol-semantics.interpretation"
    ]
  },
  {
    "id": "V.fol-semantics.symbol-value",
    "part": "Part V",
    "topic": "V.fol-semantics",
    "tex": "x^S,\\quad a^S,\\quad P^S,\\quad f^S,\\quad t^S",
    "name": "interpretation or value in S",
    "meaning": "Variables, constants, and terms give universe elements; predicates give relations; functions give operations of their stated arity. The superscript identifies the structure, not exponentiation.",
    "aliases": [
      "symbol interpretation",
      "constant value",
      "variable value",
      "xS,aS",
      "x^S,\\quad a^S",
      "the interpretation of x or a in S",
      "predicate interpretation",
      "P superscript S",
      "PS⊆ΩSar(P)",
      "P^S\\subseteq\\Omega_S^{\\operatorname{ar}(P)}",
      "the relation interpreting P in S",
      "function interpretation",
      "f superscript S",
      "fS:ΩSar(f)→ΩS",
      "f^S:\\Omega_S^{\\operatorname{ar}(f)}\\to\\Omega_S",
      "the function interpreting f in S",
      "term evaluation",
      "t superscript S",
      "tS",
      "t^S",
      "the value of term t in S",
      "xS,aS,PS,fS,tS"
    ],
    "covers": [
      "V.fol-semantics.predicate-value",
      "V.fol-semantics.function-value",
      "V.fol-semantics.term-value"
    ]
  },
  {
    "id": "V.fol-semantics.update",
    "part": "Part V",
    "topic": "V.fol-semantics",
    "tex": "S_{x\\mapsto d},\\quad I_S[x\\mapsto d]",
    "name": "S with x interpreted as d",
    "meaning": "Changes the interpretation of x to the universe element d while leaving other interpretations unchanged. Used in evaluating quantifiers.",
    "aliases": [
      "variable update",
      "structure update",
      "assignment update",
      "Sx↦d,IS[x↦d]",
      "S_{x\\mapsto d},\\quad I_S[x\\mapsto d]",
      "S with x interpreted as d"
    ]
  },
  {
    "id": "V.herbrand.ground-universe",
    "part": "Part V",
    "topic": "V.herbrand",
    "tex": "\\mathrm{Trm}_{\\bot,F},\\quad\\mathrm{Trm}_{\\bot,F,k}",
    "name": "ground terms; ground terms at stage k",
    "meaning": "Variable-free terms over the relevant constants and functions. Start with constants, adding one if necessary; later stages apply functions to earlier terms.",
    "aliases": [
      "Trm bottom F",
      "ground term",
      "Herbrand universe",
      "Trm⊥,F",
      "\\mathrm{Trm}_{\\bot,F}",
      "the ground terms of F",
      "ground term stage",
      "Herbrand term depth",
      "Trm⊥,F,k",
      "\\mathrm{Trm}_{\\bot,F,k}",
      "ground terms through construction stage k",
      "Trm⊥,F,Trm⊥,F,k"
    ],
    "covers": [
      "V.herbrand.ground-stage"
    ]
  },
  {
    "id": "V.herbrand.ground-instance",
    "part": "Part V",
    "topic": "V.herbrand",
    "tex": "F^*,\\quad E_{F,k}",
    "name": "quantifier-free matrix; Herbrand expansion",
    "meaning": "$F^*$ names the quantifier-free matrix in prenex or Skolem form. $E_{F,k}$ conjoins its ground instances using terms from $\\mathrm{Trm}_{\\bot,F,k}$.",
    "aliases": [
      "ground instance",
      "ground substitution",
      "F∗[t1/x1,…,tn/xn]",
      "F^*[t_1/x_1,\\ldots,t_n/x_n]",
      "a ground instance of the matrix",
      "Herbrand expansion",
      "E_F,k",
      "EF,k",
      "E_{F,k}",
      "the k-th Herbrand expansion of F",
      "prenex",
      "PNF",
      "matrix of formula",
      "quantifier prefix",
      "Q1x1⋯QkxkF∗",
      "Q_1x_1\\cdots Q_kx_kF^*",
      "a prenex formula with matrix F star",
      "Skolem function",
      "Skolem constant",
      "Skolem normal form",
      "f(x1,…,xk)",
      "f(x_1,\\ldots,x_k)",
      "a Skolem function",
      "F∗,EF,k"
    ],
    "covers": [
      "V.herbrand.expansion",
      "V.fol-syntax.prenex",
      "V.fol-syntax.skolem"
    ]
  }
];

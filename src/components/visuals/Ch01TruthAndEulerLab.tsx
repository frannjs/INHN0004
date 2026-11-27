import React, { useState } from 'react';
import { Tex } from '../math/Tex';

interface FormPreset {
  key: string;
  label: React.ReactNode;
  formulaText: string;
  symbolicTex: string;
  // Truth values for [C0=(F,F), C1=(F,T), C2=(T,F), C3=(T,T)]
  values: [boolean, boolean, boolean, boolean];
  synonyms: string[];
  note: React.ReactNode;
}

const FORM_PRESETS: FormPreset[] = [
  {
    key: 'if-then',
    label: <>if A, then B</>,
    formulaText: 'if A, then B',
    symbolicTex: '(A \\to B)',
    values: [true, true, false, true],
    synonyms: [
      'B or not A',
      'if not B, then not A',
      'not (A and not B)',
    ],
    note: (
      <>
        Only violated in class <Tex math="C_2" /> (<Tex math="A" /> is <code>true</code> and{' '}
        <Tex math="B" /> is <code>false</code>). Whenever the antecedent <Tex math="A" /> is{' '}
        <code>false</code> (<Tex math="C_0, C_1" />), the conditional holds vacuously.
      </>
    ),
  },
  {
    key: 'and',
    label: <>A and B</>,
    formulaText: 'A and B',
    symbolicTex: '(A \\land B)',
    values: [false, false, false, true],
    synonyms: ['not ((not A) or (not B))'],
    note: (
      <>
        Conjunction selects exclusively situation class <Tex math="C_3" />, the lens where both{' '}
        <Tex math="A" /> and <Tex math="B" /> hold simultaneously.
      </>
    ),
  },
  {
    key: 'or',
    label: <>A or B</>,
    formulaText: 'A or B',
    symbolicTex: '(A \\lor B)',
    values: [false, true, true, true],
    synonyms: ['not ((not A) and (not B))', 'if not A, then B'],
    note: (
      <>
        Inclusive disjunction covers <Tex math="C_1, C_2, C_3" />: at least one of{' '}
        <Tex math="A, B" /> is <code>true</code>, including the overlap <Tex math="C_3" />.
      </>
    ),
  },
  {
    key: 'iff',
    label: <>A iff B</>,
    formulaText: 'A iff B',
    symbolicTex: '(A \\leftrightarrow B)',
    values: [true, false, false, true],
    synonyms: [
      '(if A, then B) and (if B, then A)',
      '(not A) iff (not B)',
    ],
    note: (
      <>
        Biconditional selects <Tex math="C_0" /> (both <code>false</code>) and <Tex math="C_3" />{' '}
        (both <code>true</code>): the two propositions share the same truth value.
      </>
    ),
  },
  {
    key: 'xor',
    label: <>either A or B</>,
    formulaText: 'either A or B',
    symbolicTex: '(A \\oplus B)',
    values: [false, true, true, false],
    synonyms: [
      'A iff not B',
      'not (A iff B)',
      '(A or B) and not (A and B)',
    ],
    note: (
      <>
        Exclusive-or selects the two crescent regions <Tex math="C_1" /> and <Tex math="C_2" />{' '}
        where <Tex math="A" /> and <Tex math="B" /> disagree.
      </>
    ),
  },
  {
    key: 'nor',
    label: <>neither A nor B</>,
    formulaText: 'neither A nor B',
    symbolicTex: '\\neg(A \\lor B)',
    values: [true, false, false, false],
    synonyms: ['not (A or B)', '(not A) and (not B)'],
    note: (
      <>
        By De Morgan&apos;s law, negating an inclusive disjunction isolates the outer region{' '}
        <Tex math="C_0" /> where neither <Tex math="A" /> nor <Tex math="B" /> holds.
      </>
    ),
  },
  {
    key: 'mp',
    label: <>Modus Ponens</>,
    formulaText: 'if ((if A, then B) and A), then B',
    symbolicTex: '(((A \\to B) \\land A) \\to B)',
    values: [true, true, true, true],
    synonyms: ['true (valid tautology)'],
    note: (
      <>
        Every single situation class <Tex math="C_0, C_1, C_2, C_3" /> evaluates to{' '}
        <code>true</code>, proving that Modus Ponens is a <strong>valid</strong> propositional form.
      </>
    ),
  },
];

interface EulerCase {
  key: string;
  label: string;
  statement: string;
  formal: React.ReactNode;
  verdict: 'quantifier' | 'valid' | 'invalid';
  diagramType: 'subset' | 'overlap-in' | 'overlap-out' | 'disjoint' | 'mp-valid' | 'mp-converse' | 'some- pig' | 'witches';
  explanation: React.ReactNode;
}

const EULER_CASES: EulerCase[] = [
  {
    key: 'all',
    label: 'All R are P',
    statement: 'All x with R(x) are P(x)',
    formal: <>for all <Tex math="x" />, if <Tex math="R(x)" />, then <Tex math="P(x)" /></>,
    verdict: 'quantifier',
    diagramType: 'subset',
    explanation: (
      <>
        The region of objects satisfying <Tex math="R" /> sits completely inside the region
        satisfying <Tex math="P" />. Refuting it requires a single counterexample{' '}
        <Tex math="d" /> with <Tex math="R(d)" /> and not <Tex math="P(d)" />.
      </>
    ),
  },
  {
    key: 'not-all',
    label: 'Not all R are P',
    statement: 'not all x with R(x) are P(x)',
    formal: <>there exists <Tex math="x" /> with <Tex math="R(x)" /> and not <Tex math="P(x)" /></>,
    verdict: 'quantifier',
    diagramType: 'overlap-out',
    explanation: (
      <>
        Negating a restricted universal quantifier produces an existential witness{' '}
        <Tex math="d" /> (red dot) inside <Tex math="R" /> but outside <Tex math="P" />: a
        counterexample to &ldquo;All <Tex math="R" /> are <Tex math="P" />&rdquo;.
      </>
    ),
  },
  {
    key: 'some',
    label: 'Some R are P',
    statement: 'Some x with R(x) are P(x)',
    formal: <>there exists <Tex math="x" /> with <Tex math="R(x)" /> and <Tex math="P(x)" /></>,
    verdict: 'quantifier',
    diagramType: 'overlap-in',
    explanation: (
      <>
        True if and only if we can exhibit a concrete witness <Tex math="d" /> (green dot) in the
        overlap where both <Tex math="R(d)" /> and <Tex math="P(d)" /> hold.
      </>
    ),
  },
  {
    key: 'none',
    label: 'No R is P',
    statement: 'no x with R(x) is P(x)',
    formal: <>for all <Tex math="x" />, if <Tex math="R(x)" />, then not <Tex math="P(x)" /></>,
    verdict: 'quantifier',
    diagramType: 'disjoint',
    explanation: (
      <>
        Negating &ldquo;Some <Tex math="R" /> are <Tex math="P" />&rdquo; forces the two regions
        to be disjoint: no witness lies in both <Tex math="R" /> and <Tex math="P" />.
      </>
    ),
  },
  {
    key: 'mp-pig',
    label: 'Miss Piggy (Valid)',
    statement: 'If all pigs can fly and Miss Piggy is a pig, then Miss Piggy can fly.',
    formal: (
      <>
        Premises: (for all <Tex math="x" />: if <Tex math="P(x)" />, then <Tex math="Q(x)" />) and{' '}
        <Tex math="P(mp)" />. Conclusion: <Tex math="Q(mp)" />.
      </>
    ),
    verdict: 'valid',
    diagramType: 'mp-valid',
    explanation: (
      <>
        Even though &ldquo;all pigs can fly&rdquo; is empirically false in biology, in any
        situation where <Tex math="P" /> lies inside <Tex math="Q" /> and <Tex math="mp" /> lies
        in <Tex math="P" />, <Tex math="mp" /> is forced inside <Tex math="Q" />. The inference is{' '}
        <strong>valid</strong>.
      </>
    ),
  },
  {
    key: 'mp-conv',
    label: 'Converse (Invalid)',
    statement: 'If all pigs can fly and Miss Piggy can fly, then Miss Piggy is a pig.',
    formal: (
      <>
        Premises: (for all <Tex math="x" />: if <Tex math="P(x)" />, then <Tex math="Q(x)" />) and{' '}
        <Tex math="Q(mp)" />. Claimed conclusion: <Tex math="P(mp)" />.
      </>
    ),
    verdict: 'invalid',
    diagramType: 'mp-converse',
    explanation: (
      <>
        Placing <Tex math="mp" /> inside <Tex math="Q" /> (can fly) but outside <Tex math="P" />{' '}
        (is pig)—for instance, an eagle—makes both premises <code>true</code> and the conclusion{' '}
        <code>false</code>. Hence the argument is <strong>not valid</strong>.
      </>
    ),
  },
  {
    key: 'bedevere',
    label: 'Witches & Wood (Invalid)',
    statement: 'All witches (H) burn (B), and all wood (W) burns (B). Therefore all witches are wood.',
    formal: (
      <>
        Premises: (All <Tex math="H" /> are <Tex math="B" />) and (All <Tex math="W" /> are{' '}
        <Tex math="B" />). Claimed conclusion: All <Tex math="H" /> are <Tex math="W" />.
      </>
    ),
    verdict: 'invalid',
    diagramType: 'witches',
    explanation: (
      <>
        Both <Tex math="H" /> and <Tex math="W" /> sit inside the larger circle <Tex math="B" />,
        but nothing forces <Tex math="H" /> inside <Tex math="W" />: <Tex math="H" /> and{' '}
        <Tex math="W" /> can be completely disjoint subsets of things that burn.
      </>
    ),
  },
];

const CASES_META: { id: string; a: boolean; b: boolean; desc: string }[] = [
  { id: 'C_0', a: false, b: false, desc: 'neither A nor B' },
  { id: 'C_1', a: false, b: true, desc: 'only B (not A)' },
  { id: 'C_2', a: true, b: false, desc: 'only A (not B)' },
  { id: 'C_3', a: true, b: true, desc: 'both A and B' },
];

export const Ch01TruthAndEulerLab: React.FC = () => {
  const [tab, setTab] = useState<'connectives' | 'euler'>('connectives');
  const [values, setValues] = useState<[boolean, boolean, boolean, boolean]>([
    true,
    true,
    false,
    true,
  ]);
  const [hoverCase, setHoverCase] = useState<number | null>(null);
  const [eulerIdx, setEulerIdx] = useState<number>(0);

  const activePreset = FORM_PRESETS.find((p) =>
    p.values.every((v, i) => v === values[i])
  );

  const toggleCase = (idx: number) => {
    setValues((prev) => {
      const next: [boolean, boolean, boolean, boolean] = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const trueCount = values.filter(Boolean).length;
  const statusBadge =
    trueCount === 4
      ? { text: 'Valid (true in all 4 classes)', color: 'var(--m-green)' }
      : trueCount === 0
      ? { text: 'Unsatisfiable (false in all 4 classes)', color: 'var(--m-red)' }
      : { text: `Satisfiable (${trueCount} of 4 classes true, not valid)`, color: 'var(--m-yellow)' };

  const ec = EULER_CASES[eulerIdx];

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 1.1 · Interactive Situation Classifier, Venn Regions, and Euler Inspector
          </div>
          <div className="figure-subtitle">
            {tab === 'connectives'
              ? 'Click any Venn region or truth-table row to toggle true/false across the 4 situation classes C0..C3.'
              : 'Inspect how restricted quantifiers and syllogistic premises constrain regions and witness elements.'}
          </div>
        </div>
        <div className="figure-controls">
          <button
            type="button"
            className={`ctrl-btn ${tab === 'connectives' ? 'active' : ''}`}
            onClick={() => setTab('connectives')}
          >
            Connectives &amp; Venn
          </button>
          <button
            type="button"
            className={`ctrl-btn ${tab === 'euler' ? 'active' : ''}`}
            onClick={() => setTab('euler')}
          >
            Quantifiers &amp; Euler
          </button>
        </div>
      </div>

      {tab === 'connectives' ? (
        <>
          <div
            style={{
              padding: '0 26px 10px',
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {FORM_PRESETS.map((p) => {
              const isAct = p.values.every((v, i) => v === values[i]);
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`ctrl-btn ${isAct ? 'active' : ''}`}
                  onClick={() => setValues([...p.values])}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="visual-split">
            {/* SVG 2-set Venn diagram partitioning situations into C0, C1, C2, C3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg
                viewBox="0 0 380 246"
                style={{ width: '100%', maxWidth: 400, height: 'auto', display: 'block' }}
                role="img"
                aria-label="Two-proposition Venn diagram for situation classes C0, C1, C2, C3"
              >
                <defs>
                  <clipPath id="ch01-clip-a">
                    <circle cx="152" cy="126" r="68" />
                  </clipPath>
                  <clipPath id="ch01-clip-b">
                    <circle cx="228" cy="126" r="68" />
                  </clipPath>
                  <mask id="ch01-mask-c0">
                    <rect x="16" y="16" width="348" height="214" rx="18" fill="white" />
                    <circle cx="152" cy="126" r="68" fill="black" />
                    <circle cx="228" cy="126" r="68" fill="black" />
                  </mask>
                  <mask id="ch01-mask-only-a">
                    <rect x="0" y="0" width="380" height="246" fill="black" />
                    <circle cx="152" cy="126" r="68" fill="white" />
                    <circle cx="228" cy="126" r="68" fill="black" />
                  </mask>
                  <mask id="ch01-mask-only-b">
                    <rect x="0" y="0" width="380" height="246" fill="black" />
                    <circle cx="228" cy="126" r="68" fill="white" />
                    <circle cx="152" cy="126" r="68" fill="black" />
                  </mask>
                </defs>

                {/* Base frame */}
                <rect
                  x="16"
                  y="16"
                  width="348"
                  height="214"
                  rx="18"
                  fill="#08080b"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1.4"
                />

                {/* C0: neither A nor B */}
                <rect
                  x="16"
                  y="16"
                  width="348"
                  height="214"
                  rx="18"
                  mask="url(#ch01-mask-c0)"
                  fill={values[0] ? 'rgba(88, 196, 221, 0.24)' : 'rgba(252, 98, 85, 0.05)'}
                  style={{ cursor: 'pointer', transition: 'fill 0.16s ease' }}
                  onClick={() => toggleCase(0)}
                  onMouseEnter={() => setHoverCase(0)}
                  onMouseLeave={() => setHoverCase(null)}
                />

                {/* C2: only A (A=true, B=false) */}
                <rect
                  x="16"
                  y="16"
                  width="348"
                  height="214"
                  mask="url(#ch01-mask-only-a)"
                  fill={values[2] ? 'rgba(88, 196, 221, 0.30)' : 'rgba(252, 98, 85, 0.08)'}
                  style={{ cursor: 'pointer', transition: 'fill 0.16s ease' }}
                  onClick={() => toggleCase(2)}
                  onMouseEnter={() => setHoverCase(2)}
                  onMouseLeave={() => setHoverCase(null)}
                />

                {/* C1: only B (A=false, B=true) */}
                <rect
                  x="16"
                  y="16"
                  width="348"
                  height="214"
                  mask="url(#ch01-mask-only-b)"
                  fill={values[1] ? 'rgba(88, 196, 221, 0.30)' : 'rgba(252, 98, 85, 0.08)'}
                  style={{ cursor: 'pointer', transition: 'fill 0.16s ease' }}
                  onClick={() => toggleCase(1)}
                  onMouseEnter={() => setHoverCase(1)}
                  onMouseLeave={() => setHoverCase(null)}
                />

                {/* C3: A and B */}
                <g clipPath="url(#ch01-clip-a)">
                  <circle
                    cx="228"
                    cy="126"
                    r="68"
                    fill={values[3] ? 'rgba(131, 193, 103, 0.36)' : 'rgba(252, 98, 85, 0.08)'}
                    style={{ cursor: 'pointer', transition: 'fill 0.16s ease' }}
                    onClick={() => toggleCase(3)}
                    onMouseEnter={() => setHoverCase(3)}
                    onMouseLeave={() => setHoverCase(null)}
                  />
                </g>

                {/* Outlines of A and B */}
                <circle
                  cx="152"
                  cy="126"
                  r="68"
                  fill="none"
                  stroke={hoverCase === 2 || hoverCase === 3 ? '#F4D35E' : 'rgba(255,255,255,0.5)'}
                  strokeWidth="1.8"
                  pointerEvents="none"
                />
                <circle
                  cx="228"
                  cy="126"
                  r="68"
                  fill="none"
                  stroke={hoverCase === 1 || hoverCase === 3 ? '#F4D35E' : 'rgba(255,255,255,0.5)'}
                  strokeWidth="1.8"
                  pointerEvents="none"
                />

                {/* Labels */}
                <text x="34" y="40" fill="#9898a0" fontSize="12" fontFamily="Inter, sans-serif" pointerEvents="none">
                  C0 (F, F): {values[0] ? 'true' : 'false'}
                </text>
                <text x="115" y="122" textAnchor="middle" fill="#fafafa" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif" pointerEvents="none">
                  A
                </text>
                <text x="115" y="140" textAnchor="middle" fill={values[2] ? '#58C4DD' : '#9898a0'} fontSize="11.5" fontFamily="Inter, sans-serif" pointerEvents="none">
                  C2: {values[2] ? 'true' : 'false'}
                </text>

                <text x="265" y="122" textAnchor="middle" fill="#fafafa" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif" pointerEvents="none">
                  B
                </text>
                <text x="265" y="140" textAnchor="middle" fill={values[1] ? '#58C4DD' : '#9898a0'} fontSize="11.5" fontFamily="Inter, sans-serif" pointerEvents="none">
                  C1: {values[1] ? 'true' : 'false'}
                </text>

                <text x="190" y="124" textAnchor="middle" fill="#fafafa" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif" pointerEvents="none">
                  C3
                </text>
                <text x="190" y="140" textAnchor="middle" fill={values[3] ? '#83C167' : '#9898a0'} fontSize="11" fontFamily="Inter, sans-serif" pointerEvents="none">
                  {values[3] ? 'true' : 'false'}
                </text>
              </svg>

              <div
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12.5,
                  color: statusBadge.color,
                  fontWeight: 600,
                }}
              >
                {statusBadge.text}
              </div>
            </div>

            {/* Right: Truth Table & Synonymous Formulations */}
            <div>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>A</th>
                    <th>B</th>
                    <th>Result (click)</th>
                  </tr>
                </thead>
                <tbody>
                  {CASES_META.map((c, idx) => {
                    const activeRow = hoverCase === idx;
                    return (
                      <tr
                        key={c.id}
                        style={{
                          background: activeRow ? 'rgba(244, 211, 94, 0.08)' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleCase(idx)}
                        onMouseEnter={() => setHoverCase(idx)}
                        onMouseLeave={() => setHoverCase(null)}
                      >
                        <td>
                          <Tex math={c.id} />
                        </td>
                        <td style={{ color: c.a ? 'var(--m-green)' : 'var(--ink-muted)' }}>
                          {c.a ? 'true' : 'false'}
                        </td>
                        <td style={{ color: c.b ? 'var(--m-green)' : 'var(--ink-muted)' }}>
                          {c.b ? 'true' : 'false'}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: 999,
                              fontWeight: 600,
                              fontSize: 12.5,
                              color: values[idx] ? '#000' : 'var(--m-red)',
                              background: values[idx]
                                ? 'var(--m-blue)'
                                : 'rgba(252, 98, 85, 0.14)',
                            }}
                          >
                            {values[idx] ? 'true' : 'false'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 14,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.58,
                }}
              >
                {activePreset ? (
                  <>
                    <div style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
                      Form: &ldquo;{activePreset.formulaText}&rdquo; · Formal:{' '}
                      <Tex math={activePreset.symbolicTex} />
                    </div>
                    <div style={{ color: 'var(--m-yellow)', fontSize: 12, marginBottom: 6 }}>
                      Synonymous (syn): {activePreset.synonyms.map((s) => `“${s}”`).join(' · ')}
                    </div>
                    <div style={{ color: 'var(--ink-secondary)' }}>{activePreset.note}</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
                      Custom Boolean Truth Function ({trueCount} of <Tex math="2^2 = 4" /> classes{' '}
                      <code>true</code>)
                    </div>
                    <div style={{ color: 'var(--ink-secondary)' }}>
                      There are <Tex math="2^{4} = 16" /> distinct truth functions on two variables{' '}
                      <Tex math="A, B" />. Any two propositional forms with this exact{' '}
                      <code>true</code>/<code>false</code> column are synonymous.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              padding: '0 26px 10px',
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {EULER_CASES.map((item, i) => (
              <button
                key={item.key}
                type="button"
                className={`ctrl-btn ${eulerIdx === i ? 'active' : ''}`}
                onClick={() => setEulerIdx(i)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="visual-split">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg
                viewBox="0 0 360 230"
                style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }}
                role="img"
                aria-label="Euler diagram for restricted quantifiers and syllogisms"
              >
                <rect
                  x="14"
                  y="14"
                  width="332"
                  height="202"
                  rx="18"
                  fill="#08080b"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="1.4"
                />

                {ec.diagramType === 'subset' && (
                  <>
                    <circle cx="192" cy="115" r="74" fill="rgba(88,196,221,0.10)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="168" cy="120" r="38" fill="rgba(244,211,94,0.16)" stroke="#F4D35E" strokeWidth="2" />
                    <text x="168" y="124" textAnchor="middle" fill="#F4D35E" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">R</text>
                    <text x="236" y="78" textAnchor="middle" fill="#58C4DD" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">P</text>
                  </>
                )}

                {ec.diagramType === 'overlap-out' && (
                  <>
                    <circle cx="212" cy="115" r="64" fill="rgba(88,196,221,0.09)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="144" cy="115" r="52" fill="rgba(244,211,94,0.11)" stroke="#F4D35E" strokeWidth="2" />
                    <circle cx="116" cy="115" r="6" fill="#FC6255" />
                    <text x="116" y="99" textAnchor="middle" fill="#FC6255" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">d (counterexample)</text>
                    <text x="144" y="152" textAnchor="middle" fill="#F4D35E" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">R</text>
                    <text x="242" y="152" textAnchor="middle" fill="#58C4DD" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">P</text>
                  </>
                )}

                {ec.diagramType === 'overlap-in' && (
                  <>
                    <circle cx="208" cy="115" r="64" fill="rgba(88,196,221,0.09)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="148" cy="115" r="52" fill="rgba(244,211,94,0.11)" stroke="#F4D35E" strokeWidth="2" />
                    <circle cx="176" cy="115" r="6" fill="#83C167" />
                    <text x="176" y="99" textAnchor="middle" fill="#83C167" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">d (witness)</text>
                    <text x="122" y="152" textAnchor="middle" fill="#F4D35E" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">R</text>
                    <text x="242" y="152" textAnchor="middle" fill="#58C4DD" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">P</text>
                  </>
                )}

                {ec.diagramType === 'disjoint' && (
                  <>
                    <circle cx="112" cy="115" r="46" fill="rgba(244,211,94,0.11)" stroke="#F4D35E" strokeWidth="2" />
                    <circle cx="244" cy="115" r="56" fill="rgba(88,196,221,0.09)" stroke="#58C4DD" strokeWidth="2" />
                    <text x="112" y="119" textAnchor="middle" fill="#F4D35E" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">R</text>
                    <text x="244" y="119" textAnchor="middle" fill="#58C4DD" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">P</text>
                  </>
                )}

                {ec.diagramType === 'mp-valid' && (
                  <>
                    <circle cx="188" cy="115" r="76" fill="rgba(88,196,221,0.09)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="164" cy="122" r="40" fill="rgba(244,211,94,0.14)" stroke="#F4D35E" strokeWidth="2" />
                    <circle cx="164" cy="122" r="5.5" fill="#83C167" />
                    <text x="164" y="109" textAnchor="middle" fill="#83C167" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">mp</text>
                    <text x="164" y="148" textAnchor="middle" fill="#F4D35E" fontSize="12" fontFamily="Inter, sans-serif">P (is pig)</text>
                    <text x="228" y="68" textAnchor="middle" fill="#58C4DD" fontSize="12.5" fontWeight="600" fontFamily="Inter, sans-serif">Q (can fly)</text>
                  </>
                )}

                {ec.diagramType === 'mp-converse' && (
                  <>
                    <circle cx="188" cy="115" r="76" fill="rgba(88,196,221,0.09)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="148" cy="122" r="36" fill="rgba(244,211,94,0.14)" stroke="#F4D35E" strokeWidth="2" />
                    <circle cx="224" cy="122" r="6" fill="#FC6255" />
                    <text x="224" y="108" textAnchor="middle" fill="#FC6255" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">mp?</text>
                    <text x="148" y="126" textAnchor="middle" fill="#F4D35E" fontSize="12" fontFamily="Inter, sans-serif">P (pig)</text>
                    <text x="218" y="64" textAnchor="middle" fill="#58C4DD" fontSize="12.5" fontWeight="600" fontFamily="Inter, sans-serif">Q (can fly)</text>
                  </>
                )}

                {ec.diagramType === 'witches' && (
                  <>
                    <circle cx="180" cy="115" r="82" fill="rgba(88,196,221,0.08)" stroke="#58C4DD" strokeWidth="2" />
                    <circle cx="136" cy="122" r="30" fill="rgba(252,98,85,0.15)" stroke="#FC6255" strokeWidth="2" />
                    <circle cx="224" cy="122" r="30" fill="rgba(244,211,94,0.14)" stroke="#F4D35E" strokeWidth="2" />
                    <text x="180" y="54" textAnchor="middle" fill="#58C4DD" fontSize="12.5" fontWeight="600" fontFamily="Inter, sans-serif">B (burns)</text>
                    <text x="136" y="126" textAnchor="middle" fill="#FC6255" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">H (witch)</text>
                    <text x="224" y="126" textAnchor="middle" fill="#F4D35E" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">W (wood)</text>
                  </>
                )}
              </svg>
            </div>

            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.62 }}>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color:
                      ec.verdict === 'valid'
                        ? 'var(--m-green)'
                        : ec.verdict === 'invalid'
                        ? 'var(--m-red)'
                        : 'var(--m-blue)',
                    background:
                      ec.verdict === 'valid'
                        ? 'rgba(131,193,103,0.14)'
                        : ec.verdict === 'invalid'
                        ? 'rgba(252,98,85,0.14)'
                        : 'rgba(88,196,221,0.14)',
                  }}
                >
                  {ec.verdict === 'quantifier'
                    ? 'Restricted Quantifier Form'
                    : ec.verdict === 'valid'
                    ? 'Valid Deductive Inference'
                    : 'Invalid Argument (Counterexample Exists)'}
                </span>
              </div>
              <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                &ldquo;{ec.statement}&rdquo;
              </div>
              <div style={{ color: 'var(--m-yellow)', fontSize: 13, marginBottom: 10 }}>
                {ec.formal}
              </div>
              <div style={{ color: 'var(--ink-body)' }}>{ec.explanation}</div>
            </div>
          </div>
        </>
      )}

      <figcaption className="figure-caption">
        Left mode: every propositional form in <Tex math="A, B" /> partitions all conceivable
        situations into <Tex math="2^2 = 4" /> classes <Tex math="C_0, C_1, C_2, C_3" />; two forms
        are synonymous when they select the exact same subset of classes, and a form is valid when
        all four classes are selected. Right mode: Euler diagrams depict predicate extensions so
        witnesses and counterexamples can be inspected directly.
      </figcaption>
    </figure>
  );
};

import React, { useMemo, useState } from 'react';
import { Tex } from '../math/Tex';

interface EeaRow {
  a: number;
  b: number;
  k: number | null;
  r: number;
  alpha: number;
  beta: number;
}

function modPos(x: number, n: number): number {
  return ((x % n) + n) % n;
}

function gcdBasic(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (a !== 0) {
    const t = b % a;
    b = a;
    a = t;
  }
  return b;
}

function computeTotient(n: number): number {
  let count = 0;
  for (let k = 0; k < n; k++) {
    if (gcdBasic(k, n) === 1) count++;
  }
  return count;
}

/**
 * Exact TUM Tabular Extended Euclidean Algorithm (Slides pp. 14-18 & Sheet 10 Ex. 10.1):
 * Maintains d = gcd(a, b) = alpha * a + beta * b on every row, stopping at b mod a == 0
 * with (alpha, beta) = (1, 0), and propagating upward via alpha = beta' - k * alpha', beta = alpha'.
 */
function runTabularEea(aIn: number, bIn: number): { d: number; rows: EeaRow[] } {
  const down: { a: number; b: number; k: number | null; r: number }[] = [];
  let a = aIn;
  let b = bIn;

  if (a === 0) {
    return {
      d: b,
      rows: [{ a: 0, b, k: null, r: 0, alpha: 0, beta: 1 }],
    };
  }

  while (true) {
    const r = b % a;
    if (r === 0) {
      down.push({ a, b, k: null, r: 0 });
      break;
    }
    const k = Math.floor(b / a);
    down.push({ a, b, k, r });
    b = a;
    a = r;
  }

  const d = down[down.length - 1].a;
  const rows: EeaRow[] = new Array(down.length);
  let alphaNext = 1;
  let betaNext = 0;

  for (let i = down.length - 1; i >= 0; i--) {
    const step = down[i];
    if (i === down.length - 1) {
      rows[i] = { ...step, alpha: 1, beta: 0 };
    } else {
      const k = step.k ?? 0;
      const alpha = betaNext - k * alphaNext;
      const beta = alphaNext;
      rows[i] = { ...step, alpha, beta };
      alphaNext = alpha;
      betaNext = beta;
    }
  }

  return { d, rows };
}

interface Preset {
  key: string;
  label: React.ReactNode;
  a: number;
  n: number;
  c: number;
}

const PRESETS: Preset[] = [
  {
    key: 'unit-15',
    label: (
      <>
        Unit: <Tex math="7x \equiv_{15} 4" />
      </>
    ),
    a: 7,
    n: 15,
    c: 4,
  },
  {
    key: 'unit-24',
    label: (
      <>
        Inverse: <Tex math="17x \equiv_{24} 1" />
      </>
    ),
    a: 17,
    n: 24,
    c: 1,
  },
  {
    key: 'mult-sol',
    label: (
      <>
        3 Solutions: <Tex math="6x \equiv_{15} 9" />
      </>
    ),
    a: 6,
    n: 15,
    c: 9,
  },
  {
    key: 'no-sol',
    label: (
      <>
        Unsolvable: <Tex math="6x \equiv_{15} 5" />
      </>
    ),
    a: 6,
    n: 15,
    c: 5,
  },
  {
    key: 'slide-911',
    label: (
      <>
        Large Prime: <Tex math="5x \equiv_{911} 12" />
      </>
    ),
    a: 5,
    n: 911,
    c: 12,
  },
];

export const Ch12EeaAndModularLab: React.FC = () => {
  const [mode, setMode] = useState<'congruence' | 'crt'>('congruence');
  const [a, setA] = useState<number>(7);
  const [n, setN] = useState<number>(15);
  const [c, setC] = useState<number>(4);
  const [selectedRow, setSelectedRow] = useState<number>(0);

  // Two-modulus CRT state: x ≡_m1 u1 and x ≡_m2 u2
  const [m1, setM1] = useState<number>(8);
  const [u1, setU1] = useState<number>(3);
  const [m2, setM2] = useState<number>(5);
  const [u2, setU2] = useState<number>(4);

  const crtEea = useMemo(() => runTabularEea(m1, m2), [m1, m2]);
  const crtCoprime = crtEea.d === 1;
  const crtMod = m1 * m2;
  const crtAlpha = crtEea.rows[0].alpha;
  const crtBeta = crtEea.rows[0].beta;
  const crtSol = crtCoprime ? modPos(u1 * crtBeta * m2 + u2 * crtAlpha * m1, crtMod) : null;

  const { d, rows } = useMemo(() => runTabularEea(a, n), [a, n]);
  const topRow = rows[0];
  const activeIdx = Math.min(selectedRow, rows.length - 1);
  const activeRow = rows[activeIdx];

  const solvable = c % d === 0;
  const nPrimeMod = n / d;
  const invModN = d === 1 ? modPos(topRow.alpha, n) : null;

  const solutions = useMemo(() => {
    if (!solvable) return [];
    const cPrime = c / d;
    const x0 = modPos(topRow.alpha * cPrime, nPrimeMod);
    const list: number[] = [];
    for (let j = 0; j < d; j++) {
      list.push(x0 + j * nPrimeMod);
    }
    return list.sort((u, v) => u - v);
  }, [solvable, c, d, topRow.alpha, nPrimeMod]);

  const applyPreset = (p: Preset) => {
    setA(p.a);
    setN(p.n);
    setC(p.c);
    setSelectedRow(0);
  };

  const adjustN = (delta: number) => {
    const base = n > 24 ? 15 : n;
    const nextN = Math.max(3, Math.min(24, base + delta));
    setN(nextN);
    setA((prev) => Math.max(1, Math.min(nextN - 1, prev)));
    setC((prev) => modPos(prev, nextN));
    setSelectedRow(0);
  };

  const adjustA = (delta: number) => {
    const maxA = n > 30 ? 910 : Math.max(2, n * 2);
    const nextA = Math.max(1, Math.min(maxA, a + delta));
    setA(nextA);
    setSelectedRow(0);
  };

  const adjustC = (delta: number) => {
    setC((prev) => modPos(prev + delta, n));
  };

  const showClock = n <= 24;
  const phiN = useMemo(() => (showClock ? computeTotient(n) : n === 911 ? 910 : 0), [n, showClock]);

  // Precompute clock node coordinates when n <= 24
  const clockNodes = useMemo(() => {
    if (!showClock) return [];
    const cx = 180;
    const cy = 175;
    const rad = 126;
    return Array.from({ length: n }, (_, x) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * x) / n;
      return {
        x,
        px: cx + rad * Math.cos(angle),
        py: cy + rad * Math.sin(angle),
        isUnit: gcdBasic(x, n) === 1,
        target: modPos(a * x, n),
      };
    });
  }, [showClock, n, a]);

  const imageSet = useMemo(() => {
    const s = new Set<number>();
    for (const item of clockNodes) s.add(item.target);
    return s;
  }, [clockNodes]);

  const bezoutTopTex = `${topRow.alpha < 0 ? `(${topRow.alpha})` : topRow.alpha} \\cdot ${a} + ${
    topRow.beta < 0 ? `(${topRow.beta})` : topRow.beta
  } \\cdot ${n} = ${d}`;

  const activeRowTex = `${activeRow.alpha < 0 ? `(${activeRow.alpha})` : activeRow.alpha} \\cdot ${
    activeRow.a
  } + ${activeRow.beta < 0 ? `(${activeRow.beta})` : activeRow.beta} \\cdot ${activeRow.b} = ${d}`;

  const nextBelow = activeIdx < rows.length - 1 ? rows[activeIdx + 1] : null;
  const updateExplainTex = nextBelow
    ? `\\alpha = \\beta' - \\lfloor b/a \\rfloor \\alpha' = ${nextBelow.beta} - ${activeRow.k} \\cdot ${
        nextBelow.alpha < 0 ? `(${nextBelow.alpha})` : nextBelow.alpha
      } = ${activeRow.alpha}, \\quad \\beta = \\alpha' = ${activeRow.beta}`
    : `\\text{Stopping row } (${activeRow.b} \\bmod ${activeRow.a} = 0): \\quad \\alpha = 1,\\; \\beta = 0`;

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Interactive Tabular EEA &amp; Linear Congruence Explorer
          </div>
          <div className="figure-subtitle">
            Trace <Tex math="\gcd(a, n) = \alpha a + \beta n" /> row by row and inspect multiplication{' '}
            <Tex math="x \mapsto (ax) \bmod n" /> on <Tex math="\mathbb{Z}_n" />
          </div>
        </div>
        <div className="figure-controls">
          <button
            type="button"
            className={`ctrl-btn ${mode === 'congruence' ? 'active' : ''}`}
            onClick={() => setMode('congruence')}
          >
            Congruence <Tex math="ax \equiv_n c" />
          </button>
          <button
            type="button"
            className={`ctrl-btn ${mode === 'crt' ? 'active' : ''}`}
            onClick={() => setMode('crt')}
          >
            CRT <Tex math="x \equiv_{m} u,\; x \equiv_{n} v" />
          </button>
          {mode === 'congruence' && PRESETS.map((p) => {
            const isActive = p.a === a && p.n === n && p.c === c;
            return (
              <button
                key={p.key}
                type="button"
                className={`ctrl-btn ${isActive ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'crt' ? (
        <div style={{ padding: '6px 26px 18px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 14,
              alignItems: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              color: 'var(--ink-secondary)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span><Tex math="m" />: <strong>{m1}</strong></span>
              <button type="button" className="ctrl-btn" onClick={() => { const next = Math.max(2, m1 - 1); setM1(next); setU1((v) => modPos(v, next)); }}>-1</button>
              <button type="button" className="ctrl-btn" onClick={() => { const next = Math.min(30, m1 + 1); setM1(next); setU1((v) => modPos(v, next)); }}>+1</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span><Tex math="u" />: <strong style={{ color: 'var(--m-blue)' }}>{u1}</strong></span>
              <button type="button" className="ctrl-btn" onClick={() => setU1((v) => modPos(v - 1, m1))}>-1</button>
              <button type="button" className="ctrl-btn" onClick={() => setU1((v) => modPos(v + 1, m1))}>+1</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span><Tex math="n" />: <strong>{m2}</strong></span>
              <button type="button" className="ctrl-btn" onClick={() => { const next = Math.max(2, m2 - 1); setM2(next); setU2((v) => modPos(v, next)); }}>-1</button>
              <button type="button" className="ctrl-btn" onClick={() => { const next = Math.min(30, m2 + 1); setM2(next); setU2((v) => modPos(v, next)); }}>+1</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span><Tex math="v" />: <strong style={{ color: 'var(--m-yellow)' }}>{u2}</strong></span>
              <button type="button" className="ctrl-btn" onClick={() => setU2((v) => modPos(v - 1, m2))}>-1</button>
              <button type="button" className="ctrl-btn" onClick={() => setU2((v) => modPos(v + 1, m2))}>+1</button>
            </div>
            <button type="button" className="ctrl-btn" onClick={() => { setM1(10); setU1(9); setM2(9); setU2(4); }}>
              Sheet 11: <Tex math="(9 \bmod 10,\; 4 \bmod 9)" />
            </button>
            <button type="button" className="ctrl-btn" onClick={() => { setM1(7); setU1(6); setM2(11); setU2(5); }}>
              Sheet 11: <Tex math="(6 \bmod 7,\; 5 \bmod 11)" />
            </button>
          </div>

          <div className="visual-split">
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '12px 16px', overflowX: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
                Tabular EEA on Moduli <Tex math={`(${m1},\\, ${m2})`} />
              </div>
              <table className="clean-table" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    <th><Tex math="a" /></th>
                    <th><Tex math="b" /></th>
                    <th><Tex math="\lfloor b/a \rfloor" /></th>
                    <th><Tex math="\alpha" /></th>
                    <th><Tex math="\beta" /></th>
                  </tr>
                </thead>
                <tbody>
                  {crtEea.rows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.a}</td>
                      <td>{r.b}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{r.k !== null ? r.k : '—'}</td>
                      <td style={{ color: 'var(--m-yellow)', fontWeight: idx === 0 ? 700 : 500 }}>{r.alpha}</td>
                      <td style={{ color: 'var(--m-yellow)', fontWeight: idx === 0 ? 700 : 500 }}>{r.beta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: crtCoprime ? 'rgba(131, 193, 103, 0.06)' : 'rgba(252, 98, 85, 0.07)',
                boxShadow: crtCoprime ? 'inset 0 0 0 1px rgba(131, 193, 103, 0.18)' : 'inset 0 0 0 1px rgba(252, 98, 85, 0.22)',
                fontSize: 14.5,
              }}
            >
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: crtCoprime ? 'var(--m-green)' : 'var(--m-red)', marginBottom: 6 }}>
                Chinese Remainder Reconstruction
              </div>
              {crtCoprime && crtSol !== null ? (
                <>
                  <div style={{ marginBottom: 6 }}>
                    Bézout identity:{' '}
                    <Tex math={`${crtAlpha < 0 ? `(${crtAlpha})` : crtAlpha} \\cdot ${m1} + ${crtBeta < 0 ? `(${crtBeta})` : crtBeta} \\cdot ${m2} = 1`} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    Basis terms: <Tex math={`\\beta n = ${crtBeta * m2}`} /> (<Tex math={`\\equiv_{${m1}} 1,\\; \\equiv_{${m2}} 0`} />) and{' '}
                    <Tex math={`\\alpha m = ${crtAlpha * m1}`} /> (<Tex math={`\\equiv_{${m1}} 0,\\; \\equiv_{${m2}} 1`} />).
                  </div>
                  <div>
                    <Tex math={`x \\equiv_{${crtMod}} ${u1} \\cdot (${crtBeta * m2}) + ${u2} \\cdot (${crtAlpha * m1}) \\equiv_{${crtMod}} ${crtSol}`} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13.5, color: 'var(--ink-secondary)' }}>
                    Check: <Tex math={`${crtSol} \\bmod ${m1} = ${crtSol % m1}`} /> and <Tex math={`${crtSol} \\bmod ${m2} = ${crtSol % m2}`} />. Solution set:{' '}
                    <Tex math={`${crtSol} + ${crtMod}\\mathbb{Z}`} />.
                  </div>
                </>
              ) : (
                <div>
                  Moduli share <Tex math={`d = \\gcd(${m1}, ${m2}) = ${crtEea.d} > 1`} />, so CRT requires{' '}
                  <Tex math={`u \\equiv_{${crtEea.d}} v`} /> ({(u1 - u2) % crtEea.d === 0 ? 'compatible: reduce to coprime prime powers first' : 'incompatible remainders: solution set is empty'}).
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Parameter stepper bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          padding: '4px 26px 10px',
          alignItems: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: 12.5,
          color: 'var(--ink-secondary)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>
            Multiplier <Tex math="a" />: <strong style={{ color: 'var(--m-blue)' }}>{a}</strong>
          </span>
          <button type="button" className="ctrl-btn" onClick={() => adjustA(-1)}>
            -1
          </button>
          <button type="button" className="ctrl-btn" onClick={() => adjustA(1)}>
            +1
          </button>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>
            Modulus <Tex math="n" />: <strong>{n}</strong>
          </span>
          <button type="button" className="ctrl-btn" onClick={() => adjustN(-1)}>
            -1
          </button>
          <button type="button" className="ctrl-btn" onClick={() => adjustN(1)}>
            +1
          </button>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>
            Target <Tex math="c" />: <strong style={{ color: 'var(--m-yellow)' }}>{c}</strong>
          </span>
          <button type="button" className="ctrl-btn" onClick={() => adjustC(-1)}>
            -1
          </button>
          <button type="button" className="ctrl-btn" onClick={() => adjustC(1)}>
            +1
          </button>
        </div>

        {phiN > 0 && (
          <span style={{ marginLeft: 'auto', color: 'var(--ink-muted)' }}>
            <Tex math={`|\\mathbb{Z}_{${n}}^*| = \\varphi(${n}) = ${phiN}`} />
          </span>
        )}
      </div>

      <div className="visual-split">
        {/* LEFT STAGE: SVG Residue Clock or Large-Modulus Cascade */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {showClock ? (
            <>
              <svg
                viewBox="0 0 360 350"
                style={{ width: '100%', maxWidth: 370, height: 'auto', display: 'block' }}
                role="img"
                aria-label="Modular multiplication map on Z_n"
              >
                <defs>
                  <marker
                    id="ch12-arrow-dim"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="rgba(88, 196, 221, 0.42)" />
                  </marker>
                  <marker
                    id="ch12-arrow-sol"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#83C167" />
                  </marker>
                </defs>

                {/* Faint guide ring */}
                <circle
                  cx={180}
                  cy={175}
                  r={126}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1.2}
                />

                {/* Multiplication chords x -> (a * x) mod n */}
                {clockNodes.map((nd) => {
                  const dest = clockNodes[nd.target];
                  const isSol = solutions.includes(nd.x);
                  if (nd.x === nd.target) {
                    const ang = Math.atan2(nd.py - 175, nd.px - 180);
                    const lx = nd.px + Math.cos(ang) * 20;
                    const ly = nd.py + Math.sin(ang) * 20;
                    return (
                      <circle
                        key={`loop-${nd.x}`}
                        cx={lx}
                        cy={ly}
                        r={9}
                        fill="none"
                        stroke={isSol ? '#83C167' : 'rgba(88, 196, 221, 0.30)'}
                        strokeWidth={isSol ? 2.2 : 1.2}
                      />
                    );
                  }
                  const dx = dest.px - nd.px;
                  const dy = dest.py - nd.py;
                  const dist = Math.hypot(dx, dy) || 1;
                  const rNode = n <= 16 ? 15 : 12;
                  const sx = nd.px + (dx / dist) * (rNode + 2);
                  const sy = nd.py + (dy / dist) * (rNode + 2);
                  const ex = dest.px - (dx / dist) * (rNode + 4);
                  const ey = dest.py - (dy / dist) * (rNode + 4);

                  return (
                    <line
                      key={`edge-${nd.x}`}
                      x1={sx}
                      y1={sy}
                      x2={ex}
                      y2={ey}
                      stroke={isSol ? '#83C167' : 'rgba(88, 196, 221, 0.28)'}
                      strokeWidth={isSol ? 2.4 : 1.25}
                      markerEnd={isSol ? 'url(#ch12-arrow-sol)' : 'url(#ch12-arrow-dim)'}
                    />
                  );
                })}

                {/* Residue vertices */}
                {clockNodes.map((nd) => {
                  const isSol = solutions.includes(nd.x);
                  const isTarget = nd.x === c;
                  const inImage = imageSet.has(nd.x);
                  const rNode = n <= 16 ? 15 : 12;

                  let stroke = nd.isUnit ? '#58C4DD' : 'rgba(255,255,255,0.22)';
                  let fill = '#08090C';
                  if (isTarget && !solvable) {
                    stroke = '#FC6255';
                    fill = 'rgba(252, 98, 85, 0.18)';
                  } else if (isSol && isTarget) {
                    stroke = '#F4D35E';
                    fill = 'rgba(131, 193, 103, 0.25)';
                  } else if (isSol) {
                    stroke = '#83C167';
                    fill = 'rgba(131, 193, 103, 0.20)';
                  } else if (isTarget) {
                    stroke = '#F4D35E';
                    fill = 'rgba(244, 211, 94, 0.18)';
                  }

                  return (
                    <g
                      key={`node-${nd.x}`}
                      onClick={() => setC(nd.x)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={nd.px}
                        cy={nd.py}
                        r={rNode}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSol || isTarget ? 2.4 : nd.isUnit ? 1.7 : 1.1}
                        strokeDasharray={!inImage && !isTarget ? '2.5 2.5' : undefined}
                      />
                      <text
                        x={nd.px}
                        y={nd.py + 4}
                        textAnchor="middle"
                        fill={
                          isSol
                            ? '#83C167'
                            : isTarget
                              ? solvable
                                ? '#F4D35E'
                                : '#FC6255'
                              : nd.isUnit
                                ? '#FAFAFA'
                                : '#7A7A85'
                        }
                        fontSize={n <= 16 ? 11.5 : 9.8}
                        fontFamily="var(--font-mono)"
                        fontWeight={isSol || isTarget ? 700 : 500}
                      >
                        {nd.x}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--ink-muted)',
                  textAlign: 'center',
                }}
              >
                Click any residue on <Tex math="\mathbb{Z}_n" /> to set target <Tex math="c" />.{' '}
                <span style={{ color: 'var(--m-blue)' }}>Blue rings</span> = units in{' '}
                <Tex math="\mathbb{Z}_n^*" />;{' '}
                <span style={{ color: 'var(--m-green)' }}>green</span> = solutions{' '}
                <Tex math="x" />; <span style={{ color: 'var(--m-yellow)' }}>yellow</span> = target{' '}
                <Tex math="c" />.
              </div>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                padding: '18px 20px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.025)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--m-blue)',
                  marginBottom: 10,
                }}
              >
                Large-Modulus Remainder Cascade (<Tex math={`n = ${n}`} />)
              </div>
              {rows.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    marginBottom: 6,
                    background:
                      idx === activeIdx ? 'rgba(244, 211, 94, 0.08)' : 'rgba(255,255,255,0.015)',
                    fontSize: 14.5,
                  }}
                >
                  {r.k !== null ? (
                    <Tex math={`${r.b} = ${r.k} \\cdot ${r.a} + ${r.r}`} />
                  ) : (
                    <Tex math={`${r.b} = ${r.b / r.a} \\cdot ${r.a} + 0 \\quad (\\gcd = ${d})`} />
                  )}
                </div>
              ))}
              <div style={{ fontSize: 13, color: 'var(--ink-secondary)', marginTop: 8 }}>
                Switch to a modulus <Tex math="n \le 24" /> above to inspect the full residue-ring
                multiplication graph.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT STAGE: Tabular EEA & Congruence Solution Readout */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--ink-muted)',
              marginBottom: 8,
            }}
          >
            Tabular Extended Euclidean Algorithm (Click a row to inspect)
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              padding: '10px 14px',
              overflowX: 'auto',
            }}
          >
            <table className="clean-table" style={{ fontSize: 14 }}>
              <thead>
                <tr>
                  <th>
                    <Tex math="a" />
                  </th>
                  <th>
                    <Tex math="b" />
                  </th>
                  <th>
                    <Tex math="\lfloor b/a \rfloor" />
                  </th>
                  <th>
                    <Tex math="\alpha" />
                  </th>
                  <th>
                    <Tex math="\beta" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const isSel = idx === activeIdx;
                  const isBase = idx === rows.length - 1;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRow(idx)}
                      style={{
                        cursor: 'pointer',
                        background: isSel ? 'rgba(244, 211, 94, 0.10)' : 'transparent',
                      }}
                    >
                      <td style={{ color: isBase ? 'var(--m-green)' : 'var(--ink)', fontWeight: isBase ? 700 : 500 }}>
                        {r.a}
                      </td>
                      <td>{r.b}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{r.k !== null ? r.k : '—'}</td>
                      <td style={{ color: 'var(--m-yellow)', fontWeight: idx === 0 ? 700 : 500 }}>
                        {r.alpha}
                      </td>
                      <td style={{ color: 'var(--m-yellow)' }}>{r.beta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Active Row Explanation */}
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(244, 211, 94, 0.055)',
              boxShadow: 'inset 0 0 0 1px rgba(244, 211, 94, 0.16)',
              fontSize: 14.5,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--m-yellow)',
                marginBottom: 4,
              }}
            >
              Row {activeIdx + 1} Invariant &amp; Back-Substitution
            </div>
            <div>
              <Tex math={activeRowTex} />
            </div>
            <div style={{ marginTop: 4, fontSize: 13.5, color: 'var(--ink-secondary)' }}>
              <Tex math={updateExplainTex} />
            </div>
          </div>

          {/* Congruence Verdict */}
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: solvable
                ? 'rgba(131, 193, 103, 0.06)'
                : 'rgba(252, 98, 85, 0.07)',
              boxShadow: solvable
                ? 'inset 0 0 0 1px rgba(131, 193, 103, 0.18)'
                : 'inset 0 0 0 1px rgba(252, 98, 85, 0.22)',
              fontSize: 14.5,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: solvable ? 'var(--m-green)' : 'var(--m-red)',
                marginBottom: 4,
              }}
            >
              Linear Congruence Verdict: <Tex math={`${a}x \\equiv_{${n}} ${c}`} />
            </div>
            <div style={{ marginBottom: 4 }}>
              Top Bezout row: <Tex math={bezoutTopTex} />
              {invModN !== null && (
                <>
                  {' '}
                  so <Tex math={`${a}^{-1} \\bmod ${n} = ${invModN}`} />.
                </>
              )}
            </div>
            {solvable ? (
              <div style={{ color: 'var(--ink-body)', fontSize: 14 }}>
                Since <Tex math={`d = \\gcd(${a}, ${n}) = ${d} \\mid ${c}`} />, there{' '}
                {d === 1 ? 'is a unique solution' : `are d = ${d} solutions`} in{' '}
                <Tex math={`\\mathbb{Z}_{${n}}`} />:{' '}
                <Tex math={`x \\in \\{${solutions.join(',\\, ')}\\}`} />.
              </div>
            ) : (
              <div style={{ color: 'var(--m-red)', fontSize: 14 }}>
                Since <Tex math={`d = \\gcd(${a}, ${n}) = ${d} \\nmid ${c}`} />,{' '}
                <Tex math={`${c} \\notin ${a}\\mathbb{Z} + ${n}\\mathbb{Z} = ${d}\\mathbb{Z}`} />: the
                solution set is <Tex math="\emptyset" />.
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      <figcaption className="figure-caption">
        When <Tex math="\gcd(a, n) = 1" />, multiplication by <Tex math="a" /> modulo <Tex math="n" />{' '}
        permutes <Tex math="\mathbb{Z}_n" /> and hits every target <Tex math="c" /> once via{' '}
        <Tex math="x = (\alpha c) \bmod n" />. When <Tex math="d = \gcd(a, n) > 1" />, the map
        collapses <Tex math="d" />-to-<Tex math="1" /> onto the subgroup <Tex math="d\mathbb{Z}_n" />:
        targets outside <Tex math="d\mathbb{Z}_n" /> have zero preimages, while targets inside{' '}
        <Tex math="d\mathbb{Z}_n" /> have <Tex math="d" /> preimages spaced by <Tex math="n/d" />.
      </figcaption>
    </figure>
  );
};

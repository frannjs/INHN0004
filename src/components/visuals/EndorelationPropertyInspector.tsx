import React, { useMemo, useState } from 'react';
import { InteractiveMatrix, CellAccent } from '../math/InteractiveMatrix';
import { Tex } from '../math/Tex';

interface GraphPreset {
  key: string;
  label: React.ReactNode;
  labels: string[];
  matrix: number[][];
}

const PRESETS: GraphPreset[] = [
  {
    key: 'g1',
    label: <Tex math="\mathrm{Id}_{[4]}" />,
    labels: ['1', '2', '3', '4'],
    matrix: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
  {
    key: 'g2',
    label: <>3-Cycle + Loop</>,
    labels: ['1', '2', '3', '4'],
    matrix: [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 1],
    ],
  },
  {
    key: 'g3',
    label: <>Sym. + Loop</>,
    labels: ['1', '2', '3', '4'],
    matrix: [
      [0, 1, 0, 0],
      [1, 0, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1],
    ],
  },
  {
    key: 'g6',
    label: <Tex math="\le_{[4]}" />,
    labels: ['1', '2', '3', '4'],
    matrix: [
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
    ],
  },
  {
    key: 'sh4-r',
    label: <>Relation <Tex math="R" /></>,
    labels: ['1', '2', '3', '4', '5'],
    matrix: [
      [0, 0, 0, 0, 0],
      [1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
    ],
  },
  {
    key: 'sh4-s',
    label: <>Relation <Tex math="S" /></>,
    labels: ['1', '2', '3', '4', '5'],
    matrix: [
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 0],
      [0, 1, 0, 1, 1],
      [0, 0, 0, 1, 0],
    ],
  },
  {
    key: 'empty',
    label: <Tex math="\emptyset" />,
    labels: ['1', '2', '3', '4'],
    matrix: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
];

interface PropertyCheck {
  id: string;
  name: string;
  formulaTex: string;
  holds: boolean;
  reasonTex: string;
  witnessEdges: [number, number][];
  missingEdge: [number, number] | null;
}

function transposeMat(M: number[][]): number[][] {
  const n = M.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => M[j][i]));
}

function boolMul(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => {
      for (let k = 0; k < n; k++) if (A[i][k] && B[k][j]) return 1;
      return 0;
    })
  );
}

function boolOr(A: number[][], B: number[][]): number[][] {
  return A.map((r, i) => r.map((v, j) => (v || B[i][j] ? 1 : 0)));
}

function boolAnd(A: number[][], B: number[][]): number[][] {
  return A.map((r, i) => r.map((v, j) => (v && B[i][j] ? 1 : 0)));
}

function boolDiff(A: number[][], B: number[][]): number[][] {
  return A.map((r, i) => r.map((v, j) => (v && !B[i][j] ? 1 : 0)));
}

function computePlus(M: number[][]): number[][] {
  const n = M.length;
  let acc = M.map((r) => [...r]);
  let cur = M.map((r) => [...r]);
  for (let step = 2; step <= n; step++) {
    cur = boolMul(cur, M);
    acc = boolOr(acc, cur);
  }
  return acc;
}

function computeStar(M: number[][]): number[][] {
  const n = M.length;
  const id = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
  );
  return boolOr(id, computePlus(M));
}

function analyzeProperties(M: number[][], labels: string[]): PropertyCheck[] {
  const n = M.length;
  const results: PropertyCheck[] = [];

  let reflMissing: number | null = null;
  for (let i = 0; i < n; i++) {
    if (M[i][i] === 0) {
      reflMissing = i;
      break;
    }
  }
  results.push({
    id: 'refl',
    name: 'Reflexive',
    formulaTex: '\\mathrm{Id}_A \\subseteq R',
    holds: reflMissing === null,
    reasonTex:
      reflMissing === null
        ? '\\forall a \\in A:\\; (a,a) \\in R'
        : `(${labels[reflMissing]},${labels[reflMissing]}) \\notin R`,
    witnessEdges: [],
    missingEdge: reflMissing === null ? null : [reflMissing, reflMissing],
  });

  let irreflBad: number | null = null;
  for (let i = 0; i < n; i++) {
    if (M[i][i] === 1) {
      irreflBad = i;
      break;
    }
  }
  results.push({
    id: 'irrefl',
    name: 'Irreflexive',
    formulaTex: '\\mathrm{Id}_A \\cap R = \\emptyset',
    holds: irreflBad === null,
    reasonTex:
      irreflBad === null
        ? '\\forall a \\in A:\\; (a,a) \\notin R'
        : `(${labels[irreflBad]},${labels[irreflBad]}) \\in R`,
    witnessEdges: irreflBad === null ? [] : [[irreflBad, irreflBad]],
    missingEdge: null,
  });

  let symWitness: [number, number] | null = null;
  for (let i = 0; i < n && !symWitness; i++) {
    for (let j = 0; j < n; j++) {
      if (M[i][j] === 1 && M[j][i] === 0) {
        symWitness = [i, j];
        break;
      }
    }
  }
  results.push({
    id: 'sym',
    name: 'Symmetric',
    formulaTex: 'R^\\top = R',
    holds: symWitness === null,
    reasonTex:
      symWitness === null
        ? 'M_R = M_R^\\top'
        : `(${labels[symWitness[0]]},${labels[symWitness[1]]}) \\in R,\\; (${labels[symWitness[1]]},${labels[symWitness[0]]}) \\notin R`,
    witnessEdges: symWitness ? [symWitness] : [],
    missingEdge: symWitness ? [symWitness[1], symWitness[0]] : null,
  });

  let antiWitness: [number, number] | null = null;
  for (let i = 0; i < n && !antiWitness; i++) {
    for (let j = i + 1; j < n; j++) {
      if (M[i][j] === 1 && M[j][i] === 1) {
        antiWitness = [i, j];
        break;
      }
    }
  }
  results.push({
    id: 'antisym',
    name: 'Antisymmetric',
    formulaTex: 'R \\cap R^\\top \\subseteq \\mathrm{Id}_A',
    holds: antiWitness === null,
    reasonTex:
      antiWitness === null
        ? 'R \\cap R^\\top \\subseteq \\mathrm{Id}_A'
        : `(${labels[antiWitness[0]]},${labels[antiWitness[1]]}), (${labels[antiWitness[1]]},${labels[antiWitness[0]]}) \\in R \\text{ with } ${labels[antiWitness[0]]} \\neq ${labels[antiWitness[1]]}`,
    witnessEdges: antiWitness
      ? [
          [antiWitness[0], antiWitness[1]],
          [antiWitness[1], antiWitness[0]],
        ]
      : [],
    missingEdge: null,
  });

  const asymHolds = irreflBad === null && antiWitness === null;
  results.push({
    id: 'asym',
    name: 'Asymmetric',
    formulaTex: 'R \\cap R^\\top = \\emptyset',
    holds: asymHolds,
    reasonTex: asymHolds
      ? 'R \\cap R^\\top = \\emptyset'
      : irreflBad !== null
      ? `(${labels[irreflBad]},${labels[irreflBad]}) \\in R \\cap R^\\top`
      : `(${labels[antiWitness![0]]},${labels[antiWitness![1]]}) \\in R \\cap R^\\top`,
    witnessEdges:
      irreflBad !== null
        ? [[irreflBad, irreflBad]]
        : antiWitness
        ? [
            [antiWitness[0], antiWitness[1]],
            [antiWitness[1], antiWitness[0]],
          ]
        : [],
    missingEdge: null,
  });

  let transTriple: [number, number, number] | null = null;
  for (let i = 0; i < n && !transTriple; i++) {
    for (let k = 0; k < n && !transTriple; k++) {
      if (M[i][k] === 1) {
        for (let j = 0; j < n; j++) {
          if (M[k][j] === 1 && M[i][j] === 0) {
            transTriple = [i, k, j];
            break;
          }
        }
      }
    }
  }
  results.push({
    id: 'trans',
    name: 'Transitive',
    formulaTex: 'RR \\subseteq R',
    holds: transTriple === null,
    reasonTex:
      transTriple === null
        ? 'RR \\subseteq R'
        : `(${labels[transTriple[0]]},${labels[transTriple[1]]}), (${labels[transTriple[1]]},${labels[transTriple[2]]}) \\in R,\\; (${labels[transTriple[0]]},${labels[transTriple[2]]}) \\notin R`,
    witnessEdges: transTriple
      ? [
          [transTriple[0], transTriple[1]],
          [transTriple[1], transTriple[2]],
        ]
      : [],
    missingEdge: transTriple ? [transTriple[0], transTriple[2]] : null,
  });

  const isEq = reflMissing === null && symWitness === null && transTriple === null;
  results.push({
    id: 'eq',
    name: 'Equivalence Relation',
    formulaTex: '\\mathrm{Id}_A \\subseteq R,\\; R^\\top = R,\\; RR \\subseteq R',
    holds: isEq,
    reasonTex: isEq
      ? '\\text{reflexive, symmetric, and transitive}'
      : '\\text{fails at least one of reflexive, symmetric, transitive}',
    witnessEdges: [],
    missingEdge:
      reflMissing !== null
        ? [reflMissing, reflMissing]
        : symWitness
        ? [symWitness[1], symWitness[0]]
        : transTriple
        ? [transTriple[0], transTriple[2]]
        : null,
  });

  const isPO = reflMissing === null && antiWitness === null && transTriple === null;
  results.push({
    id: 'po',
    name: 'Partial Order',
    formulaTex: '\\mathrm{Id}_A \\subseteq R,\\; R \\cap R^\\top \\subseteq \\mathrm{Id}_A,\\; RR \\subseteq R',
    holds: isPO,
    reasonTex: isPO
      ? '\\text{reflexive, antisymmetric, and transitive}'
      : '\\text{fails at least one of reflexive, antisymmetric, transitive}',
    witnessEdges: antiWitness
      ? [
          [antiWitness[0], antiWitness[1]],
          [antiWitness[1], antiWitness[0]],
        ]
      : [],
    missingEdge:
      reflMissing !== null
        ? [reflMissing, reflMissing]
        : transTriple
        ? [transTriple[0], transTriple[2]]
        : null,
  });

  let incompPair: [number, number] | null = null;
  for (let i = 0; i < n && !incompPair; i++) {
    for (let j = i + 1; j < n; j++) {
      if (M[i][j] === 0 && M[j][i] === 0) {
        incompPair = [i, j];
        break;
      }
    }
  }
  const isTotal = isPO && incompPair === null;
  results.push({
    id: 'total',
    name: 'Total Order',
    formulaTex: 'R \\cup R^\\top = A \\times A',
    holds: isTotal,
    reasonTex: isTotal
      ? '\\text{partial order with } R \\cup R^\\top = A \\times A'
      : !isPO
      ? '\\text{not a partial order}'
      : `(${labels[incompPair![0]]},${labels[incompPair![1]]}) \\notin R \\cup R^\\top`,
    witnessEdges: [],
    missingEdge: isPO && incompPair ? [incompPair[0], incompPair[1]] : null,
  });

  let swoBadTriple: [number, number, number] | null = null;
  const I = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (M[i][j] === 0 && M[j][i] === 0 ? 1 : 0))
  );
  for (let i = 0; i < n && !swoBadTriple; i++) {
    for (let k = 0; k < n && !swoBadTriple; k++) {
      if (I[i][k]) {
        for (let j = 0; j < n; j++) {
          if (I[k][j] && !I[i][j]) {
            swoBadTriple = [i, k, j];
            break;
          }
        }
      }
    }
  }
  const isSWO = asymHolds && transTriple === null && swoBadTriple === null;
  results.push({
    id: 'swo',
    name: 'Strict Weak Ordering',
    formulaTex: 'R \\cap R^\\top = \\emptyset,\\; RR \\subseteq R,\\; II \\subseteq I',
    holds: isSWO,
    reasonTex: isSWO
      ? '\\text{asymmetric, transitive, and incomparability } I \\text{ is transitive}'
      : !asymHolds || transTriple !== null
      ? '\\text{not a strict order}'
      : `(${labels[swoBadTriple![0]]},${labels[swoBadTriple![1]]}), (${labels[swoBadTriple![1]]},${labels[swoBadTriple![2]]}) \\in I,\\; (${labels[swoBadTriple![0]]},${labels[swoBadTriple![2]]}) \\notin I`,
    witnessEdges: [],
    missingEdge: null,
  });

  return results;
}

function getLayoutNodes(n: number): [number, number][] {
  if (n === 4) {
    // Official layout: 2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right
    return [
      [105, 234], // 1
      [105, 86],  // 2
      [255, 234], // 3
      [255, 86],  // 4
    ];
  }
  const cx = 180;
  const cy = 164;
  const r = 104;
  return Array.from({ length: n }, (_, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
}

export const EndorelationPropertyInspector: React.FC = () => {
  const [labels, setLabels] = useState<string[]>(PRESETS[1].labels);
  const [matrix, setMatrix] = useState<number[][]>(() =>
    PRESETS[1].matrix.map((r) => [...r])
  );
  const [selectedPropId, setSelectedPropId] = useState<string>('trans');

  const checks = useMemo(() => analyzeProperties(matrix, labels), [matrix, labels]);
  const activeCheck = checks.find((c) => c.id === selectedPropId) || checks[0];

  const loadPreset = (p: GraphPreset) => {
    setLabels(p.labels);
    setMatrix(p.matrix.map((r) => [...r]));
  };

  const toggleCell = (r: number, c: number) => {
    setMatrix((prev) =>
      prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? 1 - v : v)))
    );
  };

  const applyOp = (op: string) => {
    setMatrix((prev) => {
      const RT = transposeMat(prev);
      const RStar = computeStar(prev);
      switch (op) {
        case 'RT':
          return RT;
        case 'RR':
          return boolMul(prev, prev);
        case 'R+':
          return computePlus(prev);
        case 'R*':
          return RStar;
        case 'SCC':
          return boolAnd(RStar, transposeMat(RStar));
        case 'CC':
          return computeStar(boolOr(prev, RT));
        case 'RED':
          return boolDiff(prev, boolMul(prev, prev));
        default:
          return prev;
      }
    });
  };

  const nodeCoords = useMemo(() => getLayoutNodes(matrix.length), [matrix.length]);
  const NODE_R = 20;

  const isWitnessEdge = (i: number, j: number) =>
    activeCheck.witnessEdges.some(([wi, wj]) => wi === i && wj === j);

  const cellAccent = (r: number, c: number, val: number): CellAccent => {
    if (
      activeCheck.missingEdge &&
      activeCheck.missingEdge[0] === r &&
      activeCheck.missingEdge[1] === c
    ) {
      return 'red';
    }
    if (isWitnessEdge(r, c)) return 'yellow';
    return val === 1 ? 'blue' : 'default';
  };

  const loopPath = (idx: number) => {
    const [x, y] = nodeCoords[idx];
    const vx = x - 180;
    const vy = y - 160;
    const vlen = Math.hypot(vx, vy) || 1;
    const ux = vx / vlen;
    const uy = vy / vlen;
    const px = -uy;
    const py = ux;
    const sx = x + (ux * 0.85 + px * 0.5) * NODE_R;
    const sy = y + (uy * 0.85 + py * 0.5) * NODE_R;
    const ex = x + (ux * 0.85 - px * 0.5) * (NODE_R + 3);
    const ey = y + (uy * 0.85 - py * 0.5) * (NODE_R + 3);
    const c1x = x + ux * 58 + px * 26;
    const c1y = y + uy * 58 + py * 26;
    const c2x = x + ux * 58 - px * 26;
    const c2y = y + uy * 58 - py * 26;
    const angleDeg = (Math.atan2(ey - c2y, ex - c2x) * 180) / Math.PI;
    return {
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      tipX: ex,
      tipY: ey,
      angleDeg,
    };
  };

  const edgePath = (i: number, j: number, curved: boolean) => {
    const [x1, y1] = nodeCoords[i];
    const [x2, y2] = nodeCoords[j];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bend = curved ? 20 : 0;
    const mx = (x1 + x2) / 2 + nx * bend;
    const my = (y1 + y2) / 2 + ny * bend;
    const sdx = mx - x1;
    const sdy = my - y1;
    const sl = Math.hypot(sdx, sdy) || 1;
    const sx = x1 + (sdx / sl) * (NODE_R + 2);
    const sy = y1 + (sdy / sl) * (NODE_R + 2);
    const edx = x2 - mx;
    const edy = y2 - my;
    const el = Math.hypot(edx, edy) || 1;
    const ex = x2 - (edx / el) * (NODE_R + 5);
    const ey = y2 - (edy / el) * (NODE_R + 5);
    const angleDeg = (Math.atan2(edy, edx) * 180) / Math.PI;
    return {
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      tipX: ex,
      tipY: ey,
      angleDeg,
    };
  };

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 4.4 · Endorelation Properties and Closure Operators
          </div>
          <div className="figure-subtitle">
            Click any property on the right to highlight witness edges (yellow) or a missing required edge (dashed red).
          </div>
        </div>
        <div className="figure-controls">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="ctrl-btn"
              onClick={() => loadPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '2px 26px 10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-muted)', marginRight: 4 }}>
          Transform:
        </span>
        {[
          { id: 'RT', tex: 'R^\\top' },
          { id: 'RR', tex: 'RR' },
          { id: 'R+', tex: 'R^+' },
          { id: 'R*', tex: 'R^*' },
          { id: 'SCC', tex: 'R^* \\cap (R^\\top)^*' },
          { id: 'CC', tex: '(R \\cup R^\\top)^*' },
          { id: 'RED', tex: 'R \\setminus RR' },
        ].map((op) => (
          <button
            key={op.id}
            type="button"
            className="ctrl-btn"
            onClick={() => applyOp(op.id)}
          >
            <Tex math={op.tex} />
          </button>
        ))}
      </div>

      <div className="visual-split">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg
            viewBox="0 0 360 328"
            style={{ width: '100%', maxWidth: 370, height: 'auto', overflow: 'visible' }}
          >
            {matrix.map((row, i) =>
              row.map((val, j) => {
                if (val === 0) return null;
                const isWit = isWitnessEdge(i, j);
                const color = isWit ? '#F4D35E' : '#58C4DD';
                const geom =
                  i === j
                    ? loopPath(i)
                    : edgePath(
                        i,
                        j,
                        matrix[j][i] === 1 ||
                          Boolean(
                            activeCheck.missingEdge &&
                              activeCheck.missingEdge[0] === j &&
                              activeCheck.missingEdge[1] === i
                          )
                      );
                return (
                  <g
                    key={`e-${i}-${j}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleCell(i, j)}
                  >
                    <path d={geom.d} fill="none" stroke="transparent" strokeWidth={14} />
                    <path
                      d={geom.d}
                      fill="none"
                      stroke={color}
                      strokeWidth={isWit ? 3.1 : 2.3}
                      strokeLinecap="round"
                    />
                    <polygon
                      points="0,0 -9.5,-4.4 -9.5,4.4"
                      fill={color}
                      transform={`translate(${geom.tipX},${geom.tipY}) rotate(${geom.angleDeg})`}
                    />
                  </g>
                );
              })
            )}

            {activeCheck.missingEdge && (() => {
              const [mi, mj] = activeCheck.missingEdge;
              const geom =
                mi === mj ? loopPath(mi) : edgePath(mi, mj, matrix[mj][mi] === 1);
              return (
                <g style={{ cursor: 'pointer' }} onClick={() => toggleCell(mi, mj)}>
                  <path
                    d={geom.d}
                    fill="none"
                    stroke="#FC6255"
                    strokeWidth={2.5}
                    strokeDasharray="6 5"
                  />
                  <polygon
                    points="0,0 -9.5,-4.4 -9.5,4.4"
                    fill="#FC6255"
                    transform={`translate(${geom.tipX},${geom.tipY}) rotate(${geom.angleDeg})`}
                  />
                </g>
              );
            })()}

            {nodeCoords.map(([cx, cy], idx) => (
              <g
                key={`nd-${idx}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleCell(idx, idx)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  fill="#0b0c10"
                  stroke="rgba(250,250,250,0.72)"
                  strokeWidth={1.8}
                />
                <text
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fill="#FAFAFA"
                  fontFamily="KaTeX_Main, Times, serif"
                  fontSize={18}
                  fontWeight={600}
                >
                  {labels[idx]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <InteractiveMatrix
            matrix={matrix}
            labels={labels}
            titleTex="M_R"
            onToggle={toggleCell}
            cellAccent={cellAccent}
          />

          <div className="relation-property-grid">
            {checks.map((ch) => {
              const isSelected = ch.id === activeCheck.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPropId(ch.id)}
                  style={{
                    background: isSelected
                      ? 'rgba(255,255,255,0.09)'
                      : 'rgba(255,255,255,0.03)',
                    border: 'none',
                    borderRadius: 11,
                    padding: '8px 11px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12.5,
                    color: 'var(--ink)',
                    boxShadow: isSelected
                      ? 'inset 0 0 0 1px rgba(255,255,255,0.22)'
                      : 'none',
                  }}
                >
                  <span style={{ textAlign: 'left', fontWeight: isSelected ? 600 : 400 }}>
                    {ch.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: ch.holds ? 'var(--m-green)' : 'var(--m-red)',
                    }}
                  >
                    {ch.holds ? 'YES' : 'NO'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="relation-property-result"
        style={{
          margin: '4px 26px 8px',
          padding: '12px 18px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-sans)',
          fontSize: 13.5,
        }}
      >
        <div>
          <strong style={{ color: activeCheck.holds ? 'var(--m-green)' : 'var(--m-red)' }}>
            {activeCheck.name}:
          </strong>{' '}
          <Tex className="tex-wide" math={activeCheck.reasonTex} />
        </div>
        <div style={{ fontSize: 14 }}>
          <Tex className="tex-wide" math={activeCheck.formulaTex} />
        </div>
      </div>

      <figcaption className="figure-caption">
        Click any node to toggle its self-loop, or click a dashed red edge to add the missing pair
        required by the selected property.
      </figcaption>
    </figure>
  );
};

import React, { useMemo, useState } from 'react';
import { Tex } from '../math/Tex';
import { InteractiveMatrix, CellAccent } from '../math/InteractiveMatrix';

type LabTab = 'products' | 'isomorphism';

interface FactorGraph {
  key: string;
  labelTex: string;
  nodes: string[];
  edges: [number, number][];
}

const G1_FACTORS: FactorGraph[] = [
  {
    key: 'c3',
    labelTex: '\\vec{C}_3',
    nodes: ['a', 'b', 'c'],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  },
  {
    key: 'p3',
    labelTex: '\\vec{P}_3',
    nodes: ['a', 'b', 'c'],
    edges: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    key: 'p2',
    labelTex: '\\vec{P}_2',
    nodes: ['a', 'b'],
    edges: [[0, 1]],
  },
  {
    key: 'c2',
    labelTex: '\\vec{C}_2',
    nodes: ['a', 'b'],
    edges: [[0, 1], [1, 0]],
  },
];

const G2_FACTORS: FactorGraph[] = [
  {
    key: 'slide18',
    labelTex: 'H_{\\text{ex}}',
    nodes: ['1', '2', '3'],
    edges: [
      [0, 1],
      [1, 2],
      [2, 1],
    ],
  },
  {
    key: 'p3',
    labelTex: '\\vec{P}_3',
    nodes: ['1', '2', '3'],
    edges: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    key: 'c3',
    labelTex: '\\vec{C}_3',
    nodes: ['1', '2', '3'],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  },
  {
    key: 'c2',
    labelTex: '\\vec{C}_2',
    nodes: ['1', '2'],
    edges: [
      [0, 1],
      [1, 0],
    ],
  },
  {
    key: 'p2',
    labelTex: '\\vec{P}_2',
    nodes: ['1', '2'],
    edges: [[0, 1]],
  },
];

function computeComponents(n: number, edges: [number, number][]) {
  const adjUndir: number[][] = Array.from({ length: n }, () => []);
  const reach: boolean[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => i === j)
  );
  let hasCycle = false;

  for (const [u, v] of edges) {
    adjUndir[u].push(v);
    adjUndir[v].push(u);
    reach[u][v] = true;
    if (u === v) hasCycle = true;
  }

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (!reach[i][k]) continue;
      for (let j = 0; j < n; j++) {
        if (reach[k][j]) reach[i][j] = true;
      }
    }
  }

  for (const [u, v] of edges) {
    if (u !== v && reach[v][u]) hasCycle = true;
  }

  // CCs
  const visCC = new Array(n).fill(false);
  let ccCount = 0;
  for (let i = 0; i < n; i++) {
    if (!visCC[i]) {
      ccCount++;
      const q = [i];
      visCC[i] = true;
      while (q.length) {
        const cur = q.pop()!;
        for (const nb of adjUndir[cur]) {
          if (!visCC[nb]) {
            visCC[nb] = true;
            q.push(nb);
          }
        }
      }
    }
  }

  // SCCs
  const visSCC = new Array(n).fill(false);
  let sccCount = 0;
  for (let i = 0; i < n; i++) {
    if (!visSCC[i]) {
      sccCount++;
      for (let j = 0; j < n; j++) {
        if (reach[i][j] && reach[j][i]) visSCC[j] = true;
      }
    }
  }

  return { ccCount, sccCount, isDag: !hasCycle };
}

interface IsoPreset {
  key: string;
  label: React.ReactNode;
  directed: boolean;
  vG: string[];
  vH: string[];
  posG: [number, number][];
  posH: [number, number][];
  edgesG: [number, number][];
  edgesH: [number, number][];
  validPerm?: number[];
  altPerm?: number[];
  note: React.ReactNode;
}

const ISO_PRESETS: IsoPreset[] = [
  {
    key: 'slide15',
    label: <>4-Node Digraphs</>,
    directed: true,
    vG: ['1', '2', 'a', 'b'],
    vH: ['0', '1', '2', '3'],
    posG: [
      [75, 210],  // 1
      [75, 80],   // 2
      [215, 210], // a
      [215, 80],  // b
    ],
    posH: [
      [235, 145], // 0
      [155, 215], // 1
      [65, 145],  // 2
      [135, 75],  // 3
    ],
    edgesG: [
      [0, 3], // 1->b
      [0, 1], // 1->2
      [1, 3], // 2->b
      [1, 2], // 2->a
      [3, 3], // b->b
      [3, 1], // b->2
      [2, 0], // a->1
    ],
    edgesH: [
      [3, 0], // 3->0
      [3, 1], // 3->1
      [1, 0], // 1->0
      [1, 2], // 1->2
      [0, 0], // 0->0
      [0, 1], // 0->1
      [2, 3], // 2->3
    ],
    // 1->3, 2->1, a->2, b->0
    validPerm: [3, 1, 2, 0],
    note: (
      <>
        Unique isomorphism <Tex math="\beta" />: the self-loop forces <Tex math="\beta(b)=0" />,
        the symmetric <Tex math="2" />-cycle forces <Tex math="\beta(2)=1" />, then{' '}
        <Tex math="\beta(a)=2" /> and <Tex math="\beta(1)=3" />.
      </>
    ),
  },
  {
    key: 'sheet8-3',
    label: <>6-Node Symmetries</>,
    directed: true,
    vG: ['1', '2', '3', '4', '5', '6'],
    vH: ['a', 'b', 'c', 'd', 'e', 'f'],
    posG: [
      [62, 196],  // 1
      [165, 145], // 2
      [115, 224], // 3
      [238, 145], // 4
      [62, 94],   // 5
      [115, 66],  // 6
    ],
    posH: [
      [65, 145],  // a
      [232, 196], // b
      [182, 66],  // c
      [232, 94],  // d
      [182, 224], // e
      [135, 145], // f
    ],
    edgesG: [
      [0, 4], // 1->5
      [4, 0], // 5->1
      [1, 3], // 2->4
      [2, 1], // 3->2
      [5, 1], // 6->2
      [3, 3], // 4->4
    ],
    edgesH: [
      [0, 0], // a->a
      [1, 3], // b->d
      [3, 1], // d->b
      [2, 5], // c->f
      [4, 5], // e->f
      [5, 0], // f->a
    ],
    // 1->b(1), 2->f(5), 3->c(2), 4->a(0), 5->d(3), 6->e(4)
    validPerm: [1, 5, 2, 0, 3, 4],
    // Alternate applying (1,5)(3,6): 1->d(3), 2->f(5), 3->e(4), 4->a(0), 5->b(1), 6->c(2)
    altPerm: [3, 5, 4, 0, 1, 2],
    note: (
      <>
        Because <Tex math="\mathrm{Aut}(G) = \{\mathrm{Id},\, (1,5),\, (3,6),\, (1,5)(3,6)\}" /> has{' '}
        <Tex math="4" /> automorphisms, there are exactly <Tex math="4" /> isomorphisms{' '}
        <Tex math="G \to H" />.
      </>
    ),
  },
  {
    key: 'non-iso',
    label: (
      <>
        <Tex math="C_6" /> vs. <Tex math="C_3 \oplus C_3" />
      </>
    ),
    directed: false,
    vG: ['1', '2', '3', '4', '5', '6'],
    vH: ['a', 'b', 'c', 'd', 'e', 'f'],
    posG: [
      [145, 58],
      [220, 102],
      [220, 188],
      [145, 232],
      [70, 188],
      [70, 102],
    ],
    posH: [
      [86, 82],
      [52, 165],
      [120, 165],
      [208, 82],
      [174, 165],
      [242, 165],
    ],
    edgesG: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
    edgesH: [
      [0, 1],
      [1, 2],
      [2, 0],
      [3, 4],
      [4, 5],
      [5, 3],
    ],
    note: (
      <>
        Both simple graphs have <Tex math="|V|=6" />, <Tex math="|E|=6" />, and sorted degree
        sequence <Tex math="(2,2,2,2,2,2)" />, yet <Tex math="G \not\cong H" />:{' '}
        <Tex math="C_6" /> has <Tex math="1" /> CC and shortest cycle <Tex math="6" />, while{' '}
        <Tex math="C_3 \oplus C_3" /> has <Tex math="2" /> CCs and triangles.
      </>
    ),
  },
];

function buildArc(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  bend: number,
  directed: boolean
) {
  if (Math.hypot(x2 - x1, y2 - y1) < 1e-3) {
    const dirX = x1 < 150 ? -1 : 1;
    const dirY = y1 < 145 ? -1 : 1;
    const sx = x1 + dirX * r * 0.85;
    const sy = y1 + dirY * r * 0.35;
    const ex = x1 + dirX * r * 0.35;
    const ey = y1 + dirY * (r + 3);
    const c1x = x1 + dirX * 48;
    const c1y = y1 + dirY * 10;
    const c2x = x1 + dirX * 10;
    const c2y = y1 + dirY * 48;
    const ang = (Math.atan2(ey - c2y, ex - c2x) * 180) / Math.PI;
    return {
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      tipX: ex,
      tipY: ey,
      ang,
    };
  }
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x1 + x2) / 2 + nx * bend;
  const my = (y1 + y2) / 2 + ny * bend;

  const sdx = mx - x1;
  const sdy = my - y1;
  const slen = Math.hypot(sdx, sdy) || 1;
  const sx = x1 + (sdx / slen) * (r + 2);
  const sy = y1 + (sdy / slen) * (r + 2);

  const edx = x2 - mx;
  const edy = y2 - my;
  const elen = Math.hypot(edx, edy) || 1;
  const padEnd = directed ? r + 5 : r + 2;
  const ex = x2 - (edx / elen) * padEnd;
  const ey = y2 - (edy / elen) * padEnd;
  const ang = (Math.atan2(edy, edx) * 180) / Math.PI;

  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    tipX: ex,
    tipY: ey,
    ang,
  };
}

export const Ch09GraphProductsAndIsoLab: React.FC = () => {
  const [tab, setTab] = useState<LabTab>('products');

  // === PRODUCTS STATE ===
  const [g1Idx, setG1Idx] = useState(0);
  const [g2Idx, setG2Idx] = useState(0);
  const [prodMode, setProdMode] = useState<'direct' | 'cartesian' | 'both'>('direct');
  const [reflexive, setReflexive] = useState(false);
  const [selPair, setSelPair] = useState<[number, number]>([0, 0]);

  const g1 = G1_FACTORS[g1Idx];
  const g2 = G2_FACTORS[g2Idx];

  const { firstFactorEdges, secondFactorEdges, directEdges, cartEdges, statsDirect, statsCart } = useMemo(() => {
    const rCount = g1.nodes.length;
    const cCount = g2.nodes.length;
    const totalN = rCount * cCount;
    const id = (r: number, c: number) => r * cCount + c;

    const firstFactorEdges = [...g1.edges];
    const secondFactorEdges = [...g2.edges];
    if (reflexive) {
      for (let i = 0; i < rCount; i++) firstFactorEdges.push([i, i]);
      for (let j = 0; j < cCount; j++) secondFactorEdges.push([j, j]);
    }
    const e1Set = new Set(firstFactorEdges.map(([u, v]) => `${u},${v}`));
    const e2Set = new Set(secondFactorEdges.map(([u, v]) => `${u},${v}`));

    const dEdges: [number, number][] = [];
    const cEdges: [number, number][] = [];
    const cSeen = new Set<string>();

    for (let r1 = 0; r1 < rCount; r1++) {
      for (let c1 = 0; c1 < cCount; c1++) {
        for (let r2 = 0; r2 < rCount; r2++) {
          for (let c2 = 0; c2 < cCount; c2++) {
            const u = id(r1, c1);
            const v = id(r2, c2);
            if (e1Set.has(`${r1},${r2}`) && e2Set.has(`${c1},${c2}`)) {
              dEdges.push([u, v]);
            }
            const stepG1 = c1 === c2 && e1Set.has(`${r1},${r2}`);
            const stepG2 = r1 === r2 && e2Set.has(`${c1},${c2}`);
            if (stepG1 || stepG2) {
              const k = `${u},${v}`;
              if (!cSeen.has(k)) {
                cSeen.add(k);
                cEdges.push([u, v]);
              }
            }
          }
        }
      }
    }

    return {
      firstFactorEdges,
      secondFactorEdges,
      directEdges: dEdges,
      cartEdges: cEdges,
      statsDirect: computeComponents(totalN, dEdges),
      statsCart: computeComponents(totalN, cEdges),
    };
  }, [g1, g2, reflexive]);

  // === ISOMORPHISM STATE ===
  const [isoIdx, setIsoIdx] = useState(0);
  const [perm, setPerm] = useState<number[]>([0, 1, 2, 3]);
  const [swapPick, setSwapPick] = useState<number | null>(null);

  const preset = ISO_PRESETS[isoIdx];

  const selectIsoPreset = (idx: number) => {
    setIsoIdx(idx);
    const n = ISO_PRESETS[idx].vG.length;
    setPerm(Array.from({ length: n }, (_, i) => i));
    setSwapPick(null);
  };

  const handleSlotClick = (slot: number) => {
    if (swapPick === null) {
      setSwapPick(slot);
    } else if (swapPick === slot) {
      setSwapPick(null);
    } else {
      setPerm((prev) => {
        const next = [...prev];
        const tmp = next[swapPick];
        next[swapPick] = next[slot];
        next[slot] = tmp;
        return next;
      });
      setSwapPick(null);
    }
  };

  const isoCheck = useMemo(() => {
    const n = preset.vG.length;
    const matG: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const matH: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    for (const [u, v] of preset.edgesG) {
      matG[u][v] = 1;
      if (!preset.directed) matG[v][u] = 1;
    }
    for (const [u, v] of preset.edgesH) {
      matH[u][v] = 1;
      if (!preset.directed) matH[v][u] = 1;
    }

    // Permuted H matrix: (P_beta M_H P_beta^T)_{i,j} = M_H[perm[i]][perm[j]]
    const matPermH: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => matH[perm[i]][perm[j]])
    );

    let mismatches = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matG[i][j] !== matPermH[i][j]) mismatches++;
      }
    }

    return { matG, matH, matPermH, isIso: mismatches === 0, mismatches };
  }, [preset, perm]);

  const rCount = g1.nodes.length;
  const cCount = g2.nodes.length;
  const safeSelR = Math.min(selPair[0], rCount - 1);
  const safeSelC = Math.min(selPair[1], cCount - 1);
  const selId = safeSelR * cCount + safeSelC;

  const activeEdges =
    prodMode === 'direct'
      ? directEdges
      : prodMode === 'cartesian'
      ? cartEdges
      : [...cartEdges, ...directEdges];

  const activeEdgeSet = useMemo(() => {
    return new Set(activeEdges.map(([u, v]) => `${u},${v}`));
  }, [activeEdges]);

  const directSet = useMemo(
    () => new Set(directEdges.map(([u, v]) => `${u},${v}`)),
    [directEdges]
  );
  const cartSet = useMemo(
    () => new Set(cartEdges.map(([u, v]) => `${u},${v}`)),
    [cartEdges]
  );

  // Coordinates for product grid
  const prodX = (c: number) => 126 + c * (cCount === 2 ? 120 : 94);
  const prodY = (r: number) => 96 + r * (rCount === 2 ? 108 : 84);

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 9.1 · Interactive Graph Products and Isomorphism Inspector
          </div>
          <div className="figure-subtitle">
            {tab === 'products'
              ? 'Compare lockstep direct edges (G_1 × G_2) against interleaved Cartesian steps (G_1 □ G_2) and click any product state.'
              : 'Permute β : V_G → V_H by clicking two assignment pills to test (u,v) ∈ E_G ⇔ (β(u),β(v)) ∈ E_H and M_G = P_β M_H P_β^⊤.'}
          </div>
        </div>
        <div className="figure-controls">
          <button
            type="button"
            className={`ctrl-btn ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            Products <Tex math="G_1 \times G_2,\; G_1 \,\square\, G_2" />
          </button>
          <button
            type="button"
            className={`ctrl-btn ${tab === 'isomorphism' ? 'active' : ''}`}
            onClick={() => setTab('isomorphism')}
          >
            Isomorphism <Tex math="G \cong H" />
          </button>
        </div>
      </div>

      {tab === 'products' ? (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '0 26px 8px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'var(--font-sans)' }}>
              Factor <Tex math="G_1" />:
            </span>
            {G1_FACTORS.map((f, idx) => (
              <button
                key={f.key}
                type="button"
                className={`ctrl-btn ${g1Idx === idx ? 'active' : ''}`}
                onClick={() => setG1Idx(idx)}
              >
                <Tex math={f.labelTex} />
              </button>
            ))}
            <span
              style={{
                fontSize: 12,
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-sans)',
                marginLeft: 8,
              }}
            >
              Factor <Tex math="G_2" />:
            </span>
            {G2_FACTORS.map((f, idx) => (
              <button
                key={f.key}
                type="button"
                className={`ctrl-btn ${g2Idx === idx ? 'active' : ''}`}
                onClick={() => setG2Idx(idx)}
              >
                <Tex math={f.labelTex} />
              </button>
            ))}
            <span
              style={{
                fontSize: 12,
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-sans)',
                marginLeft: 8,
              }}
            >
              Rule:
            </span>
            <button
              type="button"
              className={`ctrl-btn ${prodMode === 'direct' ? 'active' : ''}`}
              onClick={() => setProdMode('direct')}
            >
              <Tex math="G_1 \times G_2" />
            </button>
            <button
              type="button"
              className={`ctrl-btn ${prodMode === 'cartesian' ? 'active' : ''}`}
              onClick={() => setProdMode('cartesian')}
            >
              <Tex math="G_1 \,\square\, G_2" />
            </button>
            <button
              type="button"
              className={`ctrl-btn ${prodMode === 'both' ? 'active' : ''}`}
              onClick={() => setProdMode('both')}
            >
              Overlay Both
            </button>
            <button
              type="button"
              className={`ctrl-btn ${reflexive ? 'active' : ''}`}
              onClick={() => setReflexive((v) => !v)}
            >
              + <Tex math="\mathrm{Id}" /> (Reflexive)
            </button>
          </div>

          <div className="visual-split">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg
                viewBox="0 0 380 305"
                style={{ width: '100%', maxWidth: 420, height: 'auto', overflow: 'visible' }}
              >
                {/* Marginal G2 along top */}
                {secondFactorEdges.map(([u, v], idx) => {
                  const hasRev = u !== v && secondFactorEdges.some(([a, b]) => a === v && b === u);
                  const arc = buildArc(prodX(u), 34, prodX(v), 34, 14, hasRev ? 14 : 0, true);
                  return (
                    <g key={`g2e-${idx}`}>
                      <path d={arc.d} fill="none" stroke="#58c4dd" strokeWidth={1.8} opacity={0.8} />
                      <polygon
                        points="0,0 -6,-3 -6,3"
                        fill="#58c4dd"
                        transform={`translate(${arc.tipX},${arc.tipY}) rotate(${arc.ang})`}
                      />
                    </g>
                  );
                })}
                {g2.nodes.map((lbl, c) => (
                  <g key={`g2n-${c}`}>
                    <circle
                      cx={prodX(c)}
                      cy={34}
                      r={13}
                      fill={c === safeSelC ? 'rgba(88,196,221,0.22)' : '#0B0C10'}
                      stroke="#58c4dd"
                      strokeWidth={c === safeSelC ? 2.2 : 1.4}
                    />
                    <text
                      x={prodX(c)}
                      y={38}
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="12"
                      fontFamily="KaTeX_Main, serif"
                    >
                      {lbl}
                    </text>
                  </g>
                ))}

                {/* Marginal G1 along left */}
                {firstFactorEdges.map(([u, v], idx) => {
                  const isWrap = Math.abs(u - v) > 1;
                  const hasRev = u !== v && firstFactorEdges.some(([a, b]) => a === v && b === u);
                  const bend = isWrap ? 22 : hasRev ? 14 : 0;
                  const arc = buildArc(44, prodY(u), 44, prodY(v), 14, bend, true);
                  return (
                    <g key={`g1e-${idx}`}>
                      <path d={arc.d} fill="none" stroke="#fc6255" strokeWidth={1.8} opacity={0.85} />
                      <polygon
                        points="0,0 -6,-3 -6,3"
                        fill="#fc6255"
                        transform={`translate(${arc.tipX},${arc.tipY}) rotate(${arc.ang})`}
                      />
                    </g>
                  );
                })}
                {g1.nodes.map((lbl, r) => (
                  <g key={`g1n-${r}`}>
                    <circle
                      cx={44}
                      cy={prodY(r)}
                      r={13}
                      fill={r === safeSelR ? 'rgba(252,98,85,0.22)' : '#0B0C10'}
                      stroke="#fc6255"
                      strokeWidth={r === safeSelR ? 2.2 : 1.4}
                    />
                    <text
                      x={44}
                      y={prodY(r) + 4}
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="12"
                      fontFamily="KaTeX_Main, serif"
                    >
                      {lbl}
                    </text>
                  </g>
                ))}

                {/* Product edges */}
                {Array.from(activeEdgeSet).map((keyStr) => {
                  const [u, v] = keyStr.split(',').map(Number);
                  const r1 = Math.floor(u / cCount);
                  const c1 = u % cCount;
                  const r2 = Math.floor(v / cCount);
                  const c2 = v % cCount;

                  const isFromSel = u === selId;
                  const inCart = cartSet.has(keyStr);
                  const inDir = directSet.has(keyStr);

                  let stroke = 'rgba(255,255,255,0.25)';
                  if (prodMode === 'direct') {
                    stroke = isFromSel ? '#f4d35e' : 'rgba(244,211,94,0.42)';
                  } else if (prodMode === 'cartesian') {
                    stroke = isFromSel ? '#83c167' : 'rgba(131,193,103,0.44)';
                  } else {
                    if (inCart && inDir) stroke = isFromSel ? '#fafafa' : 'rgba(250,250,250,0.65)';
                    else if (inCart) stroke = isFromSel ? '#83c167' : 'rgba(131,193,103,0.45)';
                    else stroke = isFromSel ? '#f4d35e' : 'rgba(244,211,94,0.42)';
                  }

                  const hasRev = u !== v && activeEdgeSet.has(`${v},${u}`);
                  const wrapVert = c1 === c2 && Math.abs(r1 - r2) > 1;
                  const bend = wrapVert ? 24 : hasRev ? 15 : 0;
                  const arc = buildArc(
                    prodX(c1),
                    prodY(r1),
                    prodX(c2),
                    prodY(r2),
                    18,
                    bend,
                    true
                  );

                  return (
                    <g key={`pe-${keyStr}`}>
                      <path
                        d={arc.d}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={isFromSel ? 2.5 : 1.5}
                      />
                      <polygon
                        points="0,0 -6.5,-3.2 -6.5,3.2"
                        fill={stroke}
                        transform={`translate(${arc.tipX},${arc.tipY}) rotate(${arc.ang})`}
                      />
                    </g>
                  );
                })}

                {/* Product vertices */}
                {g1.nodes.map((rl, r) =>
                  g2.nodes.map((cl, c) => {
                    const id = r * cCount + c;
                    const isSel = id === selId;
                    const isOutNeighbor = activeEdgeSet.has(`${selId},${id}`) && id !== selId;
                    return (
                      <g
                        key={`pn-${r}-${c}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select (${rl}, ${cl})`}
                        aria-pressed={isSel}
                        onClick={() => setSelPair([r, c])}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelPair([r, c]);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={prodX(c)}
                          cy={prodY(r)}
                          r={18}
                          fill={
                            isSel
                              ? 'rgba(244,211,94,0.18)'
                              : isOutNeighbor
                              ? 'rgba(88,196,221,0.14)'
                              : '#0B0C10'
                          }
                          stroke={isSel ? '#f4d35e' : isOutNeighbor ? '#58c4dd' : '#fafafa'}
                          strokeWidth={isSel ? 2.6 : 1.7}
                        />
                        <text
                          x={prodX(c)}
                          y={prodY(r) + 4.5}
                          textAnchor="middle"
                          fill="#fafafa"
                          fontSize="13"
                          fontFamily="KaTeX_Main, serif"
                        >
                          {rl}
                          {cl}
                        </text>
                      </g>
                    );
                  })
                )}
              </svg>
            </div>

            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.65 }}>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--m-yellow)', fontWeight: 600, marginBottom: 6 }}>
                  Selected Vertex <Tex math={`(${g1.nodes[safeSelR]}, ${g2.nodes[safeSelC]})`} />
                </div>
                <div>
                  Outgoing in <Tex math="G_1 \times G_2" />:{' '}
                  <strong>
                    {directEdges
                      .filter(([u]) => u === selId)
                      .map(([, v]) => `${g1.nodes[Math.floor(v / cCount)]}${g2.nodes[v % cCount]}`)
                      .join(', ') || 'none (sink)'}
                  </strong>
                </div>
                <div>
                  Outgoing in <Tex math="G_1 \,\square\, G_2" />:{' '}
                  <strong>
                    {cartEdges
                      .filter(([u]) => u === selId)
                      .map(([, v]) => `${g1.nodes[Math.floor(v / cCount)]}${g2.nodes[v % cCount]}`)
                      .join(', ') || 'none (sink)'}
                  </strong>
                </div>
              </div>

              <div className="visual-table-scroll">
                <table className="clean-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Invariant</th>
                      <th>
                        <Tex math="G_1 \times G_2" />
                      </th>
                      <th>
                        <Tex math="G_1 \,\square\, G_2" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Tex math="|V|,\; |E|" />
                      </td>
                      <td>
                        {rCount * cCount}, {directEdges.length}
                      </td>
                      <td>
                        {rCount * cCount}, {cartEdges.length}
                      </td>
                    </tr>
                    <tr>
                      <td>CCs / SCCs</td>
                      <td>
                        {statsDirect.ccCount} CC · {statsDirect.sccCount} SCC
                      </td>
                      <td>
                        {statsCart.ccCount} CC · {statsCart.sccCount} SCC
                      </td>
                    </tr>
                    <tr>
                      <td>Acyclic (DAG)?</td>
                      <td style={{ color: statsDirect.isDag ? 'var(--m-green)' : 'var(--ink-secondary)' }}>
                        {statsDirect.isDag ? 'Yes (DAG)' : 'Cyclic'}
                      </td>
                      <td style={{ color: statsCart.isDag ? 'var(--m-green)' : 'var(--ink-secondary)' }}>
                        {statsCart.isDag ? 'Yes (DAG)' : 'Cyclic'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {reflexive && (
                <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12.5, color: 'var(--m-green)' }}>
                  With <Tex math="\mathrm{Id}_{V_i} \subseteq E_i" />, idling in one coordinate is a
                  valid edge, so <Tex math="G_1 \,\square\, G_2" /> is a subgraph of{' '}
                  <Tex math="G_1 \times G_2" /> with identical SCCs.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '0 26px 8px',
              alignItems: 'center',
            }}
          >
            {ISO_PRESETS.map((p, idx) => (
              <button
                key={p.key}
                type="button"
                className={`ctrl-btn ${isoIdx === idx ? 'active' : ''}`}
                onClick={() => selectIsoPreset(idx)}
              >
                {p.label}
              </button>
            ))}
            {preset.validPerm && (
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => {
                  setPerm([...preset.validPerm!]);
                  setSwapPick(null);
                }}
              >
                Apply Isomorphism <Tex math="\beta_1" />
              </button>
            )}
            {preset.altPerm && (
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => {
                  setPerm([...preset.altPerm!]);
                  setSwapPick(null);
                }}
              >
                Apply <Tex math="\beta_2 = \beta_1 \circ (1,5)(3,6)" />
              </button>
            )}
          </div>

          <div
            style={{
              padding: '4px 26px 8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
            }}
          >
            <span style={{ color: 'var(--ink-muted)' }}>
              Click two pills to swap <Tex math="\beta(u)" />:
            </span>
            {preset.vG.map((uLbl, idx) => (
              <button
                key={uLbl}
                type="button"
                className={`ctrl-btn ${swapPick === idx ? 'active' : ''}`}
                onClick={() => handleSlotClick(idx)}
              >
                <Tex math={`\\beta(${uLbl}) = ${preset.vH[perm[idx]]}`} />
              </button>
            ))}
            <span
              style={{
                marginLeft: 'auto',
                fontWeight: 600,
                color: isoCheck.isIso ? 'var(--m-green)' : 'var(--m-red)',
              }}
            >
              {isoCheck.isIso ? (
                <>Valid isomorphism (<Tex math="M_{E_G} = P_\beta M_{E_H} P_\beta^\top" />)</>
              ) : (
                <>{isoCheck.mismatches} matrix entry mismatches</>
              )}
            </span>
          </div>

          <div className="visual-split">
            <div className="graph-iso-pair">
              {/* Graph G */}
              <svg viewBox="0 0 290 270" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <text x={145} y={24} textAnchor="middle" fill="#9898a0" fontSize="13" fontFamily="Inter, sans-serif">
                  Graph G (checked against H)
                </text>
                {preset.edgesG.map(([u, v], idx) => {
                  const ok = isoCheck.matPermH[u][v] === 1;
                  const hasRev =
                    preset.directed && u !== v && preset.edgesG.some(([a, b]) => a === v && b === u);
                  const arc = buildArc(
                    preset.posG[u][0],
                    preset.posG[u][1],
                    preset.posG[v][0],
                    preset.posG[v][1],
                    17,
                    hasRev ? 18 : 0,
                    preset.directed
                  );
                  const col = ok ? '#83c167' : '#fc6255';
                  return (
                    <g key={`ge-${idx}`}>
                      <path d={arc.d} fill="none" stroke={col} strokeWidth={2.2} />
                      {preset.directed && (
                        <polygon
                          points="0,0 -6.5,-3.2 -6.5,3.2"
                          fill={col}
                          transform={`translate(${arc.tipX},${arc.tipY}) rotate(${arc.ang})`}
                        />
                      )}
                    </g>
                  );
                })}
                {preset.vG.map((lbl, idx) => (
                  <g key={`gn-${idx}`} onClick={() => handleSlotClick(idx)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={preset.posG[idx][0]}
                      cy={preset.posG[idx][1]}
                      r={17}
                      fill={swapPick === idx ? 'rgba(244,211,94,0.22)' : '#0B0C10'}
                      stroke={swapPick === idx ? '#f4d35e' : '#fafafa'}
                      strokeWidth={2}
                    />
                    <text
                      x={preset.posG[idx][0]}
                      y={preset.posG[idx][1] + 4.5}
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="13"
                      fontFamily="KaTeX_Main, serif"
                    >
                      {lbl}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Graph H */}
              <svg viewBox="0 0 290 270" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <text x={145} y={24} textAnchor="middle" fill="#9898a0" fontSize="13" fontFamily="Inter, sans-serif">
                  Target Graph H
                </text>
                {preset.edgesH.map(([u, v], idx) => {
                  const hasRev =
                    preset.directed && u !== v && preset.edgesH.some(([a, b]) => a === v && b === u);
                  const arc = buildArc(
                    preset.posH[u][0],
                    preset.posH[u][1],
                    preset.posH[v][0],
                    preset.posH[v][1],
                    17,
                    hasRev ? 18 : 0,
                    preset.directed
                  );
                  return (
                    <g key={`he-${idx}`}>
                      <path d={arc.d} fill="none" stroke="#58c4dd" strokeWidth={2.0} opacity={0.85} />
                      {preset.directed && (
                        <polygon
                          points="0,0 -6.5,-3.2 -6.5,3.2"
                          fill="#58c4dd"
                          transform={`translate(${arc.tipX},${arc.tipY}) rotate(${arc.ang})`}
                        />
                      )}
                    </g>
                  );
                })}
                {preset.vH.map((lbl, idx) => (
                  <g key={`hn-${idx}`}>
                    <circle
                      cx={preset.posH[idx][0]}
                      cy={preset.posH[idx][1]}
                      r={17}
                      fill="#0B0C10"
                      stroke="#58c4dd"
                      strokeWidth={1.9}
                    />
                    <text
                      x={preset.posH[idx][0]}
                      y={preset.posH[idx][1] + 4.5}
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="13"
                      fontFamily="KaTeX_Main, serif"
                    >
                      {lbl}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                <InteractiveMatrix
                  matrix={isoCheck.matG}
                  labels={preset.vG}
                  titleTex="M_{E_G}"
                  readOnly
                  cellAccent={(r, c, v): CellAccent => {
                    if (v === 0 && isoCheck.matPermH[r][c] === 0) return 'default';
                    return v === isoCheck.matPermH[r][c] ? 'green' : 'red';
                  }}
                />
                <InteractiveMatrix
                  matrix={isoCheck.matPermH}
                  labels={preset.vG.map((_, i) => preset.vH[perm[i]])}
                  titleTex="P_\beta M_{E_H} P_\beta^\top"
                  readOnly
                  cellAccent={(r, c, v): CellAccent => {
                    if (v === 0 && isoCheck.matG[r][c] === 0) return 'default';
                    return v === isoCheck.matG[r][c] ? 'green' : 'red';
                  }}
                />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)', fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
                {preset.note}
              </div>
            </div>
          </div>
        </>
      )}

      <figcaption className="figure-caption">
        In <Tex math="G_1 \times G_2" />, every step advances both coordinates simultaneously (so
        pairing with an acyclic <Tex math="\vec{P}_n" /> forces the entire direct product to be a
        DAG); in <Tex math="G_1 \,\square\, G_2" />, steps interleave one coordinate at a time. Under
        an isomorphism <Tex math="\beta : V_G \to V_H" />, reordering rows and columns of{' '}
        <Tex math="M_{E_H}" /> by <Tex math="\beta" /> reproduces <Tex math="M_{E_G}" /> identically.
      </figcaption>
    </figure>
  );
};

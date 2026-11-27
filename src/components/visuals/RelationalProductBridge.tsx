import React, { useMemo, useState } from 'react';
import { InteractiveMatrix, CellAccent } from '../math/InteractiveMatrix';
import { Tex } from '../math/Tex';

type ProductKind = 'RS' | 'SR' | 'RR' | 'SS';

interface ProductPreset {
  key: string;
  label: string;
  labels: string[];
  R: number[][];
  S: number[][];
}

// Exact official examples:
// 1. Official lecture example on {a, b, c, d}
// 2. Sheet 3 Exercise 3.1 on {1, 2, 3, 4}
const PRESETS: ProductPreset[] = [
  {
    key: 'lecture-abcd',
    label: 'Set {a, b, c, d}',
    labels: ['a', 'b', 'c', 'd'],
    R: [
      [0, 1, 0, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 1],
    ],
    S: [
      [0, 0, 0, 1],
      [0, 0, 1, 1],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
    ],
  },
  {
    key: 'sheet3-1234',
    label: 'Set {1, 2, 3, 4}',
    labels: ['1', '2', '3', '4'],
    R: [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ],
    S: [
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  },
];

// Official layout: index 1 (b / 2) top-left, index 3 (d / 4) top-right, index 0 (a / 1) bottom-left, index 2 (c / 3) bottom-right
const MINI_POS: [number, number][] = [
  [54, 152],  // a / 1 (bottom-left)
  [54, 48],   // b / 2 (top-left)
  [166, 152], // c / 3 (bottom-right)
  [166, 48],  // d / 4 (top-right)
];
const MINI_R = 16;

function miniLoop(idx: number) {
  const [cx, cy] = MINI_POS[idx];
  const dx = cx < 110 ? -1 : 1;
  const dy = cy < 100 ? -1 : 1;
  const sa = Math.atan2(dy * 0.35, dx * 0.94);
  const ea = Math.atan2(dy * 0.94, dx * 0.35);
  const sx = cx + MINI_R * Math.cos(sa);
  const sy = cy + MINI_R * Math.sin(sa);
  const ex = cx + (MINI_R + 2) * Math.cos(ea);
  const ey = cy + (MINI_R + 2) * Math.sin(ea);
  const c1x = cx + dx * 44;
  const c1y = cy + dy * 10;
  const c2x = cx + dx * 10;
  const c2y = cy + dy * 44;
  const ang = (Math.atan2(ey - c2y, ex - c2x) * 180) / Math.PI;
  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    tipX: ex,
    tipY: ey,
    ang,
  };
}

function miniArc(i: number, j: number, curved: boolean) {
  const [x1, y1] = MINI_POS[i];
  const [x2, y2] = MINI_POS[j];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bend = curved ? 15 : 0;
  const mx = (x1 + x2) / 2 + nx * bend;
  const my = (y1 + y2) / 2 + ny * bend;
  const sdx = mx - x1;
  const sdy = my - y1;
  const sl = Math.hypot(sdx, sdy) || 1;
  const sx = x1 + (sdx / sl) * (MINI_R + 1.5);
  const sy = y1 + (sdy / sl) * (MINI_R + 1.5);
  const edx = x2 - mx;
  const edy = y2 - my;
  const el = Math.hypot(edx, edy) || 1;
  const ex = x2 - (edx / el) * (MINI_R + 4);
  const ey = y2 - (edy / el) * (MINI_R + 4);
  const ang = (Math.atan2(edy, edx) * 180) / Math.PI;
  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    tipX: ex,
    tipY: ey,
    ang,
  };
}

const MiniDigraph: React.FC<{
  matrix: number[][];
  labels: string[];
  baseColor: string;
  isHighlightedEdge?: (i: number, j: number) => boolean;
}> = ({ matrix, labels, baseColor, isHighlightedEdge }) => (
  <svg viewBox="0 0 220 200" style={{ width: 200, height: 182, overflow: 'visible' }}>
    {matrix.map((row, i) =>
      row.map((val, j) => {
        if (val === 0) return null;
        const hi = isHighlightedEdge ? isHighlightedEdge(i, j) : false;
        const stroke = hi ? '#F4D35E' : baseColor;
        const geom = i === j ? miniLoop(i) : miniArc(i, j, matrix[j][i] === 1);
        return (
          <g key={`${i}-${j}`} opacity={hi ? 1 : 0.78}>
            <path
              d={geom.d}
              fill="none"
              stroke={stroke}
              strokeWidth={hi ? 2.8 : 1.9}
              strokeLinecap="round"
            />
            <polygon
              points="0,0 -8,-3.7 -8,3.7"
              fill={stroke}
              transform={`translate(${geom.tipX},${geom.tipY}) rotate(${geom.ang})`}
            />
          </g>
        );
      })
    )}
    {MINI_POS.map(([cx, cy], idx) => (
      <g key={idx}>
        <circle
          cx={cx}
          cy={cy}
          r={MINI_R}
          fill="#0b0c10"
          stroke="rgba(250,250,250,0.68)"
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy + 4.5}
          textAnchor="middle"
          fill="#FAFAFA"
          fontFamily="KaTeX_Main, Times, serif"
          fontSize={15}
          fontWeight={600}
        >
          {labels[idx]}
        </text>
      </g>
    ))}
  </svg>
);

function multiply(A: number[][], B: number[][], countPaths: boolean): number[][] {
  return A.map((row, i) =>
    row.map((_, j) => {
      let s = 0;
      for (let k = 0; k < 4; k++) s += A[i][k] * B[k][j];
      return countPaths ? s : s > 0 ? 1 : 0;
    })
  );
}

export const RelationalProductBridge: React.FC = () => {
  const [labels, setLabels] = useState<string[]>(PRESETS[0].labels);
  const [matR, setMatR] = useState<number[][]>(() => PRESETS[0].R.map((r) => [...r]));
  const [matS, setMatS] = useState<number[][]>(() => PRESETS[0].S.map((r) => [...r]));
  const [kind, setKind] = useState<ProductKind>('RS');
  const [countMode, setCountMode] = useState(false);
  const [focusPair, setFocusPair] = useState<[number, number]>([0, 2]);

  const leftMat = kind === 'SR' || kind === 'SS' ? matS : matR;
  const rightMat = kind === 'RS' || kind === 'SS' ? matS : matR;
  const leftSym = kind === 'SR' || kind === 'SS' ? 'S' : 'R';
  const rightSym = kind === 'RS' || kind === 'SS' ? 'S' : 'R';

  const prodMat = useMemo(
    () => multiply(leftMat, rightMat, countMode),
    [leftMat, rightMat, countMode]
  );

  const [fi, fj] = focusPair;
  const witnesses = useMemo(() => {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      if (leftMat[fi][k] === 1 && rightMat[k][fj] === 1) out.push(k);
    }
    return out;
  }, [leftMat, rightMat, fi, fj]);

  const loadPreset = (p: ProductPreset) => {
    setLabels(p.labels);
    setMatR(p.R.map((r) => [...r]));
    setMatS(p.S.map((r) => [...r]));
    setKind('RS');
    setFocusPair([0, 2]);
  };

  const toggleR = (r: number, c: number) =>
    setMatR((prev) => prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? 1 - v : v))));

  const toggleS = (r: number, c: number) =>
    setMatS((prev) => prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? 1 - v : v))));

  const leftAccent = (r: number, c: number, val: number): CellAccent => {
    if (r === fi && val === 1 && witnesses.includes(c)) return 'yellow';
    return val === 1 ? 'blue' : 'default';
  };

  const rightAccent = (r: number, c: number, val: number): CellAccent => {
    if (c === fj && val === 1 && witnesses.includes(r)) return 'yellow';
    return val === 1 ? 'green' : 'default';
  };

  const prodAccent = (r: number, c: number, val: number): CellAccent => {
    if (r === fi && c === fj) return val > 0 ? 'yellow' : 'red';
    return val > 0 ? 'blue' : 'default';
  };

  const terms = [0, 1, 2, 3].map((k) => {
    const a = leftMat[fi][k];
    const b = rightMat[k][fj];
    return a === 1 && b === 1 ? `\\mathbf{1 \\cdot 1}` : `${a} \\cdot ${b}`;
  });

  const formulaTex = countMode
    ? `(M_${leftSym} M_${rightSym})_{${labels[fi]},${labels[fj]}} = ${terms.join(' + ')} = ${prodMat[fi][fj]}`
    : `(M_{${kind}})_{${labels[fi]},${labels[fj]}} = \\max\\bigl(${terms.join(',\\; ')}\\bigr) = ${prodMat[fi][fj]}`;

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 4.2 · Relational Product as Graphs and Boolean Matrix Multiplication
          </div>
          <div className="figure-subtitle">
            Click any entry in the product matrix on the right to compare row i of the first factor against column j of the second factor.
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
          {(['RS', 'SR', 'RR', 'SS'] as ProductKind[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`ctrl-btn ${kind === k ? 'active' : ''}`}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
            >
              <Tex math={k} />
            </button>
          ))}
          <button
            type="button"
            className={`ctrl-btn ${countMode ? 'active' : ''}`}
            aria-pressed={countMode}
            aria-label="Count two-step paths"
            onClick={() => setCountMode((v) => !v)}
          >
            {countMode ? <Tex math="\sum_k \text{ (count)}" /> : <Tex math="\max_k \text{ (0/1)}" />}
          </button>
        </div>
      </div>

      {/* Three side-by-side Graph + Matrix columns (exact layout of slides 130-133) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 18,
          padding: '8px 24px 14px',
          justifyItems: 'center',
        }}
      >
        {/* First Factor */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15 }}>
            <Tex math={leftSym} />
          </div>
          <MiniDigraph
            matrix={leftMat}
            labels={labels}
            baseColor="#58C4DD"
            isHighlightedEdge={(i, k) => i === fi && witnesses.includes(k)}
          />
          <InteractiveMatrix
            matrix={leftMat}
            labels={labels}
            titleTex={`M_{${leftSym}}`}
            onToggle={leftSym === 'R' ? toggleR : toggleS}
            cellAccent={leftAccent}
            inActiveBand={(r) => r === fi}
          />
        </div>

        {/* Second Factor */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15 }}>
            <Tex math={rightSym} />
          </div>
          <MiniDigraph
            matrix={rightMat}
            labels={labels}
            baseColor="#83C167"
            isHighlightedEdge={(k, j) => j === fj && witnesses.includes(k)}
          />
          <InteractiveMatrix
            matrix={rightMat}
            labels={labels}
            titleTex={`M_{${rightSym}}`}
            onToggle={rightSym === 'R' ? toggleR : toggleS}
            cellAccent={rightAccent}
            inActiveBand={(_, c) => c === fj}
          />
        </div>

        {/* Product */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15 }}>
            <Tex math={kind} />
          </div>
          <MiniDigraph
            matrix={prodMat.map((r) => r.map((v) => (v > 0 ? 1 : 0)))}
            labels={labels}
            baseColor="#58C4DD"
            isHighlightedEdge={(i, j) => i === fi && j === fj}
          />
          <InteractiveMatrix
            matrix={prodMat}
            labels={labels}
            titleTex={countMode ? `M_{${leftSym}} M_{${rightSym}}` : `M_{${kind}}`}
            onToggle={(r, c) => setFocusPair([r, c])}
            selectedCell={focusPair}
            cellAccent={prodAccent}
          />
        </div>
      </div>

      {/* Clean KaTeX inner-product bar */}
      <div
        style={{
          margin: '4px 26px 8px',
          padding: '12px 18px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          fontSize: 15,
        }}
      >
        <Tex className="tex-wide" math={formulaTex} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink-secondary)' }}>
          {witnesses.length > 0 ? (
            <>
              Intermediate node{witnesses.length > 1 ? 's' : ''}{' '}
              <Tex math={`k \\in \\{${witnesses.map((w) => labels[w]).join(',\\, ')}\\}`} />:{' '}
              {witnesses.map((w, idx) => (
                <React.Fragment key={w}>
                  {idx > 0 && ', '}
                  <Tex
                    math={`${labels[fi]} \\xrightarrow{${leftSym}} ${labels[w]} \\xrightarrow{${rightSym}} ${labels[fj]}`}
                  />
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              No <Tex math="k" /> has <Tex math={`(${labels[fi]},k) \\in ${leftSym}`} /> and{' '}
              <Tex math={`(k,${labels[fj]}) \\in ${rightSym}`} />.
            </>
          )}
        </span>
      </div>

      <figcaption className="figure-caption">
        Switch among <Tex math="RS, SR, RR, SS" /> to compare both graphs and matrices on the exact
        same vertex set. Replacing <Tex math="\max_k" /> by <Tex math="\sum_k" /> turns the Boolean
        product into the ordinary matrix product counting <Tex math="2" />-step paths.
      </figcaption>
    </figure>
  );
};

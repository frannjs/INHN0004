import React, { useMemo, useState } from 'react';
import { InteractiveMatrix, CellAccent } from '../math/InteractiveMatrix';
import { Tex } from '../math/Tex';

const LABELS = ['1', '2', '3', '4'];

type ViewStage = 'k0' | 'k1' | 'k2' | 'k3' | 'le2' | 'le3' | 'plus' | 'star';

const PRESETS: { key: string; label: string; matrix: number[][] }[] = [
  {
    key: 'lecture-paths',
    label: 'Paths Example',
    // Official example: R = {(1,3),(2,1),(2,4),(3,1),(3,2)}
    matrix: [
      [0, 0, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    key: 'sheet3-cycle',
    label: '4-Cycle',
    matrix: [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ],
  },
];

function boolMul(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) =>
    row.map((_, j) => {
      for (let k = 0; k < 4; k++) {
        if (A[i][k] === 1 && B[k][j] === 1) return 1;
      }
      return 0;
    })
  );
}

function boolOr(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => (v === 1 || B[i][j] === 1 ? 1 : 0)));
}

const IDENTITY_4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

// Official layout: 2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right
const NODE_POS: [number, number][] = [
  [105, 234], // 1
  [105, 86],  // 2
  [255, 234], // 3
  [255, 86],  // 4
];
const NODE_R = 22;

function selfLoopGeom(idx: number) {
  const [cx, cy] = NODE_POS[idx];
  const dirX = cx < 180 ? -1 : 1;
  const dirY = cy < 160 ? -1 : 1;
  const sa = Math.atan2(dirY * 0.35, dirX * 0.94);
  const ea = Math.atan2(dirY * 0.94, dirX * 0.35);
  const sx = cx + NODE_R * Math.cos(sa);
  const sy = cy + NODE_R * Math.sin(sa);
  const ex = cx + (NODE_R + 3) * Math.cos(ea);
  const ey = cy + (NODE_R + 3) * Math.sin(ea);
  const c1x = cx + dirX * 62;
  const c1y = cy + dirY * 14;
  const c2x = cx + dirX * 14;
  const c2y = cy + dirY * 62;
  const angleDeg = (Math.atan2(ey - c2y, ex - c2x) * 180) / Math.PI;
  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    tipX: ex,
    tipY: ey,
    angleDeg,
  };
}

function arcGeom(i: number, j: number, hasReverse: boolean) {
  const [x1, y1] = NODE_POS[i];
  const [x2, y2] = NODE_POS[j];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bend = hasReverse ? 22 : 0;
  const mx = (x1 + x2) / 2 + nx * bend;
  const my = (y1 + y2) / 2 + ny * bend;

  const sdx = mx - x1;
  const sdy = my - y1;
  const slen = Math.hypot(sdx, sdy) || 1;
  const sx = x1 + (sdx / slen) * (NODE_R + 2);
  const sy = y1 + (sdy / slen) * (NODE_R + 2);

  const edx = x2 - mx;
  const edy = y2 - my;
  const elen = Math.hypot(edx, edy) || 1;
  const ex = x2 - (edx / elen) * (NODE_R + 5);
  const ey = y2 - (edy / elen) * (NODE_R + 5);
  const angleDeg = (Math.atan2(edy, edx) * 180) / Math.PI;

  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    tipX: ex,
    tipY: ey,
    angleDeg,
  };
}

export const TokenWalkAndClosureExplorer: React.FC = () => {
  const [baseR, setBaseR] = useState<number[][]>(() => PRESETS[0].matrix.map((r) => [...r]));
  const [stage, setStage] = useState<ViewStage>('star');

  const powers = useMemo(() => {
    const r0 = IDENTITY_4;
    const r1 = baseR;
    const r2 = boolMul(r1, r1);
    const r3 = boolMul(r2, r1);
    const r4 = boolMul(r3, r1);
    const le2 = boolOr(boolOr(r0, r1), r2);
    const le3 = boolOr(le2, r3);
    const plus = boolOr(boolOr(boolOr(r1, r2), r3), r4);
    const star = boolOr(r0, plus);
    return { r0, r1, r2, r3, r4, le2, le3, plus, star };
  }, [baseR]);

  const activeInfo = useMemo(() => {
    switch (stage) {
      case 'k0':
        return { mat: powers.r0, tex: 'M_{R^0} = I' };
      case 'k1':
        return { mat: powers.r1, tex: 'M_{R^1} = M_R' };
      case 'k2':
        return { mat: powers.r2, tex: 'M_{R^2}' };
      case 'k3':
        return { mat: powers.r3, tex: 'M_{R^3}' };
      case 'le2':
        return { mat: powers.le2, tex: 'M_{R^{\\le 2}}' };
      case 'le3':
        return { mat: powers.le3, tex: 'M_{R^{\\le 3}} = M_{R^{< 4}}' };
      case 'plus':
        return { mat: powers.plus, tex: 'M_{R^+}' };
      case 'star':
      default:
        return { mat: powers.star, tex: 'M_{R^*}' };
    }
  }, [stage, powers]);

  const toggleBase = (r: number, c: number) => {
    setBaseR((prev) =>
      prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? 1 - v : v)))
    );
  };

  const activeAccent = (r: number, c: number, val: number): CellAccent => {
    if (val === 0) return 'default';
    return baseR[r][c] === 1 ? 'blue' : 'yellow';
  };

  const STAGE_BTNS: { id: ViewStage; tex: string }[] = [
    { id: 'k0', tex: 'R^0' },
    { id: 'k1', tex: 'R^1' },
    { id: 'k2', tex: 'R^2' },
    { id: 'k3', tex: 'R^3' },
    { id: 'le2', tex: 'R^{\\le 2}' },
    { id: 'le3', tex: 'R^{\\le 3}' },
    { id: 'plus', tex: 'R^+' },
    { id: 'star', tex: 'R^*' },
  ];

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 4.3 · Exact Powers, Bounded Iteration, and Closures
          </div>
          <div className="figure-subtitle">
            Compare exact-step powers against bounded unions and closures. Edges already in R are blue; added edges are yellow.
          </div>
        </div>
        <div className="figure-controls">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="ctrl-btn"
              onClick={() => setBaseR(p.matrix.map((r) => [...r]))}
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
        }}
      >
        {STAGE_BTNS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`ctrl-btn ${stage === b.id ? 'active' : ''}`}
            aria-pressed={stage === b.id}
            onClick={() => setStage(b.id)}
          >
            <Tex math={b.tex} />
          </button>
        ))}
      </div>

      <div className="visual-split">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg
            viewBox="0 0 360 320"
            style={{ width: '100%', maxWidth: 370, height: 'auto', overflow: 'visible' }}
          >
            {baseR.map((row, i) =>
              row.map((val, j) => {
                if (val === 0 || activeInfo.mat[i][j] === 1) return null;
                const geom =
                  i === j ? selfLoopGeom(i) : arcGeom(i, j, baseR[j][i] === 1);
                return (
                  <path
                    key={`ghost-${i}-${j}`}
                    d={geom.d}
                    fill="none"
                    stroke="rgba(88, 196, 221, 0.2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                );
              })
            )}

            {activeInfo.mat.map((row, i) =>
              row.map((val, j) => {
                if (val === 0) return null;
                const isOriginal = baseR[i][j] === 1;
                const color = isOriginal ? '#58C4DD' : '#F4D35E';
                const geom =
                  i === j ? selfLoopGeom(i) : arcGeom(i, j, activeInfo.mat[j][i] === 1);
                return (
                  <g key={`act-${i}-${j}`}>
                    <path
                      d={geom.d}
                      fill="none"
                      stroke={color}
                      strokeWidth={2.4}
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

            {NODE_POS.map(([cx, cy], idx) => (
              <g key={`n-${idx}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  fill="#0b0c10"
                  stroke="rgba(250,250,250,0.68)"
                  strokeWidth={1.8}
                />
                <text
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fill="#FAFAFA"
                  fontFamily="KaTeX_Main, Times, serif"
                  fontSize={19}
                  fontWeight={600}
                >
                  {LABELS[idx]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          <InteractiveMatrix
            matrix={baseR}
            labels={LABELS}
            titleTex="M_R"
            onToggle={toggleBase}
          />
          <InteractiveMatrix
            matrix={activeInfo.mat}
            labels={LABELS}
            titleTex={activeInfo.tex}
            readOnly
            cellAccent={activeAccent}
          />
        </div>
      </div>

      <figcaption className="figure-caption">
        On the Paths Example (<Tex math="|A| = 4" />), observe that switching from{' '}
        <Tex math="R^{\le 2}" /> to <Tex math="R^{\le 3}" /> adds the single entry{' '}
        <Tex math="(1,4)" /> via <Tex math="(1,3,2,4)" />, after which{' '}
        <Tex math="R^{\le 3} = R^*" />; meanwhile <Tex math="R^+" /> and <Tex math="R^*" /> differ
        solely at the sink loop <Tex math="(4,4)" />.
      </figcaption>
    </figure>
  );
};

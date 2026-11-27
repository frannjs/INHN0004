import React, { useState } from 'react';
import { InteractiveMatrix, CellAccent } from '../math/InteractiveMatrix';
import { Tex } from '../math/Tex';

const LABELS = ['1', '2', '3', '4'];

// Official slide layout: 2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right
const NODE_POS: [number, number][] = [
  [105, 234], // 1 (bottom-left)
  [105, 86],  // 2 (top-left)
  [255, 234], // 3 (bottom-right)
  [255, 86],  // 4 (top-right)
];

const NODE_R = 22;

const PRESETS: { label: React.ReactNode; key: string; matrix: number[][] }[] = [
  {
    key: 'graph-eg',
    label: <>Graph Example</>,
    // E = {(1,4),(2,4),(2,3),(1,2),(4,4),(4,2),(3,1)}
    matrix: [
      [0, 1, 0, 1],
      [0, 0, 1, 1],
      [1, 0, 0, 0],
      [0, 1, 0, 1],
    ],
  },
  {
    key: 'reach-eg',
    label: <>Paths Example</>,
    // R = {(1,3),(2,1),(2,4),(3,1),(3,2)}
    matrix: [
      [0, 0, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    key: 'sheet3',
    label: <>4-Cycle</>,
    // R = {(1,2),(2,3),(3,4),(4,1)}
    matrix: [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ],
  },
  {
    key: 'id',
    label: <Tex math="\mathrm{Id}_{[4]}" />,
    matrix: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
];

function selfLoopPath(idx: number) {
  const [cx, cy] = NODE_POS[idx];
  const dirX = cx < 180 ? -1 : 1;
  const dirY = cy < 160 ? -1 : 1;
  const startAngle = Math.atan2(dirY * 0.35, dirX * 0.94);
  const endAngle = Math.atan2(dirY * 0.94, dirX * 0.35);
  const sx = cx + NODE_R * Math.cos(startAngle);
  const sy = cy + NODE_R * Math.sin(startAngle);
  const ex = cx + (NODE_R + 3) * Math.cos(endAngle);
  const ey = cy + (NODE_R + 3) * Math.sin(endAngle);
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

function directedArcPath(i: number, j: number, hasReverse: boolean) {
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

export const RelationGraphMatrixLab: React.FC = () => {
  const [matrix, setMatrix] = useState<number[][]>(() =>
    PRESETS[0].matrix.map((r) => [...r])
  );
  const [selectedNode, setSelectedNode] = useState<number | null>(1);
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);

  const toggleEntry = (r: number, c: number) => {
    setMatrix((prev) =>
      prev.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? 1 - val : val))
      )
    );
  };

  const applyTranspose = () => {
    setMatrix((prev) => prev.map((row, r) => row.map((_, c) => prev[c][r])));
  };

  const pairs: string[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (matrix[i][j] === 1) pairs.push(`(${LABELS[i]},${LABELS[j]})`);
    }
  }
  const setTex =
    pairs.length === 0 ? 'R = \\emptyset' : `R = \\{${pairs.join(',\\, ')}\\}`;

  const succList =
    selectedNode !== null
      ? LABELS.filter((_, j) => matrix[selectedNode][j] === 1)
      : [];
  const predList =
    selectedNode !== null
      ? LABELS.filter((_, i) => matrix[i][selectedNode] === 1)
      : [];

  const getCellAccent = (r: number, c: number, val: number): CellAccent => {
    if (hoverCell && hoverCell[0] === r && hoverCell[1] === c) return 'yellow';
    if (val === 0) return 'default';
    if (selectedNode !== null) {
      if (r === selectedNode) return 'yellow';
      if (c === selectedNode) return 'green';
    }
    return 'blue';
  };

  return (
    <figure className="figure-breakout">
      <div className="figure-header">
        <div>
          <div className="figure-title">
            Figure 4.1 · Set, Directed Graph, and Matrix Representation
          </div>
          <div className="figure-subtitle">
            Click any matrix entry to toggle its edge; click a node to highlight its successor row and predecessor column.
          </div>
        </div>
        <div className="figure-controls">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="ctrl-btn"
              onClick={() => setMatrix(p.matrix.map((r) => [...r]))}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="ctrl-btn active" onClick={applyTranspose}>
            <Tex math="R \mapsto R^\top" />
          </button>
        </div>
      </div>

      <div className="visual-split">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg
            viewBox="0 0 360 320"
            style={{ width: '100%', maxWidth: 370, height: 'auto', overflow: 'visible' }}
          >
            {hoverCell && matrix[hoverCell[0]][hoverCell[1]] === 0 && (() => {
              const [hi, hj] = hoverCell;
              const geom =
                hi === hj
                  ? selfLoopPath(hi)
                  : directedArcPath(hi, hj, matrix[hj][hi] === 1);
              return (
                <g opacity={0.5}>
                  <path
                    d={geom.d}
                    fill="none"
                    stroke="#F4D35E"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                  />
                  <polygon
                    points="0,0 -9,-4.2 -9,4.2"
                    fill="#F4D35E"
                    transform={`translate(${geom.tipX},${geom.tipY}) rotate(${geom.angleDeg})`}
                  />
                </g>
              );
            })()}

            {matrix.map((row, i) =>
              row.map((val, j) => {
                if (val === 0) return null;
                const isHovered =
                  hoverCell !== null && hoverCell[0] === i && hoverCell[1] === j;
                const isOutgoing = selectedNode !== null && i === selectedNode;
                const isIncoming = selectedNode !== null && j === selectedNode;

                let color = '#58C4DD';
                let width = 2.3;
                if (isHovered || isOutgoing) {
                  color = '#F4D35E';
                  width = 3.0;
                } else if (isIncoming) {
                  color = '#83C167';
                  width = 2.8;
                }

                const geom =
                  i === j
                    ? selfLoopPath(i)
                    : directedArcPath(i, j, matrix[j][i] === 1);

                return (
                  <g
                    key={`edge-${i}-${j}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleEntry(i, j)}
                  >
                    <path d={geom.d} fill="none" stroke="transparent" strokeWidth={14} />
                    <path
                      d={geom.d}
                      fill="none"
                      stroke={color}
                      strokeWidth={width}
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

            {NODE_POS.map(([cx, cy], idx) => {
              const isSelected = selectedNode === idx;
              return (
                <g
                  key={`node-${idx}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setSelectedNode((prev) => (prev === idx ? null : idx))
                  }
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={NODE_R}
                    fill={isSelected ? '#17160c' : '#0b0c10'}
                    stroke={isSelected ? '#F4D35E' : 'rgba(250, 250, 250, 0.72)'}
                    strokeWidth={isSelected ? 2.4 : 1.8}
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
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <InteractiveMatrix
            matrix={matrix}
            labels={LABELS}
            titleTex="M_R = (r_{i,j})_{i,j \in [4]}"
            onToggle={toggleEntry}
            onHoverCell={setHoverCell}
            cellAccent={getCellAccent}
            inActiveBand={(r, c) =>
              selectedNode !== null && (r === selectedNode || c === selectedNode)
            }
          />

          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 14,
              padding: '12px 16px',
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            <div>
              <Tex className="tex-wide" math={setTex} />
            </div>
            {selectedNode !== null && (
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  marginTop: 8,
                  paddingTop: 8,
                  fontSize: 14.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div>
                  <span style={{ color: 'var(--m-yellow)', fontWeight: 600 }}>
                    Successors (row {LABELS[selectedNode]}):
                  </span>{' '}
                  <Tex
                    math={`${LABELS[selectedNode]}R = ${
                      succList.length ? `\\{${succList.join(',\\, ')}\\}` : '\\emptyset'
                    }`}
                  />
                </div>
                <div>
                  <span style={{ color: 'var(--m-green)', fontWeight: 600 }}>
                    Predecessors (col {LABELS[selectedNode]}):
                  </span>{' '}
                  <Tex
                    math={`R${LABELS[selectedNode]} = ${
                      predList.length ? `\\{${predList.join(',\\, ')}\\}` : '\\emptyset'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <figcaption className="figure-caption">
        Fixing the standard enumeration <Tex math="1, 2, 3, 4" />, row <Tex math="i" /> of{' '}
        <Tex math="M_R" /> encodes <Tex math="iR" /> and column <Tex math="j" /> encodes{' '}
        <Tex math="Rj" />. Transposing the relation transposes its matrix:{' '}
        <Tex math="M_{R^\top} = M_R^\top" />.
      </figcaption>
    </figure>
  );
};

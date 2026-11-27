import React, { useId, useState } from 'react';
import { Tex } from './Tex';

export type CellAccent = 'default' | 'blue' | 'green' | 'yellow' | 'red';

const directions: Record<string, [number, number]> = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
};

interface InteractiveMatrixProps {
  matrix: number[][];
  labels?: string[];
  titleTex?: string;
  readOnly?: boolean;
  selectedCell?: [number, number];
  onToggle?: (row: number, col: number) => void;
  onHoverCell?: (pos: [number, number] | null) => void;
  cellAccent?: (row: number, col: number, val: number) => CellAccent;
  inActiveBand?: (row: number, col: number) => boolean;
}

export const InteractiveMatrix: React.FC<InteractiveMatrixProps> = ({
  matrix,
  labels = ['1', '2', '3', '4'],
  titleTex,
  readOnly = false,
  selectedCell,
  onToggle,
  onHoverCell,
  cellAccent,
  inActiveBand,
}) => {
  const n = matrix.length;
  const titleId = useId();
  const [focusedCell, setFocusedCell] = useState<[number, number]>([0, 0]);
  const tabRow = Math.min(focusedCell[0], n - 1);
  const tabCol = Math.min(focusedCell[1], n - 1);

  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, row: number, col: number) {
    const shift = directions[event.key];
    if (!shift) return;
    event.preventDefault();
    const nextRow = Math.max(0, Math.min(n - 1, row + shift[0]));
    const nextCol = Math.max(0, Math.min(n - 1, col + shift[1]));
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
      `[data-entry="${nextRow}-${nextCol}"]`
    )?.focus();
  }

  return (
    <div className="latex-matrix-container" role="group" aria-label={titleTex ? undefined : 'Matrix'}
      aria-labelledby={titleTex ? titleId : undefined}
      aria-description={readOnly ? undefined : 'Use the arrow keys to move between entries.'}>
      {titleTex && (
        <div id={titleId} style={{ marginBottom: 8, fontSize: 15 }}>
          <Tex math={titleTex} />
        </div>
      )}

      <div
        className="latex-matrix-col-labels"
        style={{ gridTemplateColumns: `repeat(${n}, var(--matrix-column-size))`, gap: 2, paddingLeft: 14, paddingRight: 14 }}
      >
        {labels.map((lbl, idx) => (
          <div
            key={idx}
            style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-muted)' }}
          >
            <Tex math={lbl} />
          </div>
        ))}
      </div>

      <div className="latex-matrix-body-row">
        <div className="latex-matrix-row-labels" style={{ gap: 2 }}>
          {labels.map((lbl, idx) => (
            <div
              key={idx}
              style={{
                height: 34,
                width: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                fontSize: 12,
                color: 'var(--ink-muted)',
              }}
            >
              <Tex math={lbl} />
            </div>
          ))}
        </div>

        <div
          className="paren-matrix-wrap"
          onMouseLeave={(event) => {
            onHoverCell?.(event.currentTarget.contains(document.activeElement) ? focusedCell : null);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) onHoverCell?.(null);
          }}
        >
          {/* Smooth Computer-Modern style left parenthesis */}
          <svg className="paren-svg" viewBox="0 0 14 140" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M 12 3 C 3 24, 3 116, 12 137"
              fill="none"
              stroke="rgba(250,250,250,0.78)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <div
            className="paren-grid"
            style={{ gridTemplateColumns: `repeat(${n}, var(--matrix-column-size))` }}
          >
            {matrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const accent = cellAccent
                  ? cellAccent(rIdx, cIdx, val)
                  : val === 1
                  ? 'blue'
                  : 'default';
                const band = inActiveBand ? inActiveBand(rIdx, cIdx) : false;

                let cls = 'mat-entry-btn';
                if (accent === 'blue') cls += ' is-one';
                else if (accent === 'green') cls += ' is-green';
                else if (accent === 'yellow') cls += ' is-yellow';
                else if (accent === 'red') cls += ' is-red';
                if (band) cls += ' in-active-band';
                const entry = `Row ${labels[rIdx]}, column ${labels[cIdx]}, value ${val === -1 ? 'pending' : val}`;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    type="button"
                    className={cls}
                    disabled={readOnly}
                    tabIndex={rIdx === tabRow && cIdx === tabCol ? 0 : -1}
                    data-entry={`${rIdx}-${cIdx}`}
                    aria-label={entry}
                    aria-pressed={readOnly ? undefined : selectedCell
                      ? selectedCell[0] === rIdx && selectedCell[1] === cIdx
                      : val === 1}
                    onClick={() => onToggle?.(rIdx, cIdx)}
                    onMouseEnter={() => onHoverCell?.([rIdx, cIdx])}
                    onFocus={() => {
                      setFocusedCell([rIdx, cIdx]);
                      onHoverCell?.([rIdx, cIdx]);
                    }}
                    onKeyDown={(event) => moveFocus(event, rIdx, cIdx)}
                    title={entry}
                  >
                    {val === -1 ? '·' : val}
                  </button>
                );
              })
            )}
          </div>

          {/* Smooth Computer-Modern style right parenthesis */}
          <svg className="paren-svg" viewBox="0 0 14 140" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M 2 3 C 11 24, 11 116, 2 137"
              fill="none"
              stroke="rgba(250,250,250,0.78)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

import type { ReactNode } from "react";
import { C, FONT_MONO } from "../theme";

export type CellMark = "default" | "active" | "compare" | "filled" | "result" | "muted";

function fill(mark: CellMark): [string, string] {
  const map: Record<CellMark, [string, string]> = {
    default: [C.gridDefault, C.text],
    active: [C.active, C.ink],
    compare: [C.pointer, C.ink],
    filled: [C.gridFilled, C.text],
    result: [C.sorted, C.ink],
    muted: [C.gridMuted, C.textMuted],
  };
  return map[mark];
}

// A 2D table used by dynamic-programming visualizations (and anything grid-shaped).
// `cells[r][c]` holds the display value; `mark(r,c)` returns its colour state.
export function Grid({
  rows,
  cols,
  cell,
  mark,
  rowLabels,
  colLabels,
  size = 46,
}: {
  rows: number;
  cols: number;
  cell: (r: number, c: number) => ReactNode;
  mark: (r: number, c: number) => CellMark;
  rowLabels?: (r: number) => ReactNode;
  colLabels?: (c: number) => ReactNode;
  size?: number;
}) {
  return (
    <div style={{ display: "inline-grid", gridTemplateColumns: `${colLabels ? `${size}px ` : ""}repeat(${cols}, ${size}px)`, gap: 4, fontFamily: FONT_MONO }}>
      {colLabels && <div />}
      {colLabels &&
        Array.from({ length: cols }, (_, c) => (
          <div key={`ch${c}`} style={{ textAlign: "center", color: C.textMuted, fontSize: 14, height: 22 }}>
            {colLabels(c)}
          </div>
        ))}
      {Array.from({ length: rows }, (_, r) => (
        <Row key={r}>
          {rowLabels && (
            <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 14 }}>
              {rowLabels(r)}
            </div>
          )}
          {Array.from({ length: cols }, (_, c) => {
            const [bg, fg] = fill(mark(r, c));
            return (
              <div
                key={c}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 8,
                  background: bg,
                  color: fg,
                  border: `1px solid ${C.surfaceBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: size * 0.32,
                  fontWeight: 700,
                  transition: "background 200ms, color 200ms",
                }}
              >
                {cell(r, c)}
              </div>
            );
          })}
        </Row>
      ))}
    </div>
  );
}

// Grid uses display:contents rows so the parent grid lays everything out.
function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: "contents" }}>{children}</div>;
}

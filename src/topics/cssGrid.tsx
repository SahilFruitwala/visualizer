import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

interface GridCell {
  label: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

interface Step extends StepBase {
  phase: string;
  columns: string;
  gap: number;
  cells: GridCell[];
  highlight?: string;
}

const build = (): Step[] => [
  {
    phase: "3 equal columns",
    columns: "1fr 1fr 1fr",
    gap: 8,
    cells: [
      { label: "A", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "B", colStart: 2, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "C", colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
    ],
    highlight: "grid-template-columns",
    chapter: "Grid container",
    caption: "display:grid with grid-template-columns: 1fr 1fr 1fr — three equal tracks.",
  },
  {
    phase: "gap: 16px",
    columns: "1fr 1fr 1fr",
    gap: 16,
    cells: [
      { label: "A", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "B", colStart: 2, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "C", colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
    ],
    highlight: "gap",
    caption: "gap adds uniform spacing between rows and columns (replaces margin hacks).",
  },
  {
    phase: "span 2 columns",
    columns: "1fr 1fr 1fr",
    gap: 8,
    cells: [
      { label: "Header", colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
      { label: "Nav", colStart: 1, colSpan: 1, rowStart: 2, rowSpan: 2 },
      { label: "Main", colStart: 2, colSpan: 2, rowStart: 2, rowSpan: 1 },
      { label: "Footer", colStart: 2, colSpan: 2, rowStart: 3, rowSpan: 1 },
    ],
    highlight: "grid-column",
    chapter: "Spanning cells",
    caption: "grid-column: 1 / span 3 — Header spans all columns. Main spans 2.",
  },
  {
    phase: "fixed + flexible",
    columns: "200px 1fr 1fr",
    gap: 8,
    cells: [
      { label: "Sidebar", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 2 },
      { label: "Content", colStart: 2, colSpan: 2, rowStart: 1, rowSpan: 1 },
      { label: "Ads", colStart: 2, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { label: "Meta", colStart: 3, colSpan: 1, rowStart: 2, rowSpan: 1 },
    ],
    highlight: "grid-template-columns",
    caption: "Mix fixed (200px) and flexible (1fr) tracks — classic sidebar layout. ✓",
  },
];

const CODE = `.layout {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  gap: 8px;
}
.sidebar { grid-row: 1 / span 2; }
.content { grid-column: 2 / span 2; }`;

function cellTone(cell: GridCell): { bg: string; border: string } {
  if (cell.rowSpan > 1) return { bg: C.pointer, border: C.pointerBorder };
  if (cell.colSpan > 1) return { bg: C.active, border: C.activeBorder };
  return { bg: C.default, border: C.defaultBorder };
}

/** Fixed px tracks need a wider container or 1fr columns collapse to slivers. */
function gridWidth(columns: string): number {
  const pxMatch = columns.match(/(\d+)px/);
  if (!pxMatch) return 320;
  const fixed = Number(pxMatch[1]);
  return Math.max(480, fixed + 280);
}

function GridViz({ columns, gap, cells, highlight }: Pick<Step, "columns" | "gap" | "cells" | "highlight">) {
  const maxRow = Math.max(...cells.map((c) => c.rowStart + c.rowSpan - 1));
  const width = gridWidth(columns);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: columns,
          gridTemplateRows: `repeat(${maxRow}, minmax(52px, auto))`,
          gap,
          padding: 12,
          border: `2px solid ${C.surfaceBorder}`,
          borderRadius: 10,
          width,
          maxWidth: "100%",
          background: C.surface,
        }}
      >
        {cells.map((cell) => {
          const tone = cellTone(cell);
          return (
          <div
            key={cell.label}
            style={{
              gridColumn: `${cell.colStart} / span ${cell.colSpan}`,
              gridRow: `${cell.rowStart} / span ${cell.rowSpan}`,
              padding: "10px 8px",
              background: tone.bg,
              borderRadius: 6,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 13,
              color: C.ink,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${tone.border}`,
            }}
          >
            {cell.label}
          </div>
          );
        })}
      </div>
      {highlight && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.active, fontWeight: 700 }}>
          {highlight}: {highlight === "gap" ? `${gap}px` : columns}
        </div>
      )}
    </div>
  );
}

export const cssGrid: Topic = {
  id: "css-grid",
  title: "CSS Grid",
  category: "Layout & CSS",
  blurb: "Two-dimensional layout with tracks, gap, and spanning.",
  prerequisites: ["flexbox-box-model"],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "CSS Grid lays out children in explicit rows and columns — unlike Flexbox which is one-dimensional. grid-template-columns defines track sizes (px, fr, auto). gap separates cells cleanly.\n\ngrid-column and grid-row let items span multiple tracks, enabling page layouts (header, sidebar, footer) without nested wrappers.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.text, fontWeight: 700 }}>{s.phase}</div>
          <GridViz columns={s.columns} gap={s.gap} cells={s.cells} highlight={s.highlight} />
        </div>
      ),
    }),
};

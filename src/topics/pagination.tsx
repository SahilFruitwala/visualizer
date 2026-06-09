import { HttpMessage } from "../components/ApiFlow";
import { Cell, Row } from "../components/primitives";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

const ITEMS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface Step extends StepBase {
  mode: "offset" | "cursor";
  path: string;
  sliceStart: number;
  sliceEnd: number;
  meta: string;
}

function build(): Step[] {
  const steps: Step[] = [];

  // Offset pagination
  steps.push({
    mode: "offset",
    path: "/items?page=1&limit=3",
    sliceStart: 0,
    sliceEnd: 3,
    meta: "hasMore: true",
    chapter: "Offset pagination",
    caption: "Offset: page=1, limit=3 → return items 0–2.",
  });
  steps.push({
    mode: "offset",
    path: "/items?page=2&limit=3",
    sliceStart: 3,
    sliceEnd: 6,
    meta: "hasMore: true",
    caption: "Offset: page=2 → skip (page-1)×limit items, return next 3.",
  });
  steps.push({
    mode: "offset",
    path: "/items?page=3&limit=3",
    sliceStart: 6,
    sliceEnd: 8,
    meta: "hasMore: false",
    caption: "Offset: page=3 → last page with 2 items. hasMore: false.",
  });

  // Cursor pagination
  steps.push({
    mode: "cursor",
    path: "/items?limit=3",
    sliceStart: 0,
    sliceEnd: 3,
    meta: 'nextCursor: "c3"',
    chapter: "Cursor pagination",
    caption: "Cursor: first request → first 3 items + opaque nextCursor.",
  });
  steps.push({
    mode: "cursor",
    path: "/items?limit=3&cursor=c3",
    sliceStart: 3,
    sliceEnd: 6,
    meta: 'nextCursor: "c6"',
    caption: "Cursor: pass nextCursor → server finds position after C.",
  });
  steps.push({
    mode: "cursor",
    path: "/items?limit=3&cursor=c6",
    sliceStart: 6,
    sliceEnd: 8,
    meta: "nextCursor: null",
    caption: "Cursor: last page → remaining items, no next cursor.",
  });

  return steps;
}

const CODE = `// Offset — simple but slow on deep pages (OFFSET 9000)
fetch("/items?page=3&limit=3");

// Cursor — stable for live feeds; no skipped/duplicate rows
let cursor = null;
do {
  const url = cursor ? \`/items?cursor=\${cursor}\` : "/items?limit=3";
  const { items, nextCursor } = await fetch(url).then(r => r.json());
  cursor = nextCursor;
} while (cursor);`;

export const pagination: Topic = {
  id: "pagination",
  title: "Pagination",
  category: "API",
  blurb: "Offset pages vs cursor-based paging.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Offset pagination uses page number × page size. It's easy but gets slow on deep pages (the DB must scan and discard rows). Cursor pagination uses an opaque token pointing to where the last page ended — better for live feeds and large datasets.\n\nAlways return whether more pages exist (hasMore or nextCursor).",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: s.mode === "offset" ? C.pointer : C.highlight,
              fontWeight: 700,
            }}
          >
            {s.mode === "offset" ? "Offset pagination" : "Cursor pagination"}
          </div>
          <HttpMessage direction="request" method="GET" path={s.path} highlight={["line"]} />
          <Row gap={8}>
            {ITEMS.map((item, i) => {
              const inSlice = i >= s.sliceStart && i < s.sliceEnd;
              return (
                <Cell
                  key={i}
                  value={item}
                  state={inSlice ? "sorted" : "muted"}
                  size={52}
                  sub={i}
                />
              );
            })}
          </Row>
          <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>
            Response: [{ITEMS.slice(s.sliceStart, s.sliceEnd).join(", ")}] · {s.meta}
          </div>
        </div>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

// A sorted table of 12 rows (by id). We page in chunks of 3 to reach page 3.
const TOTAL = 12;
const PAGE = 3;
const TARGET_PAGE = 3; // fetch the 3rd page (rows 7,8,9)

interface Step extends StepBase {
  mode: "offset" | "cursor";
  // index of the row the engine is currently touching (-1 = none yet)
  scanAt: number;
  skipped: number; // rows scanned then discarded
  returned: number[]; // 1-based row ids returned
  rowsTouched: number;
  query: string;
}

function build(): Step[] {
  const steps: Step[] = [];
  const startIdx = (TARGET_PAGE - 1) * PAGE; // 6 → rows 7,8,9

  // ---- OFFSET: must scan and discard the first OFFSET rows ----
  steps.push({
    mode: "offset",
    scanAt: -1,
    skipped: 0,
    returned: [],
    rowsTouched: 0,
    query: `SELECT * FROM posts ORDER BY id LIMIT ${PAGE} OFFSET ${startIdx};`,
    chapter: "OFFSET: skip-then-scan",
    caption: `Page ${TARGET_PAGE} with OFFSET ${startIdx}. The engine still has to walk past those ${startIdx} rows.`,
    codeLines: [0, 1],
  });
  for (let i = 0; i < startIdx; i++) {
    steps.push({
      mode: "offset",
      scanAt: i,
      skipped: i + 1,
      returned: [],
      rowsTouched: i + 1,
      query: `... OFFSET ${startIdx}`,
      caption: `Read row ${i + 1} and throw it away — only counting toward the offset.`,
      codeLines: [1],
    });
  }
  const offReturned: number[] = [];
  for (let i = startIdx; i < startIdx + PAGE; i++) {
    offReturned.push(i + 1);
    steps.push({
      mode: "offset",
      scanAt: i,
      skipped: startIdx,
      returned: [...offReturned],
      rowsTouched: i + 1,
      query: `... LIMIT ${PAGE} OFFSET ${startIdx}`,
      caption: `Now return row ${i + 1}. Total rows touched: ${i + 1} (deeper pages get slower).`,
      codeLines: [0],
    });
  }

  // ---- CURSOR: seek straight past the last seen id ----
  const lastSeenId = startIdx; // pretend pages 1–2 ended at id 6
  steps.push({
    mode: "cursor",
    scanAt: -1,
    skipped: 0,
    returned: [],
    rowsTouched: 0,
    query: `SELECT * FROM posts WHERE id > ${lastSeenId} ORDER BY id LIMIT ${PAGE};`,
    chapter: "Cursor: seek by key",
    caption: `Instead of an offset, remember the last id seen (${lastSeenId}) and seek with WHERE id > ${lastSeenId}.`,
    codeLines: [3, 4],
  });
  steps.push({
    mode: "cursor",
    scanAt: startIdx,
    skipped: 0,
    returned: [],
    rowsTouched: 1,
    query: `WHERE id > ${lastSeenId}`,
    caption: `The index jumps directly to id ${lastSeenId + 1} — no scanning of earlier rows.`,
    codeLines: [4],
  });
  const curReturned: number[] = [];
  for (let i = startIdx; i < startIdx + PAGE; i++) {
    curReturned.push(i + 1);
    steps.push({
      mode: "cursor",
      scanAt: i,
      skipped: 0,
      returned: [...curReturned],
      rowsTouched: curReturned.length,
      query: `WHERE id > ${lastSeenId} LIMIT ${PAGE}`,
      caption: `Return row ${i + 1}. Rows touched: ${curReturned.length} — same cost for page 3 or page 3000.`,
      codeLines: [3],
    });
  }

  return steps;
}

const CODE = `// OFFSET pagination — simple, but skips rows the engine still scans
SELECT * FROM posts ORDER BY id
LIMIT 3 OFFSET 6;        // page 3: walks past 6 rows first

// Cursor (keyset) pagination — seek past the last id you saw
SELECT * FROM posts
WHERE id > 6 ORDER BY id // index seeks straight to id 7
LIMIT 3;`;

export const dbCursorOffset: Topic = {
  id: "db-cursor-offset",
  title: "Cursor vs Offset Paging",
  category: "Database",
  blurb: "Why OFFSET slows down and keyset cursors don't.",
  useWhen: "Paging large/changing tables where deep pages must stay fast.",
  badges: ["OFFSET: O(offset)", "Cursor: O(log n)"],
  prerequisites: ["db-index", "pagination"],
  quiz: [
    {
      question: "Why does OFFSET get slower on deeper pages?",
      options: [
        "It re-sorts the table each time",
        "The engine still reads and discards every row before the offset",
        "It opens a new connection per page",
        "Indexes stop working past page 1",
      ],
      correctIndex: 1,
      explanation:
        "OFFSET N means scan past N rows before returning results, so page 3000 touches thousands of rows.",
    },
    {
      question: "What is a downside of cursor (keyset) pagination?",
      options: [
        "It can't use an index",
        "You can't easily jump to an arbitrary page number",
        "It returns duplicate rows",
        "It only works on small tables",
      ],
      correctIndex: 1,
      explanation:
        "Keyset paging needs the last row's key to fetch the next page, so 'jump to page 50' isn't natural — but it's stable and fast for infinite scroll.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "OFFSET pagination is easy to write but the database must read and discard every row before the offset — so page N costs O(offset), and deep pages crawl. It can also skip or duplicate rows if data is inserted between requests.\n\nCursor (keyset) pagination remembers the last row's sort key and uses WHERE key > lastSeen, letting an index seek straight to the next page in O(log n). Cost stays flat no matter how deep you go, and results are stable under inserts. The trade-off: you can't jump to an arbitrary page number — ideal for infinite scroll and live feeds.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: s.mode === "offset" ? C.compare : C.sorted,
              fontWeight: 700,
            }}
          >
            {s.mode === "offset" ? "OFFSET pagination" : "Cursor (keyset) pagination"}
          </div>

          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              color: C.textMuted,
              background: C.cellMuted,
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            {s.query}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 560 }}>
            {Array.from({ length: TOTAL }, (_, i) => {
              const id = i + 1;
              const isReturned = s.returned.includes(id);
              const isScanning = i === s.scanAt && !isReturned;
              const isDiscarded = s.mode === "offset" && !isReturned && i < s.skipped;
              let bg = "transparent";
              let border = C.defaultBorder;
              let color = C.text;
              if (isReturned) {
                bg = C.sorted;
                border = C.sorted;
                color = C.ink;
              } else if (isScanning) {
                bg = s.mode === "offset" ? C.compare : C.active;
                border = bg;
                color = C.ink;
              } else if (isDiscarded) {
                border = C.compare;
                color = C.textMuted;
              }
              return (
                <div
                  key={id}
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_MONO,
                    fontSize: 14,
                    borderRadius: 7,
                    background: bg,
                    border: `2px solid ${border}`,
                    color,
                    opacity: isDiscarded ? 0.7 : 1,
                    textDecoration: isDiscarded ? "line-through" : "none",
                    transition: "all 180ms ease",
                  }}
                >
                  {id}
                </div>
              );
            })}
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>
            rows touched:{" "}
            <span style={{ color: s.mode === "offset" ? C.compare : C.sorted, fontWeight: 700 }}>
              {s.rowsTouched}
            </span>
            {s.mode === "offset" && s.skipped > 0 ? `  ·  discarded: ${s.skipped}` : ""}
            {"  ·  returned: ["}
            {s.returned.join(", ")}
            {"]"}
          </div>
        </div>
      ),
    }),
};

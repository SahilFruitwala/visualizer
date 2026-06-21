import { Cell, Row } from "../components/primitives";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

// A tiny "users" table: id is the primary key, we search by email.
const ROWS = [
  { id: 1, email: "amy@x.io" },
  { id: 2, email: "ben@x.io" },
  { id: 3, email: "cara@x.io" },
  { id: 4, email: "dan@x.io" },
  { id: 5, email: "eve@x.io" },
  { id: 6, email: "finn@x.io" },
  { id: 7, email: "gus@x.io" },
  { id: 8, email: "hana@x.io" },
];

const TARGET = "finn@x.io"; // row 6

// Sorted copy of the emails — this is what a B-tree index stores.
const SORTED = [...ROWS].sort((a, b) => a.email.localeCompare(b.email));
const TARGET_SORTED_POS = SORTED.findIndex((r) => r.email === TARGET);

interface Step extends StepBase {
  mode: "scan" | "index";
  // For scan: which row is currently being checked.
  scanAt?: number;
  // For index: the binary-search window over the sorted index.
  lo?: number;
  hi?: number;
  mid?: number;
  found?: number; // table id of the matched row
  rowsRead: number;
}

function build(): Step[] {
  const steps: Step[] = [];

  // ---- Full table scan ----
  for (let i = 0; i < ROWS.length; i++) {
    const hit = ROWS[i].email === TARGET;
    steps.push({
      mode: "scan",
      scanAt: i,
      rowsRead: i + 1,
      found: hit ? ROWS[i].id : undefined,
      chapter: i === 0 ? "Without an index: full scan" : undefined,
      caption: hit
        ? `Row ${ROWS[i].id} matches "${TARGET}". But the engine read ${i + 1} rows to get here.`
        : `Check row ${ROWS[i].id} (${ROWS[i].email}) — no match, keep scanning.`,
      codeLines: [0, 1],
    });
    if (hit) break;
  }

  // ---- Index lookup (binary search over the sorted B-tree index) ----
  let lo = 0;
  let hi = SORTED.length - 1;
  let probes = 0;
  steps.push({
    mode: "index",
    lo,
    hi,
    rowsRead: 0,
    chapter: "With an index: B-tree lookup",
    caption: "An index on email keeps the values sorted, so the engine can binary-search instead of scan.",
    codeLines: [3, 4],
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    probes++;
    const cmp = SORTED[mid].email.localeCompare(TARGET);
    if (cmp === 0) {
      steps.push({
        mode: "index",
        lo,
        hi,
        mid,
        rowsRead: probes,
        found: SORTED[mid].id,
        caption: `Found "${TARGET}" at index probe ${probes}. The engine read just ${probes} index entries.`,
        codeLines: [4],
      });
      break;
    }
    steps.push({
      mode: "index",
      lo,
      hi,
      mid,
      rowsRead: probes,
      caption:
        cmp < 0
          ? `"${SORTED[mid].email}" < target → discard the left half.`
          : `"${SORTED[mid].email}" > target → discard the right half.`,
      codeLines: [5, 6],
    });
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }

  return steps;
}

const CODE = `// Without an index — O(n): the engine reads every row.
SELECT * FROM users WHERE email = 'finn@x.io';
// → Seq Scan on users  (rows read = table size)

// With an index — O(log n): CREATE INDEX idx_email ON users(email);
SELECT * FROM users WHERE email = 'finn@x.io';
// → Index Scan: binary-search the sorted B-tree,
//   then jump straight to the matching row.`;

export const dbIndex: Topic = {
  id: "db-index",
  title: "Database Index",
  category: "Database",
  blurb: "Full table scan vs B-tree index lookup.",
  useWhen: "A column is filtered or sorted often and the table is large.",
  badges: ["Scan: O(n)", "Index: O(log n)"],
  quiz: [
    {
      question: "What does a B-tree index let the database avoid?",
      options: [
        "Storing the column twice",
        "Reading every row (a full scan)",
        "Using primary keys",
        "Writing to disk",
      ],
      correctIndex: 1,
      explanation:
        "An index keeps values sorted, so the engine can binary-search to the row instead of scanning the whole table.",
    },
    {
      question: "What is a real cost of adding an index?",
      options: [
        "Reads become slower",
        "Writes/updates must also maintain the index",
        "The table can no longer be queried",
        "Foreign keys stop working",
      ],
      correctIndex: 1,
      explanation:
        "Indexes speed up reads but add overhead on INSERT/UPDATE/DELETE and use extra storage.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Without an index the database does a sequential scan: it reads rows one by one until it finds a match — O(n). An index (typically a B-tree) keeps the column's values sorted alongside pointers to the rows, so the engine binary-searches to the value in O(log n), then jumps to the row.\n\nThe trade-off: indexes speed up reads but slow down writes (every insert/update must keep the index sorted) and use extra storage. Index the columns you filter, join, or sort on the most.",
      renderStep: (s) => {
        const rows = s.mode === "scan" ? ROWS : SORTED;
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: s.mode === "scan" ? C.compare : C.sorted,
                fontWeight: 700,
              }}
            >
              {s.mode === "scan" ? "Full table scan" : "Index (sorted B-tree)"} · WHERE email = "{TARGET}"
            </div>

            <Row gap={8}>
              {rows.map((r, i) => {
                let state: "default" | "compare" | "active" | "sorted" | "muted" = "default";
                if (s.mode === "scan") {
                  if (s.found != null && r.id === s.found) state = "sorted";
                  else if (i === s.scanAt) state = "compare";
                  else if (s.scanAt != null && i < s.scanAt) state = "muted";
                } else {
                  const inWindow = s.lo != null && s.hi != null && i >= s.lo && i <= s.hi;
                  if (s.found != null && r.id === s.found) state = "sorted";
                  else if (i === s.mid) state = "active";
                  else if (!inWindow) state = "muted";
                }
                return (
                  <Cell
                    key={r.id}
                    value={
                      <span style={{ fontSize: 13, fontFamily: FONT_MONO }}>{r.email.split("@")[0]}</span>
                    }
                    state={state}
                    size={58}
                    sub={`#${r.id}`}
                  />
                );
              })}
            </Row>

            <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>
              rows read:{" "}
              <span style={{ color: s.mode === "scan" ? C.compare : C.sorted, fontWeight: 700 }}>
                {s.rowsRead}
              </span>
              {s.mode === "index" && s.found == null && TARGET_SORTED_POS >= 0 ? " · binary search" : ""}
            </div>
          </div>
        );
      },
    }),
};

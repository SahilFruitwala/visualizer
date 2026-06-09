import { Arrow } from "../components/primitives";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  levels: number[][];
  search: number | null;
  found: boolean;
  path: number[];
}

function build(): Step[] {
  const steps: Step[] = [];
  const levels: number[][] = [[], [3, 12, 22], [3, 7, 12, 18, 22]];
  steps.push({ levels: levels.map((l) => [...l]), search: null, found: false, path: [], chapter: "Structure", caption: "Skip list: sorted linked list with express lanes — O(log n) expected search." });
  const target = 12;
  steps.push({ levels: levels.map((l) => [...l]), search: target, found: false, path: [], caption: `search(${target}) — start at top level, move right while less.` });
  steps.push({ levels: levels.map((l) => [...l]), search: target, found: false, path: [3], caption: "Level 2: 3 < 12 → advance to 12." });
  steps.push({ levels: levels.map((l) => [...l]), search: target, found: true, path: [3, 12], caption: `Found ${target} at level 2. ✓` });
  return steps;
}

const CODE = `// Express lane skips middle nodes
function search(head, target) {
  let cur = head;
  for (let lvl = MAX; lvl >= 0; lvl--) {
    while (cur.forward[lvl] && cur.forward[lvl].val < target)
      cur = cur.forward[lvl];
  }
  return cur.forward[0]?.val === target;
}`;

export const skipList: Topic = {
  id: "skip-list",
  title: "Skip List",
  category: "Advanced",
  blurb: "Sorted linked list with express lanes for O(log n) search.",
  prerequisites: ["linked-list", "binary-search"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Skip lists add random-height forward pointers so search can skip runs of nodes — like balanced trees but simpler to implement (used in Redis sorted sets).\n\nExpected O(log n) search/insert.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        {s.levels.map((row, li) => (
          <div key={li} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted, width: 24 }}>L{row.length < 5 ? 2 - li : 0}</span>
            {row.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "8px 14px", borderRadius: 8, background: s.path.includes(v) ? C.active : C.default, border: `2px solid ${C.surfaceBorder}`, fontFamily: FONT_MONO, fontWeight: 700, color: s.path.includes(v) ? C.ink : C.text }}>{v}</div>
                {i < row.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        ))}
        {s.search != null && <div style={{ fontFamily: FONT_MONO, color: C.textMuted }}>searching {s.search}</div>}
      </div>
    ),
  }),
};

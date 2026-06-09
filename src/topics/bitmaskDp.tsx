import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const N = 4;
interface Step extends StepBase {
  mask: number;
  dp: Record<number, number>;
  highlight?: number;
  phase: string;
}

function build(): Step[] {
  const steps: Step[] = [];
  const dp: Record<number, number> = { 0: 0 };
  const snap = (caption: string, mask: number, extra?: Partial<Step>) => steps.push({ mask, dp: { ...dp }, phase: "TSP bitmask", caption, ...extra });

  snap("Bitmask DP: dp[mask] = min cost visiting cities in mask.", 0, { chapter: "State compression" });
  dp[1] = 0; snap("Start at city 0 → mask=0001 (only city 0 visited).", 1, { highlight: 0 });
  dp[3] = 4; snap("Visit city 1 → mask=0011, cost 4.", 3, { highlight: 1 });
  dp[7] = 9; snap("Add city 2 → mask=0111.", 7, { highlight: 2 });
  dp[15] = 14; snap("All cities visited mask=1111 → optimal tour cost 14. ✓", 15, { highlight: 3 });
  return steps;
}

const CODE = `// dp[mask][i] = min cost to visit mask, ending at city i
for (let mask = 0; mask < (1<<n); mask++)
  for (let u = 0; u < n; u++)
    if (mask & (1<<u))
      for (let v : unvisited) relax(mask|(1<<v), v);`;

export const bitmaskDp: Topic = {
  id: "bitmask-dp",
  title: "Bitmask DP",
  category: "Dynamic Programming",
  blurb: "Encode subsets as integers for exponential DP.",
  prerequisites: ["subsets", "coin-change"],
  badges: ["O(n·2^n)"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "When state is 'which items are chosen', a bitmask (n ≤ 20) indexes DP tables compactly. Classic for TSP, assignment, and subset DP.\n\nEach bit represents include/exclude.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.active, fontWeight: 700 }}>{s.phase}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: C.text }}>mask = {s.mask.toString(2).padStart(N, "0")}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: N }, (_, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 8, background: s.mask & (1 << i) ? (i === s.highlight ? C.active : C.sorted) : C.cellMuted, border: `2px solid ${C.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, color: C.ink }}>{i}</div>
          ))}
        </div>
        <div style={{ fontFamily: FONT_MONO, color: C.textMuted }}>cost = {s.dp[s.mask] ?? "—"}</div>
      </div>
    ),
  }),
};

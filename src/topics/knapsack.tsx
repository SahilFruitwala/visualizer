import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Grid, type CellMark } from "../components/Grid";
import { C, FONT_MONO } from "../theme";

interface Item { w: number; v: number; }
const ITEMS: Item[] = [
  { w: 1, v: 1 },
  { w: 3, v: 4 },
  { w: 4, v: 5 },
  { w: 5, v: 7 },
];
const CAP = 7;

interface Step extends StepBase {
  dp: number[][];
  r: number;
  c: number;
  take: boolean;
  refs: [number, number][];
}

function build() {
  const n = ITEMS.length;
  const dp = Array.from({ length: n + 1 }, () => Array(CAP + 1).fill(0));
  const steps: Step[] = [];
  const snap = (r: number, c: number, take: boolean, refs: [number, number][], caption: string) =>
    steps.push({ dp: dp.map((row) => [...row]), r, c, take, refs, caption });

  snap(-1, -1, false, [], `0/1 Knapsack, capacity ${CAP}. dp[i][w] = best value using first i items within weight w.`);
  for (let i = 1; i <= n; i++) {
    const { w, v } = ITEMS[i - 1];
    for (let cap = 0; cap <= CAP; cap++) {
      if (w > cap) {
        snap(i, cap, false, [[i - 1, cap]], `Item ${i} (w${w}) doesn't fit in ${cap} → copy value above.`);
        dp[i][cap] = dp[i - 1][cap];
      } else {
        const take = v + dp[i - 1][cap - w];
        const skip = dp[i - 1][cap];
        const t = take > skip;
        snap(i, cap, t, [[i - 1, cap], [i - 1, cap - w]], `Item ${i}: max(skip ${skip}, take ${v}+${dp[i - 1][cap - w]}=${take}) = ${Math.max(take, skip)}.`);
        dp[i][cap] = Math.max(take, skip);
      }
    }
  }
  snap(n, CAP, false, [], `Best achievable value = ${dp[n][CAP]}. ✓`);
  return steps;
}

const CODE = `function knapsack(items, cap) {
  const dp = Array.from({length: items.length+1}, () => Array(cap+1).fill(0));
  for (let i = 1; i <= items.length; i++) {
    const {w, v} = items[i-1];
    for (let c = 0; c <= cap; c++)
      dp[i][c] = w > c ? dp[i-1][c]
                       : Math.max(dp[i-1][c], v + dp[i-1][c-w]);
  }
  return dp[items.length][cap];
}`;

export const knapsack: Topic = {
  id: "knapsack",
  title: "0/1 Knapsack",
  category: "Dynamic Programming",
  blurb: "Maximize value under a weight limit.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        `Each item is either taken whole or skipped. dp[i][w] is the best value using the first i items within weight budget w. For each cell we choose the better of skipping the item (value above) or taking it (its value + best of the remaining capacity one row up).\n\nItems (w,v): ${ITEMS.map((it) => `(${it.w},${it.v})`).join(" ")}\nTime: O(n·capacity)`,
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Grid
            rows={ITEMS.length + 1}
            cols={CAP + 1}
            size={44}
            rowLabels={(r) => (r === 0 ? "∅" : `i${r}`)}
            colLabels={(c) => c}
            cell={(r, c) => s.dp[r][c]}
            mark={(r, c): CellMark => {
              if (r === s.r && c === s.c) return s.take ? "result" : "active";
              if (s.refs.some(([rr, cc]) => rr === r && cc === c)) return "compare";
              if (r === 0 || c === 0) return "muted";
              return "filled";
            }}
          />
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>columns = weight capacity 0..{CAP}</div>
        </div>
      ),
    }),
};

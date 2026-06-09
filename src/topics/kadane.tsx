import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  i: number;
  cur: number;
  best: number;
  bestStart: number;
  bestEnd: number;
  start: number;
}

function build(a: number[]) {
  const steps: Step[] = [];
  let cur = a[0], best = a[0], start = 0, bestStart = 0, bestEnd = 0;
  steps.push({ i: 0, cur, best, bestStart, bestEnd, start, caption: `Start: current = best = ${a[0]}.` });
  for (let i = 1; i < a.length; i++) {
    if (cur + a[i] < a[i]) { cur = a[i]; start = i; } else { cur += a[i]; }
    steps.push({ i, cur, best, bestStart, bestEnd, start, caption: `At ${a[i]}: current = ${cur} (extend or restart).` });
    if (cur > best) { best = cur; bestStart = start; bestEnd = i; steps.push({ i, cur, best, bestStart, bestEnd, start, caption: `New best subarray sum = ${best}! ✓` }); }
  }
  steps.push({ i: -1, cur, best, bestStart, bestEnd, start, caption: `Maximum subarray sum = ${best}. ✓` });
  return steps;
}

const CODE = `function maxSubArray(a) {
  let cur = a[0], best = a[0];
  for (let i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i]); // extend or restart
    best = Math.max(best, cur);
  }
  return best;
}`;

export const kadane: Topic = {
  id: "kadane",
  title: "Kadane's Algorithm",
  category: "Dynamic Programming",
  blurb: "Maximum subarray sum in one pass.",
  create: () => {
    const a = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    return defineViz<Step>({
      steps: build(a),
      code: CODE,
      explanation:
        "Kadane's keeps a running 'current' sum, restarting it whenever it would be better to start fresh at the current element. The best running sum ever seen is the answer. The green band marks the best subarray.\n\nTime: O(n) · Space: O(1)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Row gap={8}>
            {a.map((v, i) => {
              const inBest = i >= s.bestStart && i <= s.bestEnd;
              const state = i === s.i ? "active" : inBest ? "sorted" : i >= s.start && s.i >= 0 && i <= s.i ? "compare" : "default";
              return <Cell key={i} value={v} state={state} size={54} sub={i} />;
            })}
          </Row>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: C.textMuted }}>
            current = <span style={{ color: C.active }}>{s.cur}</span> · best = <span style={{ color: C.sorted }}>{s.best}</span>
          </div>
        </div>
      ),
    });
  },
};

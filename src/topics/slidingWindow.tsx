import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  start: number; // window start
  end: number; // window end (inclusive)
  sum: number;
  best: number;
  bestStart: number;
}

function build(arr: number[], k: number) {
  const steps: Step[] = [];
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum, bestStart = 0;
  steps.push({ start: 0, end: k - 1, sum, best, bestStart, caption: `Sum the first window of size ${k}: ${sum}.` });
  for (let end = k; end < arr.length; end++) {
    const start = end - k + 1;
    sum += arr[end] - arr[start - 1];
    steps.push({ start, end, sum, best, bestStart, caption: `Slide: +${arr[end]} −${arr[start - 1]} → window sum ${sum}.` });
    if (sum > best) {
      best = sum;
      bestStart = start;
      steps.push({ start, end, sum, best, bestStart, caption: `New best window sum: ${best}! ✓` });
    }
  }
  steps.push({ start: bestStart, end: bestStart + k - 1, sum: best, best, bestStart, caption: `Max sum of any ${k} consecutive = ${best}. ✓` });
  return steps;
}

const CODE = `function maxWindowSum(a, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;
  for (let end = k; end < a.length; end++) {
    sum += a[end] - a[end - k]; // slide: add new, drop old
    best = Math.max(best, sum);
  }
  return best;
}`;

export const slidingWindow: Topic = {
  id: "sliding-window",
  title: "Sliding Window",
  category: "Techniques",
  blurb: "Reuse overlap instead of recomputing each window.",
  create: () => {
    const arr = [2, 1, 5, 1, 3, 2, 7, 1, 4];
    const k = 3;
    return defineViz<Step>({
      steps: build(arr, k),
      code: CODE,
      explanation:
        "Instead of recomputing each window from scratch (O(n·k)), the sliding window adds the entering element and subtracts the leaving one — O(1) per shift. The amber band is the current window; green marks the best found.\n\nTime: O(n) · Space: O(1)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Row gap={8}>
            {arr.map((v, i) => {
              const inWin = i >= s.start && i <= s.end;
              const inBest = i >= s.bestStart && i <= s.bestStart + (s.end - s.start);
              const state = inWin ? "active" : inBest ? "sorted" : "default";
              return <Cell key={i} value={v} state={state} size={58} sub={i === s.start ? <PointerTag label="win" /> : i} />;
            })}
          </Row>
          <div style={{ fontFamily: "monospace", color: "#8a96c0", fontSize: 16 }}>
            window sum = <span style={{ color: "#f5b94a" }}>{s.sum}</span> · best = <span style={{ color: "#4ade80" }}>{s.best}</span>
          </div>
        </div>
      ),
    });
  },
};

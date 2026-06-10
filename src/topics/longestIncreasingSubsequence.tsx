import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Cell, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  dp: number[];
  i: number;
  j: number;
  refs: number[];
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const dp = Array(n).fill(1);
  const steps: Step[] = [];
  const snap = (i: number, j: number, refs: number[], caption: string, chapter?: string) =>
    steps.push({ arr, dp: [...dp], i, j, refs, caption, chapter });

  snap(-1, -1, [], `Find longest increasing subsequence in [${arr.join(", ")}].`, "Setup");
  snap(0, -1, [], `dp[0] = 1 — single element subsequence.`);

  for (let i = 1; i < n; i++) {
    snap(i, -1, [], `Compute dp[${i}] for arr[${i}]=${arr[i]}.`);
    for (let j = 0; j < i; j++) {
      snap(i, j, [j], `Check arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}? ${arr[j] < arr[i] ? "yes" : "no"}.`);
      if (arr[j] < arr[i]) {
        const candidate = dp[j] + 1;
        if (candidate > dp[i]) {
          snap(i, j, [j], `dp[${j}]+1 = ${candidate} > dp[${i}] → update dp[${i}].`);
          dp[i] = candidate;
        }
      }
    }
    snap(i, -1, [], `dp[${i}] = ${dp[i]}.`);
  }

  const best = Math.max(...dp);
  snap(-1, -1, [], `LIS length = max(dp) = ${best}. ✓`, "Complete");
  return withCodeLines(steps, (s) => {
    if (s.chapter === "Setup") return [0, 1, 2];
    if (s.i === 0 && s.j === -1) return [3];
    if (s.j >= 0 && s.caption.includes("Check")) return [4, 5, 6];
    if (s.caption.includes("update")) return [7, 8];
    if (s.caption.startsWith("dp[") && s.caption.endsWith(".")) return [9];
    if (s.chapter === "Complete") return [10, 11];
    return [4, 5];
  });
}

const CODE = `function lisLength(a) {
  const dp = Array(a.length).fill(1);
  for (let i = 1; i < a.length; i++)
    for (let j = 0; j < i; j++)
      if (a[j] < a[i])
        dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(...dp);
}`;

const INPUT = [10, 9, 2, 5, 3, 7, 101, 18];

export const longestIncreasingSubsequence: Topic = {
  id: "longest-increasing-subsequence",
  title: "Longest Increasing Subsequence",
  category: "Dynamic Programming",
  blurb: "O(n²) DP — dp[i] = LIS ending at index i.",
  badges: ["O(n²)", "O(n) with binary search"],
  prerequisites: ["fibonacci", "binary-search"],
  create: () =>
    defineViz<Step>({
      steps: build(INPUT),
      code: CODE,
      explanation:
        "dp[i] stores the length of the longest increasing subsequence that ends at index i. For each i, look at every j < i: if arr[j] < arr[i], extend the subsequence ending at j by one.\n\nTime: O(n²) · Space: O(n)\n\nPatience sorting + binary search achieves O(n log n) — see the binary search topic.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Row gap={8}>
            {s.arr.map((v, i) => (
              <Cell
                key={i}
                value={v}
                state={
                  i === s.i
                    ? "active"
                    : i === s.j
                      ? "compare"
                      : s.refs.includes(i)
                        ? "compare"
                        : "default"
                }
                size={52}
                sub={`i=${i}`}
              />
            ))}
          </Row>
          <Row gap={8}>
            {s.dp.map((v, i) => (
              <Cell
                key={i}
                value={v}
                state={i === s.i ? "active" : s.refs.includes(i) ? "pointer" : "muted"}
                size={52}
                sub={`dp`}
              />
            ))}
          </Row>
        </div>
      ),
    }),
};

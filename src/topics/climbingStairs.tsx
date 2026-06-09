import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";

interface Step extends StepBase {
  dp: (number | null)[];
  i: number;
  refs: number[];
}

function build(n: number) {
  const dp: (number | null)[] = Array(n + 1).fill(null);
  const steps: Step[] = [];
  const snap = (i: number, refs: number[], caption: string) => steps.push({ dp: [...dp], i, refs, caption });

  snap(-1, [], `Count ways to climb ${n} stairs taking 1 or 2 steps at a time.`);
  dp[0] = 1; snap(0, [], "1 way to stand at the ground (do nothing).");
  if (n >= 1) { dp[1] = 1; snap(1, [], "1 way to reach step 1."); }
  for (let i = 2; i <= n; i++) {
    snap(i, [i - 1, i - 2], `ways(${i}) = ways(${i - 1}) + ways(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]}.`);
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    snap(i, [], `ways(${i}) = ${dp[i]}.`);
  }
  snap(-1, [], `Total ways to climb ${n} stairs = ${dp[n]}. ✓`);
  return steps;
}

const CODE = `function climbStairs(n) {
  const dp = [1, 1];
  for (let i = 2; i <= n; i++)
    dp[i] = dp[i - 1] + dp[i - 2]; // last step was 1 or 2
  return dp[n];
}`;

export const climbingStairs: Topic = {
  id: "climbing-stairs",
  title: "Climbing Stairs",
  category: "Dynamic Programming",
  blurb: "Count paths up n stairs (1 or 2 steps).",
  create: () =>
    defineViz<Step>({
      steps: build(8),
      code: CODE,
      explanation:
        "To reach step i your last move was either +1 (from i−1) or +2 (from i−2), so ways(i) = ways(i−1) + ways(i−2) — the Fibonacci recurrence in disguise.\n\nTime: O(n) · Space: O(1) possible",
      renderStep: (s) => (
        <Row gap={8}>
          {s.dp.map((v, i) => (
            <Cell key={i} value={v ?? "·"} state={i === s.i ? "active" : s.refs.includes(i) ? "compare" : v == null ? "muted" : "sorted"} size={56} sub={`#${i}`} />
          ))}
        </Row>
      ),
    }),
};

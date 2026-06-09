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

  snap(-1, [], "Tabulation: build fib bottom-up so each value is computed once.");
  dp[0] = 0; snap(0, [], "Base case: fib(0) = 0.");
  if (n >= 1) { dp[1] = 1; snap(1, [], "Base case: fib(1) = 1."); }
  for (let i = 2; i <= n; i++) {
    snap(i, [i - 1, i - 2], `fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]}.`);
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    snap(i, [], `fib(${i}) = ${dp[i]}.`);
  }
  snap(-1, [], `fib(${n}) = ${dp[n]}. ✓  (naive recursion would be O(2ⁿ).)`);
  return steps;
}

const CODE = `function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++)
    dp[i] = dp[i - 1] + dp[i - 2]; // reuse subproblems
  return dp[n];
}`;

export const fibonacci: Topic = {
  id: "fibonacci",
  title: "Fibonacci (DP)",
  category: "Dynamic Programming",
  blurb: "Bottom-up tabulation reuses subproblems.",
  create: () =>
    defineViz<Step>({
      steps: build(9),
      code: CODE,
      explanation:
        "Naive recursive Fibonacci recomputes the same calls exponentially. Dynamic programming stores each fib(i) once in a table and reuses it, turning O(2ⁿ) into O(n).\n\nTime: O(n) · Space: O(n) (or O(1) keeping just the last two)",
      renderStep: (s) => (
        <Row gap={8}>
          {s.dp.map((v, i) => (
            <Cell
              key={i}
              value={v ?? "·"}
              state={i === s.i ? "active" : s.refs.includes(i) ? "compare" : v == null ? "muted" : "sorted"}
              size={58}
              sub={`f${i}`}
            />
          ))}
        </Row>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  used: boolean[];
  current: number[];
  pick: number; // index just chosen (-1)
  results: number[][];
  decision: "pick" | "back" | "record" | null;
}

function build(nums: number[]) {
  const steps: Step[] = [];
  const used = Array(nums.length).fill(false);
  const current: number[] = [];
  const results: number[][] = [];
  const snap = (pick: number, decision: Step["decision"], caption: string) =>
    steps.push({ used: [...used], current: [...current], pick, results: results.map((r) => [...r]), decision, caption });

  snap(-1, null, "Build permutations by picking an unused element at each position.");
  const dfs = () => {
    if (current.length === nums.length) {
      results.push([...current]);
      snap(-1, "record", `Full length → record [${current.join(", ")}].`);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      snap(i, "pick", `Pick ${nums[i]} (unused).`);
      dfs();
      used[i] = false;
      current.pop();
      snap(i, "back", `Backtrack: free ${nums[i]} for other positions.`);
    }
  };
  dfs();
  snap(-1, null, `All ${results.length} permutations generated (${nums.length}!). ✓`);
  return steps;
}

const CODE = `function permute(nums) {
  const res = [], cur = [], used = Array(nums.length).fill(false);
  const dfs = () => {
    if (cur.length === nums.length) { res.push([...cur]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(nums[i]);
      dfs();
      used[i] = false; cur.pop();   // backtrack
    }
  };
  dfs();
  return res;
}`;

export const permutations: Topic = {
  id: "permutations",
  title: "Permutations",
  category: "Backtracking",
  blurb: "Arrange all elements in every order.",
  create: () => {
    const nums = [1, 2, 3];
    return defineViz<Step>({
      steps: build(nums),
      code: CODE,
      explanation:
        "At each position we try every element not already used, recurse, then undo the choice (backtrack) to try the next. This enumerates all n! orderings without repeats.\n\nTime: O(n · n!) · Space: O(n) recursion depth",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Row gap={10}>
            {nums.map((v, i) => (
              <Cell key={i} value={v} state={i === s.pick ? (s.decision === "back" ? "compare" : "active") : s.used[i] ? "muted" : "default"} size={56} />
            ))}
          </Row>
          <div style={{ fontFamily: FONT_MONO, color: C.text, fontSize: 16 }}>current = [{s.current.join(", ")}]</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 560, justifyContent: "center" }}>
            {s.results.map((r, i) => (
              <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.sorted, border: `1px solid ${C.surfaceBorder}`, borderRadius: 7, padding: "4px 10px" }}>
                [{r.join(",")}]
              </span>
            ))}
          </div>
        </div>
      ),
    });
  },
};

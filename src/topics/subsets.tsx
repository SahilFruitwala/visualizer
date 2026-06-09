import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  index: number; // element under decision
  current: number[];
  inChoice: boolean[]; // which elements are currently included
  results: number[][];
  decision: "include" | "exclude" | "record" | null;
}

function build(nums: number[]) {
  const steps: Step[] = [];
  const current: number[] = [];
  const inChoice = Array(nums.length).fill(false);
  const results: number[][] = [];
  const snap = (index: number, decision: Step["decision"], caption: string) =>
    steps.push({ index, current: [...current], inChoice: [...inChoice], results: results.map((r) => [...r]), decision, caption });

  snap(-1, null, "Build every subset by choosing include/exclude for each element.");
  const dfs = (i: number) => {
    if (i === nums.length) {
      results.push([...current]);
      snap(i, "record", `Reached the end → record subset {${current.join(", ")}}.`);
      return;
    }
    // include
    inChoice[i] = true;
    current.push(nums[i]);
    snap(i, "include", `Include ${nums[i]}.`);
    dfs(i + 1);
    // exclude
    inChoice[i] = false;
    current.pop();
    snap(i, "exclude", `Backtrack: exclude ${nums[i]}.`);
    dfs(i + 1);
  };
  dfs(0);
  snap(-1, null, `All ${results.length} subsets generated (2^${nums.length}). ✓`);
  return steps;
}

const CODE = `function subsets(nums) {
  const res = [], cur = [];
  const dfs = (i) => {
    if (i === nums.length) { res.push([...cur]); return; }
    cur.push(nums[i]); dfs(i + 1); // include
    cur.pop();         dfs(i + 1); // exclude
  };
  dfs(0);
  return res;
}`;

export const subsets: Topic = {
  id: "subsets",
  title: "Subsets (Power Set)",
  category: "Backtracking",
  blurb: "Include/exclude each element recursively.",
  create: () => {
    const nums = [1, 2, 3];
    return defineViz<Step>({
      steps: build(nums),
      code: CODE,
      explanation:
        "For each element we branch twice: include it or not. Every root-to-leaf path of that binary decision tree is one subset. Backtracking undoes a choice (pop) before exploring the other branch.\n\nTime: O(n · 2ⁿ) · Space: O(n) recursion depth",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Row gap={10}>
            {nums.map((v, i) => (
              <Cell key={i} value={v} state={i === s.index ? (s.decision === "exclude" ? "compare" : "active") : s.inChoice[i] ? "sorted" : "default"} size={56} />
            ))}
          </Row>
          <div style={{ fontFamily: FONT_MONO, color: C.text, fontSize: 16 }}>
            current = {"{"}{s.current.join(", ")}{"}"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 560, justifyContent: "center" }}>
            {s.results.map((r, i) => (
              <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.sorted, border: `1px solid ${C.surfaceBorder}`, borderRadius: 7, padding: "4px 10px" }}>
                {"{"}{r.join(",")}{"}"}
              </span>
            ))}
          </div>
        </div>
      ),
    });
  },
};

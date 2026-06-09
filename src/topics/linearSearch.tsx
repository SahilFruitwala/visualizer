import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  i: number;
  found: boolean;
}

function build(arr: number[], target: number) {
  const steps: Step[] = [];
  steps.push({ i: -1, found: false, caption: `Look for ${target} by scanning left to right.` });
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      steps.push({ i, found: true, caption: `a[${i}] = ${target} → found! ✓` });
      return steps;
    }
    steps.push({ i, found: false, caption: `a[${i}]=${arr[i]} ≠ ${target} → keep going.` });
  }
  steps.push({ i: -1, found: false, caption: `${target} not found.` });
  return steps;
}

const CODE = `function linearSearch(a, target) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] === target) return i;
  }
  return -1;
}`;

export const linearSearch: Topic = {
  id: "linear-search",
  title: "Linear Search",
  category: "Searching",
  blurb: "Check every element until the target appears.",
  create: () => {
    const arr = shuffle([4, 15, 8, 23, 16, 42, 11, 7, 19]);
    const target = arr[Math.floor(Math.random() * arr.length)];
    const steps = build(arr, target);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "The simplest search: examine each element in order until you find the target or run out. Works on any array, sorted or not.\n\nTime: O(n) · Space: O(1)",
      renderStep: (s) => (
        <Row gap={8}>
          {arr.map((v, i) => {
            const state = i === s.i ? (s.found ? "sorted" : "active") : i < s.i ? "muted" : "default";
            return <Cell key={i} value={v} state={state} size={64} sub={i === s.i ? <PointerTag label="i" /> : i} />;
          })}
        </Row>
      ),
    });
  },
};

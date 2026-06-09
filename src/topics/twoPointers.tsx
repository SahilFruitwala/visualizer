import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  lo: number;
  hi: number;
  found: boolean;
}

function build(arr: number[], target: number) {
  const steps: Step[] = [];
  let lo = 0, hi = arr.length - 1;
  steps.push({ lo, hi, found: false, caption: `Find two numbers summing to ${target} in a sorted array.` });
  while (lo < hi) {
    const sum = arr[lo] + arr[hi];
    if (sum === target) {
      steps.push({ lo, hi, found: true, caption: `${arr[lo]} + ${arr[hi]} = ${target} → found! ✓` });
      return steps;
    }
    if (sum < target) {
      steps.push({ lo, hi, found: false, caption: `${arr[lo]} + ${arr[hi]} = ${sum} < ${target} → move left pointer right.` });
      lo++;
    } else {
      steps.push({ lo, hi, found: false, caption: `${arr[lo]} + ${arr[hi]} = ${sum} > ${target} → move right pointer left.` });
      hi--;
    }
  }
  steps.push({ lo, hi, found: false, caption: "No pair found." });
  return steps;
}

const CODE = `function twoSumSorted(a, target) {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    const sum = a[lo] + a[hi];
    if (sum === target) return [lo, hi];
    if (sum < target) lo++;   // need a bigger sum
    else hi--;                // need a smaller sum
  }
  return null;
}`;

export const twoPointers: Topic = {
  id: "two-pointers",
  title: "Two Pointers",
  category: "Techniques",
  blurb: "Converge two indices from both ends.",
  create: () => {
    const arr = [1, 3, 5, 7, 9, 12, 15, 18];
    const i = 1 + Math.floor(Math.random() * 3);
    const j = arr.length - 1 - Math.floor(Math.random() * 3);
    const target = arr[i] + arr[j];
    return defineViz<Step>({
      steps: build(arr, target),
      code: CODE,
      explanation:
        "On a sorted array, two pointers start at both ends. If the sum is too small move the left pointer up; too big, move the right pointer down. Each element is touched once — no nested loop.\n\nTime: O(n) · Space: O(1)",
      renderStep: (s) => (
        <Row gap={8}>
          {arr.map((v, i) => {
            const state = (i === s.lo || i === s.hi) ? (s.found ? "sorted" : "active") : i > s.lo && i < s.hi ? "default" : "muted";
            const tag = i === s.lo && i === s.hi ? "lo·hi" : i === s.lo ? "lo" : i === s.hi ? "hi" : "";
            return <Cell key={i} value={v} state={state} size={62} sub={tag ? <PointerTag label={tag} /> : i} />;
          })}
        </Row>
      ),
    });
  },
};

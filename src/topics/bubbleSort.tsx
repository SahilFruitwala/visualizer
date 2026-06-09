import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  comparing: [number, number] | null;
  swapped: boolean;
  sortedFrom: number;
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  steps.push({ arr: [...arr], comparing: null, swapped: false, sortedFrom: n, caption: "Unsorted array. We repeatedly compare adjacent pairs." });
  for (let pass = 0; pass < n - 1; pass++) {
    for (let k = 0; k < n - 1 - pass; k++) {
      steps.push({ arr: [...arr], comparing: [k, k + 1], swapped: false, sortedFrom: n - pass, caption: `Compare a[${k}]=${arr[k]} and a[${k + 1}]=${arr[k + 1]}.` });
      if (arr[k] > arr[k + 1]) {
        [arr[k], arr[k + 1]] = [arr[k + 1], arr[k]];
        steps.push({ arr: [...arr], comparing: [k, k + 1], swapped: true, sortedFrom: n - pass, caption: `${arr[k + 1]} > ${arr[k]} → swap them.` });
      }
    }
    steps.push({ arr: [...arr], comparing: null, swapped: false, sortedFrom: n - pass - 1, caption: `Largest unsorted value bubbled to position ${n - pass - 1}. ✓` });
  }
  steps.push({ arr: [...arr], comparing: null, swapped: false, sortedFrom: 0, caption: "Array fully sorted. ✓" });
  return steps;
}

const CODE = `function bubbleSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; // swap
      }
    }
  }
  return a;
}`;

export const bubbleSort: Topic = {
  id: "bubble-sort",
  title: "Bubble Sort",
  category: "Sorting",
  blurb: "Repeatedly swap adjacent out-of-order pairs.",
  shufflable: true,
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 4]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Bubble Sort walks the array comparing neighbours and swapping any that are out of order. After each full pass the next-largest element is locked in at the end (shown in green).\n\nTime: O(n²) average & worst · O(n) best (already sorted)\nSpace: O(1) · Stable: yes",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, i) => {
            const state =
              i >= s.sortedFrom
                ? "sorted"
                : s.comparing && (i === s.comparing[0] || i === s.comparing[1])
                  ? s.swapped
                    ? "compare"
                    : "active"
                  : "default";
            return <Bar key={i} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

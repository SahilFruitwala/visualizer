import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  i: number; // boundary of sorted prefix
  j: number; // scanning index
  min: number; // current min index
  sortedTo: number; // indices < sortedTo are finalized
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  steps.push({ arr: [...arr], i: -1, j: -1, min: -1, sortedTo: 0, caption: "Find the smallest element and place it first; repeat." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    steps.push({ arr: [...arr], i, j: i, min, sortedTo: i, caption: `Pass ${i + 1}: assume a[${i}]=${arr[i]} is the minimum.` });
    for (let j = i + 1; j < n; j++) {
      const isNew = arr[j] < arr[min];
      steps.push({ arr: [...arr], i, j, min, sortedTo: i, caption: `Check a[${j}]=${arr[j]}` + (isNew ? ` < a[${min}]=${arr[min]} → new min.` : ` ≥ current min.`) });
      if (isNew) min = j;
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      steps.push({ arr: [...arr], i, j: -1, min: i, sortedTo: i, caption: `Swap minimum into position ${i}.` });
    }
    steps.push({ arr: [...arr], i: -1, j: -1, min: -1, sortedTo: i + 1, caption: `Position ${i} finalized. ✓` });
  }
  steps.push({ arr: [...arr], i: -1, j: -1, min: -1, sortedTo: n, caption: "Array fully sorted. ✓" });
  return steps;
}

const CODE = `function selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}`;

export const selectionSort: Topic = {
  id: "selection-sort",
  title: "Selection Sort",
  category: "Sorting",
  blurb: "Select the minimum each pass and place it.",
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 4]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Selection Sort scans the unsorted region for the minimum (tracked in amber) and swaps it to the front. The green prefix grows by one each pass.\n\nTime: O(n²) in all cases · Space: O(1) · Stable: no",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, i) => {
            const state =
              i < s.sortedTo
                ? "sorted"
                : i === s.min
                  ? "active"
                  : i === s.j
                    ? "compare"
                    : "default";
            return <Bar key={i} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

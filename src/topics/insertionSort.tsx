import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  key: number; // index where the key will land
  keyVal: number; // value being inserted (-1 if none)
  compare: number; // index being compared against
  sortedTo: number; // a[0..sortedTo) is sorted-so-far
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  steps.push({ arr: [...arr], key: -1, keyVal: -1, compare: -1, sortedTo: 1, caption: "Grow a sorted prefix by inserting each next element into place." });
  for (let i = 1; i < n; i++) {
    const val = arr[i];
    steps.push({ arr: [...arr], key: i, keyVal: val, compare: -1, sortedTo: i, caption: `Take a[${i}]=${val} and insert it into the sorted prefix.` });
    let j = i - 1;
    while (j >= 0 && arr[j] > val) {
      steps.push({ arr: [...arr], key: j + 1, keyVal: val, compare: j, sortedTo: i, caption: `a[${j}]=${arr[j]} > ${val} → shift it right.` });
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = val;
    steps.push({ arr: [...arr], key: j + 1, keyVal: val, compare: -1, sortedTo: i + 1, caption: `Place ${val} at index ${j + 1}. ✓` });
  }
  steps.push({ arr: [...arr], key: -1, keyVal: -1, compare: -1, sortedTo: n, caption: "Array fully sorted. ✓" });
  return steps;
}

const CODE = `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; // shift right
      j--;
    }
    a[j + 1] = key; // drop into the gap
  }
  return a;
}`;

export const insertionSort: Topic = {
  id: "insertion-sort",
  title: "Insertion Sort",
  category: "Sorting",
  blurb: "Insert each element into a growing sorted prefix.",
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 4]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Insertion Sort keeps a sorted prefix (green). It lifts the next element (amber) and shifts larger neighbours right until the element drops into its slot. Great on nearly-sorted data.\n\nTime: O(n²) worst · O(n) best · Space: O(1) · Stable: yes",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, i) => {
            const state =
              i === s.key
                ? "active"
                : i === s.compare
                  ? "compare"
                  : i < s.sortedTo
                    ? "sorted"
                    : "default";
            const value = i === s.key && s.keyVal >= 0 ? s.keyVal : v;
            return <Bar key={i} value={value} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  a: number;
  b: number;
  sortedFrom: number;
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  const snap = (a: number, b: number, sortedFrom: number, caption: string) =>
    steps.push({ arr: [...arr], a, b, sortedFrom, caption });

  snap(-1, -1, n, "Heap Sort: build a max-heap, then repeatedly extract the max.");

  const siftDown = (i: number, size: number) => {
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let big = i;
      if (l < size && arr[l] > arr[big]) big = l;
      if (r < size && arr[r] > arr[big]) big = r;
      if (big === i) break;
      snap(i, big, n, `Sift down: swap ${arr[i]} ↔ ${arr[big]}.`);
      [arr[i], arr[big]] = [arr[big], arr[i]];
      i = big;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    snap(i, -1, n, `Heapify subtree rooted at index ${i}.`);
    siftDown(i, n);
  }
  snap(-1, -1, n, "Max-heap built — largest value is at the root.");
  for (let end = n - 1; end > 0; end--) {
    snap(0, end, end + 1, `Move max ${arr[0]} to the sorted region.`);
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(0, end);
  }
  snap(-1, -1, 0, "Array fully sorted. ✓");
  return steps;
}

const CODE = `function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]]; // max to the back
    siftDown(a, 0, end);
  }
}`;

export const heapSort: Topic = {
  id: "heap-sort",
  title: "Heap Sort",
  category: "Sorting",
  blurb: "Build a max-heap, then extract the max repeatedly.",
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 6]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Heap Sort first arranges the array into a max-heap, so the largest element sits at the root. It then swaps the root to the end (growing a green sorted suffix) and sifts down to restore the heap.\n\nTime: O(n log n) all cases · Space: O(1) · Stable: no",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, i) => {
            const state = i >= s.sortedFrom ? "sorted" : i === s.a || i === s.b ? "active" : "default";
            return <Bar key={i} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

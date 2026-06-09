import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  pivot: number;
  i: number; // boundary of "smaller" region
  j: number; // scanner
  lo: number;
  hi: number;
  done: Set<number>;
}

function build(input: number[]) {
  const arr = [...input];
  const steps: Step[] = [];
  const done = new Set<number>();
  const snap = (extra: Partial<Step> & { caption: string }) =>
    steps.push({ arr: [...arr], pivot: -1, i: -1, j: -1, lo: -1, hi: -1, done: new Set(done), ...extra });

  snap({ caption: "Quick Sort: pick a pivot, partition smaller/larger, recurse." });

  const qs = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      done.add(lo);
      return;
    }
    const pivot = arr[hi];
    snap({ lo, hi, pivot: hi, caption: `Partition [${lo}..${hi}] around pivot ${pivot}.` });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      snap({ lo, hi, pivot: hi, i, j, caption: `Is a[${j}]=${arr[j]} < pivot ${pivot}?` });
      if (arr[j] < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        snap({ lo, hi, pivot: hi, i, j, caption: `Yes → swap into smaller region (index ${i}).` });
        i++;
      }
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    done.add(i);
    snap({ lo, hi, pivot: i, i, caption: `Place pivot at its final index ${i}. ✓` });
    qs(lo, i - 1);
    qs(i + 1, hi);
  };
  qs(0, arr.length - 1);
  for (let k = 0; k < arr.length; k++) done.add(k);
  snap({ caption: "Array fully sorted. ✓" });
  return steps;
}

const CODE = `function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  }
  [a[i], a[hi]] = [a[hi], a[i]]; // pivot to final spot
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
}`;

export const quickSort: Topic = {
  id: "quick-sort",
  title: "Quick Sort",
  category: "Sorting",
  blurb: "Partition around a pivot, then recurse.",
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 6]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Quick Sort chooses a pivot (purple) and partitions the range so smaller values go left, larger go right. The pivot lands at its final index (green), then each side is sorted recursively.\n\nTime: O(n log n) average · O(n²) worst · Space: O(log n) · Stable: no",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, idx) => {
            let state: "default" | "active" | "compare" | "sorted" | "highlight" | "muted" = "default";
            if (s.done.has(idx)) state = "sorted";
            else if (idx === s.pivot) state = "highlight";
            else if (idx === s.j) state = "active";
            else if (idx === s.i) state = "compare";
            else if (s.lo >= 0 && (idx < s.lo || idx > s.hi)) state = "muted";
            return <Bar key={idx} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

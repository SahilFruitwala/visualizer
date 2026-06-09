import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  lo: number;
  hi: number;
  a: number; // left run pointer
  b: number; // right run pointer
  write: number; // index just written
  merged: Set<number>;
}

function build(input: number[]) {
  const arr = [...input];
  const steps: Step[] = [];
  const merged = new Set<number>();
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ arr: [...arr], lo: -1, hi: -1, a: -1, b: -1, write: -1, merged: new Set(merged), ...e });

  snap({ caption: "Merge Sort: split in half, sort each, then merge the two sorted runs." });

  const ms = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    snap({ lo, hi, caption: `Split [${lo}..${hi}] at ${mid}.` });
    ms(lo, mid);
    ms(mid + 1, hi);
    // merge
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      snap({ lo, hi, a: lo + i, b: mid + 1 + j, caption: `Merge: compare ${left[i]} and ${right[j]}.` });
      if (left[i] <= right[j]) arr[k] = left[i++];
      else arr[k] = right[j++];
      snap({ lo, hi, write: k, caption: `Write ${arr[k]} into index ${k}.` });
      k++;
    }
    while (i < left.length) { arr[k] = left[i++]; snap({ lo, hi, write: k, caption: `Copy remaining ${arr[k]}.` }); k++; }
    while (j < right.length) { arr[k] = right[j++]; snap({ lo, hi, write: k, caption: `Copy remaining ${arr[k]}.` }); k++; }
    for (let x = lo; x <= hi; x++) merged.add(x);
    snap({ lo, hi, caption: `Run [${lo}..${hi}] is now sorted. ✓` });
  };
  ms(0, arr.length - 1);
  snap({ caption: "Array fully sorted. ✓" });
  return steps;
}

const CODE = `function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const L = mergeSort(a.slice(0, mid));
  const R = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length)
    out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  return [...out, ...L.slice(i), ...R.slice(j)];
}`;

export const mergeSort: Topic = {
  id: "merge-sort",
  title: "Merge Sort",
  category: "Sorting",
  blurb: "Divide in half, sort each, merge the runs.",
  create: () => {
    const input = shuffle([5, 2, 8, 1, 9, 3, 7, 6]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Merge Sort recursively halves the array, then merges sorted runs back together by repeatedly taking the smaller front element. The active window is highlighted; the green index is where we just wrote.\n\nTime: O(n log n) in all cases · Space: O(n) · Stable: yes",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, idx) => {
            let state: "default" | "active" | "compare" | "sorted" | "muted" = "default";
            if (idx === s.write) state = "sorted";
            else if (idx === s.a || idx === s.b) state = "active";
            else if (s.merged.has(idx)) state = "compare";
            else if (s.lo >= 0 && (idx < s.lo || idx > s.hi)) state = "muted";
            return <Bar key={idx} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

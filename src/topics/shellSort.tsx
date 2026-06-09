import { defineViz, type StepBase, type Topic } from "../engine/types";
import { shuffle } from "../engine/util";
import { Bar, Row } from "../components/primitives";

interface Step extends StepBase {
  arr: number[];
  gap: number;
  i: number;
  j: number;
}

function build(input: number[]) {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  const snap = (gap: number, i: number, j: number, caption: string) =>
    steps.push({ arr: [...arr], gap, i, j, caption });

  snap(0, -1, -1, "Shell Sort = insertion sort, but comparing elements a 'gap' apart.");
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    snap(gap, -1, -1, `New gap = ${gap}. Sort each gap-separated subsequence.`);
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      snap(gap, i, j - gap, `Take a[${i}]=${temp}; compare with a[${j - gap}] (gap ${gap}).`);
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        snap(gap, i, j - gap, `${arr[j]} > ${temp} → shift right by ${gap}.`);
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  snap(0, -1, -1, "Array fully sorted. ✓");
  return steps;
}

const CODE = `function shellSort(a) {
  const n = a.length;
  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > temp) { a[j] = a[j - gap]; j -= gap; }
      a[j] = temp;
    }
  }
}`;

export const shellSort: Topic = {
  id: "shell-sort",
  title: "Shell Sort",
  category: "Sorting",
  blurb: "Gapped insertion sort with shrinking gaps.",
  create: () => {
    const input = shuffle([8, 3, 1, 9, 2, 7, 5, 4, 6]);
    const steps = build(input);
    const max = Math.max(...input);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Shell Sort improves insertion sort by first comparing elements far apart (the gap), which moves out-of-place values a long way quickly. The gap shrinks to 1, finishing as a normal — but nearly-sorted — insertion sort.\n\nTime: ~O(n^1.3) typical · Space: O(1) · Stable: no",
      renderStep: (s) => (
        <Row gap={10}>
          {s.arr.map((v, idx) => {
            const state = idx === s.i ? "active" : idx === s.j ? "compare" : "default";
            return <Bar key={idx} value={v} max={max} state={state} />;
          })}
        </Row>
      ),
    });
  },
};

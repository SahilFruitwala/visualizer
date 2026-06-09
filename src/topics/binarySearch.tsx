import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  lo: number;
  hi: number;
  mid: number;
  found: boolean;
}

function build(arr: number[], target: number) {
  const steps: Step[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  steps.push({
    lo, hi, mid: -1, found: false,
    chapter: "Setup",
    caption: `Search a sorted array for ${target}. Range = whole array.`,
    insight: "Binary search only works on sorted input.",
  });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, found: true, caption: `a[${mid}] = ${target} → found at index ${mid}! ✓` });
      return steps;
    }
    if (arr[mid] < target) {
      steps.push({ lo, hi, mid, found: false, caption: `a[${mid}]=${arr[mid]} < ${target} → discard left half.` });
      lo = mid + 1;
    } else {
      steps.push({ lo, hi, mid, found: false, caption: `a[${mid}]=${arr[mid]} > ${target} → discard right half.` });
      hi = mid - 1;
    }
  }
  steps.push({ lo, hi, mid: -1, found: false, chapter: "Not found", caption: `${target} not present.` });
  return withCodeLines(steps, (s) => {
    if (s.caption.startsWith("Search")) return [0, 1];
    if (s.found) return [2, 3, 4];
    if (s.caption.includes("discard left")) return [2, 3, 5, 6];
    if (s.caption.includes("discard right")) return [2, 3, 5, 7];
    if (s.caption.includes("not present")) return [8];
    return [2, 3];
  });
}

const CODE = `function binarySearch(a, target) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1; // go right
    else hi = mid - 1;                 // go left
  }
  return -1;
}`;

export const binarySearch: Topic = {
  id: "binary-search",
  title: "Binary Search",
  category: "Searching",
  blurb: "Halve a sorted range until the target is found.",
  useWhen: "The data is sorted and you need O(log n) lookup.",
  badges: ["O(log n)", "requires sorted input"],
  prerequisites: ["linear-search"],
  quiz: [
    {
      question: "After comparing mid, what happens if a[mid] < target?",
      options: ["Discard right half", "Discard left half", "Stop", "Shuffle array"],
      correctIndex: 1,
      explanation: "Smaller mid means the target must be to the right — lo becomes mid + 1.",
    },
  ],
  shufflable: true,
  create: () => {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = arr[2 + Math.floor(Math.random() * (arr.length - 3))];
    const steps = build(arr, target);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Binary Search exploits sorted order: check the middle, then throw away the half that can't contain the target. Each step halves the search space.\n\nRequires sorted input · Time: O(log n) · Space: O(1)",
      renderStep: (s) => (
        <Row gap={8}>
          {arr.map((v, i) => {
            const inRange = i >= s.lo && i <= s.hi;
            const state = i === s.mid ? (s.found ? "sorted" : "active") : inRange ? "default" : "muted";
            const tags: string[] = [];
            if (i === s.lo) tags.push("lo");
            if (i === s.hi) tags.push("hi");
            if (i === s.mid) tags.push("mid");
            return (
              <Cell
                key={i}
                value={v}
                state={state}
                size={64}
                sub={tags.length ? <PointerTag label={tags.join("·")} /> : i}
              />
            );
          })}
        </Row>
      ),
    });
  },
};

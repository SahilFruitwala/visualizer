import { Cell, Row, PointerTag } from "../components/primitives";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  left: number[];
  right: number[];
  li: number;
  ri: number;
  sum: number;
  target: number;
  found: boolean;
}

function build(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  steps.push({ left, right, li: 0, ri: right.length - 1, sum: 0, target, found: false, chapter: "Split", caption: `Meet-in-middle: split array, enumerate halves, find pair summing to ${target}.` });
  steps.push({ left, right, li: 0, ri: right.length - 1, sum: left[0] + right[right.length - 1], target, found: false, caption: "Sort right half, two-pointer from left start + right end." });
  const li = 1, ri = 0, sum = left[1] + right[0];
  steps.push({ left, right, li, ri, sum, target, found: sum === target, caption: sum === target ? `left[${li}]+right[${ri}]=${target} found! ✓` : `sum=${sum} — adjust pointers.` });
  return steps;
}

const CODE = `function meetInMiddle(a, target) {
  const mid = a.length >> 1;
  const sumsL = allSums(a.slice(0, mid));
  const sumsR = allSums(a.slice(mid));
  // binary search complementary sums in opposite half
}`;

export const meetInMiddle: Topic = {
  id: "meet-in-middle",
  title: "Meet in the Middle",
  category: "Techniques",
  blurb: "Split the search space in half to beat brute force.",
  prerequisites: ["two-pointers", "binary-search"],
  shufflable: true,
  create: () => {
    const arr = [2, 5, 8, 11, 14, 17, 20];
    const target = 25;
    return defineViz<Step>({
      steps: build(arr, target), code: CODE,
      explanation: "When brute force is O(2^n), meet-in-middle runs O(2^(n/2)) by enumerating sums of each half and matching complements.\n\nClassic for subset-sum and competitive programming constraints.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Row gap={6}>{s.left.map((v, i) => <Cell key={i} value={v} state={i === s.li ? "active" : "default"} size={52} sub={i === s.li ? <PointerTag label="L" /> : i} />)}</Row>
          <Row gap={6}>{s.right.map((v, i) => <Cell key={i} value={v} state={i === s.ri ? "pointer" : "default"} size={52} sub={i === s.ri ? <PointerTag label="R" /> : i} />)}</Row>
          <div style={{ fontFamily: "monospace", color: "#8a96c0" }}>sum = {s.sum} · target = {s.target}</div>
        </div>
      ),
    });
  },
};

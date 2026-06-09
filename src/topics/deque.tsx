import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  dq: number[];
  touch: "front" | "back" | null;
  removed: boolean;
}

type Op = { op: "pushFront" | "pushBack" | "popFront" | "popBack"; v?: number };
const OPS: Op[] = [
  { op: "pushBack", v: 1 },
  { op: "pushBack", v: 2 },
  { op: "pushFront", v: 0 },
  { op: "pushBack", v: 3 },
  { op: "popFront" },
  { op: "popBack" },
  { op: "pushFront", v: 9 },
];

function build() {
  const dq: number[] = [];
  const steps: Step[] = [{ dq: [], touch: null, removed: false, caption: "A deque allows adding/removing at BOTH ends." }];
  for (const o of OPS) {
    if (o.op === "pushBack") { dq.push(o.v!); steps.push({ dq: [...dq], touch: "back", removed: false, caption: `pushBack(${o.v}) → append to the right.` }); }
    else if (o.op === "pushFront") { dq.unshift(o.v!); steps.push({ dq: [...dq], touch: "front", removed: false, caption: `pushFront(${o.v}) → prepend to the left.` }); }
    else if (o.op === "popFront") { const v = dq.shift(); steps.push({ dq: [...dq], touch: "front", removed: true, caption: `popFront() → remove ${v} from the left.` }); }
    else { const v = dq.pop(); steps.push({ dq: [...dq], touch: "back", removed: true, caption: `popBack() → remove ${v} from the right.` }); }
  }
  steps.push({ dq: [...dq], touch: null, removed: false, caption: "Both ends support O(1) insert and remove." });
  return steps;
}

const CODE = `class Deque {            // double-ended queue
  items = [];
  pushFront(x) { this.items.unshift(x); }
  pushBack(x)  { this.items.push(x); }
  popFront()   { return this.items.shift(); }
  popBack()    { return this.items.pop(); }
}`;

export const deque: Topic = {
  id: "deque",
  title: "Deque",
  category: "Linear",
  blurb: "Double-ended queue: add/remove at either end.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A deque (double-ended queue) generalizes stacks and queues: you can push and pop at both the front and the back in O(1). It backs sliding-window-maximum and many BFS variants.\n\npushFront / pushBack / popFront / popBack: O(1)",
      renderStep: (s) =>
        s.dq.length === 0 ? (
          <div style={{ color: "#8a96c0", fontFamily: "monospace" }}>empty deque</div>
        ) : (
          <Row gap={10}>
            {s.dq.map((v, i) => {
              const isFront = i === 0, isBack = i === s.dq.length - 1;
              const state = (isFront && s.touch === "front") || (isBack && s.touch === "back") ? "active" : "default";
              const tag = isFront && isBack ? "front·back" : isFront ? "front" : isBack ? "back" : "";
              return <Cell key={i} value={v} state={state} size={66} sub={tag ? <PointerTag label={tag} /> : ""} />;
            })}
          </Row>
        ),
    }),
};

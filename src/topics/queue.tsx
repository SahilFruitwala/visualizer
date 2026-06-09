import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row, PointerTag } from "../components/primitives";

interface Step extends StepBase {
  queue: number[];
  highlight: "enqueue" | "dequeue" | null;
}

const OPS: { kind: "enqueue" | "dequeue"; value?: number }[] = [
  { kind: "enqueue", value: 4 },
  { kind: "enqueue", value: 8 },
  { kind: "enqueue", value: 2 },
  { kind: "dequeue" },
  { kind: "enqueue", value: 6 },
  { kind: "dequeue" },
  { kind: "dequeue" },
];

function build() {
  const q: number[] = [];
  const steps: Step[] = [{ queue: [], highlight: null, caption: "A queue is FIFO — add at the back, remove from the front." }];
  for (const op of OPS) {
    if (op.kind === "enqueue") {
      q.push(op.value!);
      steps.push({ queue: [...q], highlight: "enqueue", caption: `enqueue(${op.value}) → joins the back.` });
    } else {
      const v = q.shift();
      steps.push({ queue: [...q], highlight: "dequeue", caption: `dequeue() → removes & returns ${v} from the front.` });
    }
  }
  steps.push({ queue: [...q], highlight: null, caption: "Done. First in was first out." });
  return steps;
}

const CODE = `class Queue {
  items = [];
  enqueue(x) { this.items.push(x); }      // add at back, O(1)
  dequeue()  { return this.items.shift(); } // remove front
  front()    { return this.items[0]; }
  get size() { return this.items.length; }
}`;

export const queue: Topic = {
  id: "queue",
  title: "Queue (FIFO)",
  category: "Data Structures",
  blurb: "First-in, first-out. Enqueue back, dequeue front.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A queue adds at the back (enqueue) and removes from the front (dequeue), so items leave in arrival order. Used for BFS, scheduling, and buffering.\n\nenqueue / dequeue: O(1) (with a proper ring buffer or linked list)",
      renderStep: (s) =>
        s.queue.length === 0 ? (
          <div style={{ color: "#8a96c0", fontFamily: "monospace" }}>empty queue</div>
        ) : (
          <Row gap={10}>
            {s.queue.map((v, i) => {
              const isFront = i === 0;
              const isBack = i === s.queue.length - 1;
              const state = isFront && s.highlight === "dequeue" ? "compare" : isBack && s.highlight === "enqueue" ? "sorted" : "default";
              const tag = isFront && isBack ? "front·back" : isFront ? "front" : isBack ? "back" : "";
              return <Cell key={i} value={v} state={state} size={70} sub={tag ? <PointerTag label={tag} /> : ""} />;
            })}
          </Row>
        ),
    }),
};

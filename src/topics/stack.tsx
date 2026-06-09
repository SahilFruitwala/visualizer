import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  stack: number[];
  highlight: "top" | "push" | "pop" | null;
}

const OPS: { kind: "push" | "pop"; value?: number }[] = [
  { kind: "push", value: 3 },
  { kind: "push", value: 7 },
  { kind: "push", value: 1 },
  { kind: "pop" },
  { kind: "push", value: 9 },
  { kind: "pop" },
  { kind: "pop" },
];

function build() {
  const s: number[] = [];
  const steps: Step[] = [{
    stack: [], highlight: null, chapter: "Introduction",
    caption: "A stack is LIFO — push/pop happen at the top only.",
    insight: "Think: undo history, call stack, DFS.",
  }];
  for (const op of OPS) {
    if (op.kind === "push") {
      s.push(op.value!);
      steps.push({ stack: [...s], highlight: "push", caption: `push(${op.value}) → goes on top.` });
    } else {
      const v = s.pop();
      steps.push({ stack: [...s], highlight: "pop", caption: `pop() → removes & returns ${v} from the top.` });
    }
  }
  steps.push({ stack: [...s], highlight: null, chapter: "Summary", caption: "Done. Only the top was ever touched." });
  return withCodeLines(steps, (s) => {
    if (s.highlight === "push") return [1, 2];
    if (s.highlight === "pop") return [3, 4];
    return [0];
  });
}

const CODE = `class Stack {
  items = [];
  push(x) { this.items.push(x); }   // O(1)
  pop()   { return this.items.pop(); } // O(1)
  peek()  { return this.items.at(-1); }
  get size() { return this.items.length; }
}`;

export const stack: Topic = {
  id: "stack",
  title: "Stack (LIFO)",
  category: "Data Structures",
  blurb: "Last-in, first-out. Push/pop at one end.",
  useWhen: "You need undo, parsing, or depth-first traversal.",
  badges: ["O(1) push/pop"],
  quiz: [
    {
      question: "Which element is removed by pop()?",
      options: ["Bottom", "Top", "Random", "Middle"],
      correctIndex: 1,
      explanation: "Stack is LIFO — last pushed is first popped.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A stack only lets you add (push) or remove (pop) at the top, so the last item in is the first out. Used for undo, call stacks, DFS, and expression parsing.\n\npush / pop / peek: O(1) each",
      renderStep: (s) => (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 50 }}>
          <div
            style={{
              width: 150,
              minHeight: 300,
              padding: 10,
              display: "flex",
              flexDirection: "column-reverse",
              gap: 8,
              borderLeft: `3px solid ${C.surfaceBorder}`,
              borderRight: `3px solid ${C.surfaceBorder}`,
              borderBottom: `3px solid ${C.surfaceBorder}`,
              borderRadius: "0 0 12px 12px",
            }}
          >
            {s.stack.map((v, i) => {
              const isTop = i === s.stack.length - 1;
              const bg = isTop && s.highlight === "push" ? C.sorted : isTop ? C.active : C.default;
              return (
                <div
                  key={i}
                  style={{
                    height: 56,
                    borderRadius: 10,
                    background: bg,
                    border: `2px solid ${C.surfaceBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 22,
                    color: isTop ? C.ink : C.text,
                    transition: "background 200ms",
                  }}
                >
                  {v}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: FONT_MONO, color: C.textMuted, alignSelf: "center" }}>
            <div style={{ color: C.active }}>← top</div>
            <div style={{ marginTop: 8 }}>size = {s.stack.length}</div>
          </div>
        </div>
      ),
    }),
};

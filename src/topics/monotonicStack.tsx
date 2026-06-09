import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Cell, Row, PointerTag } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  arr: number[];
  stack: number[];
  curr: number;
  result: (number | null)[];
  popping: number[];
}

const ARR = [4, 5, 2, 10, 8];

function build(arr: number[]) {
  const steps: Step[] = [];
  const stack: number[] = [];
  const result: (number | null)[] = Array(arr.length).fill(null);

  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curr: -1,
      result: [...result],
      popping: [],
      ...e,
    });

  snap({
    chapter: "Setup",
    caption: "Next Greater Element — stack keeps indices in decreasing value order.",
    insight: "When a larger value arrives, pop smaller indices and record the answer.",
  });

  for (let i = 0; i < arr.length; i++) {
    snap({ curr: i, caption: `i = ${i}, arr[${i}] = ${arr[i]}. Compare with stack top.` });
    const toPop: number[] = [];
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const idx = stack.pop()!;
      toPop.push(idx);
      result[idx] = arr[i];
      snap({
        curr: i,
        popping: [...toPop],
        caption: `arr[${idx}] = ${arr[idx]} < ${arr[i]} → pop index ${idx}, next greater = ${arr[i]}.`,
      });
    }
    stack.push(i);
    snap({ curr: i, caption: `Push index ${i} onto stack.` });
  }

  snap({
    chapter: "Summary",
    caption: `Done. Remaining indices have no greater element to their right.`,
  });
  return withCodeLines(steps, (s) => {
    if (s.caption.startsWith("Next Greater")) return [0, 1, 2];
    if (s.caption.startsWith("i =")) return [3, 4, 5];
    if (s.caption.includes("pop index")) return [4, 5, 6, 7, 8];
    if (s.caption.startsWith("Push index")) return [9, 10];
    return [0];
  });
}

const CODE = `function nextGreater(a) {
  const res = Array(a.length).fill(-1);
  const stack = []; // indices, decreasing values
  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack.at(-1)] < a[i]) {
      const idx = stack.pop();
      res[idx] = a[i];       // found next greater
    }
    stack.push(i);
  }
  return res;
}`;

export const monotonicStack: Topic = {
  id: "monotonic-stack",
  title: "Monotonic Stack",
  category: "Techniques",
  blurb: "Stack of indices in sorted order — pop when the pattern breaks.",
  useWhen: "You need the next greater/smaller element or span distances.",
  badges: ["O(n)"],
  prerequisites: ["stack"],
  quiz: [
    {
      question: "Why do we store indices instead of values on the stack?",
      options: [
        "Indices are smaller",
        "We need positions to write results",
        "Values can't be compared",
        "It's arbitrary",
      ],
      correctIndex: 1,
      explanation: "Results are indexed by position — we need the original index to fill res[idx].",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(ARR),
      code: CODE,
      explanation:
        "A monotonic stack maintains elements (or indices) in increasing or decreasing order. When the current element violates that order, pop until it's restored — each pop reveals the 'next greater' answer. Every index is pushed and popped at most once.\n\nTime: O(n) · Space: O(n)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <Row gap={8}>
            {s.arr.map((v, i) => {
              const isCurr = i === s.curr;
              const isPopping = s.popping.includes(i);
              const hasResult = s.result[i] != null;
              const state = isPopping ? "compare" : isCurr ? "active" : hasResult ? "sorted" : "default";
              return (
                <Cell
                  key={i}
                  value={v}
                  state={state}
                  size={62}
                  sub={
                    isCurr ? (
                      <PointerTag label="i" />
                    ) : hasResult ? (
                      <span style={{ color: C.sorted, fontSize: 12 }}>→{s.result[i]}</span>
                    ) : (
                      i
                    )
                  }
                />
              );
            })}
          </Row>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <span style={{ fontFamily: FONT_MONO, color: C.pointer, fontWeight: 700, marginBottom: 8 }}>stack</span>
            <div
              style={{
                minWidth: 120,
                minHeight: 80,
                padding: 10,
                display: "flex",
                flexDirection: "column-reverse",
                gap: 6,
                borderLeft: `3px solid ${C.surfaceBorder}`,
                borderRight: `3px solid ${C.surfaceBorder}`,
                borderBottom: `3px solid ${C.surfaceBorder}`,
                borderRadius: "0 0 10px 10px",
              }}
            >
              {s.stack.length === 0 ? (
                <span style={{ fontFamily: FONT_MONO, color: C.textMuted, fontSize: 14, textAlign: "center" }}>∅</span>
              ) : (
                s.stack.map((idx, j) => {
                  const isTop = j === s.stack.length - 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: isTop ? C.active : C.default,
                        border: `2px solid ${C.surfaceBorder}`,
                        fontFamily: FONT_MONO,
                        fontWeight: 700,
                        fontSize: 16,
                        color: isTop ? C.ink : C.text,
                        textAlign: "center",
                        transition: "background 200ms",
                      }}
                    >
                      [{idx}]={s.arr[idx]}
                    </div>
                  );
                })
              )}
            </div>
            <span style={{ fontFamily: FONT_MONO, color: C.active, fontSize: 13, marginBottom: 8 }}>← top</span>
          </div>
        </div>
      ),
    }),
};

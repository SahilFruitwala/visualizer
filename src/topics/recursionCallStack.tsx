import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

interface Frame {
  fn: string;
  n: number;
  waiting?: string;
}

interface Step extends StepBase {
  frames: Frame[];
  result?: number;
  phase: "call" | "base" | "return" | "done";
}

function buildFib(n: number): { steps: Step[]; result: number } {
  const steps: Step[] = [];
  let result = 0;

  function walk(k: number, depth: number): number {
    const frames: Frame[] = [];
    for (let d = depth; d >= 0; d--) {
      const val = k - (depth - d);
      frames.push({
        fn: `fib(${val})`,
        n: val,
        waiting: d < depth ? `fib(${val - 1}) + fib(${val - 2})` : undefined,
      });
    }

    steps.push({
      frames: [...frames],
      phase: "call",
      caption: `Call fib(${k}) — pushed onto the call stack.`,
    });

    if (k <= 1) {
      steps.push({
        frames: [...frames],
        phase: "base",
        caption: `Base case fib(${k}) = ${k}.`,
      });
      steps.push({
        frames: frames.slice(0, -1),
        phase: "return",
        result: k,
        caption: `Return ${k} — pop fib(${k}) from stack.`,
      });
      return k;
    }

    const a = walk(k - 1, depth + 1);
    const b = walk(k - 2, depth + 1);
    const sum = a + b;

    steps.push({
      frames: frames.slice(0, -1),
      phase: "return",
      result: sum,
      caption: `fib(${k}) = ${a} + ${b} = ${sum} — pop and return.`,
    });
    return sum;
  }

  result = walk(n, 0);
  steps.push({
    frames: [],
    phase: "done",
    result,
    chapter: "Complete",
    caption: `Stack empty. fib(${n}) = ${result}. ✓`,
  });

  return { steps, result };
}

const CODE = `function fib(n) {
  if (n <= 1) return n;        // base case
  return fib(n - 1) + fib(n - 2); // recursive calls
}
// Each call adds a frame; returns pop frames off the stack.`;

export const recursionCallStack: Topic = {
  id: "recursion-call-stack",
  title: "Recursion & Call Stack",
  category: "Techniques",
  blurb: "How recursive calls push and pop stack frames.",
  create: () => {
    const { steps } = buildFib(4);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "Each function call creates a stack frame with local variables and the return address. Recursive calls push frames until a base case is reached, then returns pop frames and unwind results. Deep recursion can overflow the stack — tail-call optimization or iteration avoids this.\n\nfib(n) time: O(2ⁿ) naive · Space: O(n) stack depth",
      renderStep: (s) => (
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 8, minWidth: 200 }}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: C.textMuted,
                textAlign: "center",
                padding: "4px 0",
                borderTop: `3px solid ${C.surfaceBorder}`,
              }}
            >
              call stack
            </div>
            {s.frames.length === 0 ? (
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted, textAlign: "center", padding: 20 }}>
                (empty)
              </div>
            ) : (
              s.frames.map((f, i) => {
                const isTop = i === s.frames.length - 1;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: isTop ? C.active : C.default,
                      border: `2px solid ${isTop ? C.activeBorder : C.surfaceBorder}`,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{f.fn}</div>
                    {f.waiting && (
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>waiting: {f.waiting}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {s.result != null && s.phase !== "call" && (
            <div style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.sorted, fontWeight: 700, paddingTop: 20 }}>
              → {s.result}
            </div>
          )}
        </div>
      ),
    });
  },
};

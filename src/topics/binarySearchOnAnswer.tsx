import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Cell, Row, PointerTag } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  lo: number;
  hi: number;
  mid: number;
  feasible: boolean | null;
  daysNeeded: number | null;
  answer: number | null;
}

const WEIGHTS = [3, 2, 2, 4, 1, 4];
const DAYS = 3;

function daysNeeded(cap: number): number {
  let d = 1;
  let load = 0;
  for (const w of WEIGHTS) {
    if (load + w > cap) {
      d++;
      load = 0;
    }
    load += w;
  }
  return d;
}

function build() {
  const steps: Step[] = [];
  let lo = Math.max(...WEIGHTS);
  let hi = WEIGHTS.reduce((a, b) => a + b, 0);
  let answer: number | null = null;

  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ lo, hi, mid: -1, feasible: null, daysNeeded: null, answer, ...e });

  snap({
    chapter: "Setup",
    caption: `Ship packages [${WEIGHTS.join(", ")}] within ${DAYS} days — find minimum capacity.`,
    insight: "Binary search on the answer: if capacity C works, any C' > C also works.",
  });
  snap({ caption: `Search range: [${lo}, ${hi}] — from max package to total weight.` });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const needed = daysNeeded(mid);
    const ok = needed <= DAYS;
    snap({
      mid,
      feasible: ok,
      daysNeeded: needed,
      caption: `Try capacity ${mid} → needs ${needed} day${needed === 1 ? "" : "s"} ${ok ? `≤ ${DAYS} ✓` : `> ${DAYS} ✗`}.`,
    });
    if (ok) {
      answer = mid;
      snap({
        mid,
        feasible: true,
        daysNeeded: needed,
        caption: `Feasible — try smaller capacity (hi = ${mid - 1}).`,
      });
      hi = mid - 1;
    } else {
      snap({
        mid,
        feasible: false,
        daysNeeded: needed,
        caption: `Too small — need more capacity (lo = ${mid + 1}).`,
      });
      lo = mid + 1;
    }
  }

  snap({
    chapter: "Answer",
    answer,
    caption: `Minimum capacity = ${answer}. ✓`,
  });
  return withCodeLines(steps, (s) => {
    if (s.caption.startsWith("Ship packages")) return [0, 1];
    if (s.caption.startsWith("Search range")) return [2, 3];
    if (s.feasible === true && s.caption.startsWith("Try capacity")) return [4, 5, 6, 7];
    if (s.feasible === false && s.caption.startsWith("Try capacity")) return [4, 5, 6, 8];
    if (s.caption.startsWith("Feasible")) return [9, 10];
    if (s.caption.startsWith("Too small")) return [9, 11];
    if (s.caption.startsWith("Minimum capacity")) return [12];
    return [4, 5];
  });
}

const CODE = `function shipWithinDays(weights, days) {
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);
  const feasible = (cap) => {
    let d = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { d++; load = 0; }
      load += w;
    }
    return d <= days;
  };
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (feasible(mid)) hi = mid - 1;  // try smaller
    else lo = mid + 1;               // need bigger
  }
  return lo;
}`;

export const binarySearchOnAnswer: Topic = {
  id: "binary-search-on-answer",
  title: "Binary Search on Answer",
  category: "Techniques",
  blurb: "Search the answer space when feasibility is monotonic.",
  useWhen: "You need the minimum/maximum X such that a check(X) passes.",
  badges: ["O(n log S)"],
  prerequisites: ["binary-search"],
  quiz: [
    {
      question: "When capacity 15 is feasible, what does that tell us about capacity 20?",
      options: ["20 is infeasible", "20 is also feasible", "Unknown", "20 is optimal"],
      correctIndex: 1,
      explanation: "Higher capacity can only make packing easier — feasibility is monotonic.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "When the answer lies in a range and a feasibility check is monotonic (if X works, X+1 works too), binary search finds the boundary. Here we binary-search capacity: can we ship all packages within D days?\n\nTime: O(n log S) where S = sum of weights",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Row gap={8}>
            {WEIGHTS.map((w, i) => (
              <Cell key={i} value={w} state="default" size={54} sub={i} />
            ))}
          </Row>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT_MONO }}>
            <RangeCell label="lo" value={s.lo} active={s.mid < 0} />
            <RangeCell label="mid" value={s.mid >= 0 ? s.mid : "—"} active={s.mid >= 0} highlight={s.feasible} />
            <RangeCell label="hi" value={s.hi} active={false} />
          </div>
          {s.daysNeeded != null && (
            <div style={{ fontFamily: FONT_MONO, color: C.textMuted, fontSize: 15 }}>
              capacity {s.mid} → {s.daysNeeded} day{s.daysNeeded === 1 ? "" : "s"}
              {s.feasible != null && (
                <span style={{ color: s.feasible ? C.sorted : C.compare, fontWeight: 700, marginLeft: 8 }}>
                  {s.feasible ? "feasible" : "infeasible"}
                </span>
              )}
            </div>
          )}
          {s.answer != null && s.mid < 0 && (
            <div style={{ fontFamily: FONT_MONO, color: C.sorted, fontWeight: 700, fontSize: 18 }}>
              answer = {s.answer}
            </div>
          )}
        </div>
      ),
    }),
};

function RangeCell({
  label,
  value,
  active,
  highlight,
}: {
  label: string;
  value: number | string;
  active: boolean;
  highlight?: boolean | null;
}) {
  const bg =
    highlight === true ? C.sorted : highlight === false ? C.compare : active ? C.active : C.default;
  const dark = !active && highlight == null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <PointerTag label={label} />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: bg,
          border: `2px solid ${C.surfaceBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 22,
          color: dark ? C.text : C.ink,
          transition: "background 200ms",
        }}
      >
        {value}
      </div>
    </div>
  );
}

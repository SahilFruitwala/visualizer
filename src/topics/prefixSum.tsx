import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  prefix: (number | null)[];
  buildIdx: number; // index being filled (-1)
  queryL: number;
  queryR: number;
  phase: "build" | "query";
}

function build(a: number[]) {
  const prefix: (number | null)[] = Array(a.length + 1).fill(null);
  prefix[0] = 0;
  const steps: Step[] = [];
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ prefix: [...prefix], buildIdx: -1, queryL: -1, queryR: -1, phase: "build", ...e });

  snap({ caption: "Prefix sums: prefix[i] = sum of the first i elements. prefix[0] = 0." });
  for (let i = 0; i < a.length; i++) {
    prefix[i + 1] = (prefix[i] as number) + a[i];
    snap({ buildIdx: i + 1, caption: `prefix[${i + 1}] = prefix[${i}] + a[${i}] = ${prefix[i + 1]}.` });
  }
  // a range query
  const l = 2, r = 5;
  snap({ phase: "query", queryL: l, queryR: r, caption: `Query sum of a[${l}..${r}].` });
  snap({ phase: "query", queryL: l, queryR: r, caption: `= prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${(prefix[r + 1] as number) - (prefix[l] as number)} (O(1)!). ✓` });
  return steps;
}

const CODE = `function buildPrefix(a) {
  const p = [0];
  for (let i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
  return p;
}
// sum of a[l..r] inclusive:
const rangeSum = (p, l, r) => p[r + 1] - p[l];  // O(1) per query`;

export const prefixSum: Topic = {
  id: "prefix-sum",
  title: "Prefix Sums",
  category: "Techniques",
  blurb: "Precompute running totals for O(1) range sums.",
  create: () => {
    const a = [3, 1, 4, 1, 5, 9, 2, 6];
    return defineViz<Step>({
      steps: build(a),
      code: CODE,
      explanation:
        "By precomputing cumulative sums once, any range sum a[l..r] becomes a single subtraction prefix[r+1] − prefix[l]. Trades O(n) preprocessing for O(1) queries.\n\nBuild: O(n) · Query: O(1) · Space: O(n)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted, marginBottom: 6 }}>array a</div>
            <Row gap={6}>
              {a.map((v, i) => (
                <Cell key={i} value={v} state={s.phase === "query" && i >= s.queryL && i <= s.queryR ? "active" : "default"} size={50} sub={i} />
              ))}
            </Row>
          </div>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted, marginBottom: 6 }}>prefix</div>
            <Row gap={6}>
              {s.prefix.map((v, i) => {
                const ql = s.phase === "query" && (i === s.queryL || i === s.queryR + 1);
                return <Cell key={i} value={v ?? "·"} state={i === s.buildIdx ? "active" : ql ? "compare" : v == null ? "muted" : "sorted"} size={50} sub={i} />;
              })}
            </Row>
          </div>
        </div>
      ),
    });
  },
};

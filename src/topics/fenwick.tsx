import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

const VALUES = [3, 2, 5, 1, 4, 6, 2, 7]; // 0-indexed source
const N = VALUES.length;

interface Step extends StepBase {
  bit: number[]; // 1-indexed (length N+1)
  touched: number; // index currently updated/read
  mode: "build" | "query";
  acc: number;
}

function build() {
  const bit = Array(N + 1).fill(0);
  const steps: Step[] = [];
  const snap = (touched: number, mode: Step["mode"], acc: number, caption: string) =>
    steps.push({ bit: [...bit], touched, mode, acc, caption });

  snap(0, "build", 0, "A Fenwick tree stores partial sums; index i covers the last (i & −i) elements.");
  const update = (i: number, delta: number) => {
    for (let j = i; j <= N; j += j & -j) {
      bit[j] += delta;
      snap(j, "build", 0, `add ${delta} at index ${i}: bump bit[${j}] (jump by ${j & -j}).`);
    }
  };
  for (let i = 0; i < N; i++) update(i + 1, VALUES[i]);
  snap(0, "build", 0, "All values inserted. Now compute a prefix sum.");

  // prefix sum up to index 6 (1-indexed)
  let acc = 0;
  const target = 6;
  for (let j = target; j > 0; j -= j & -j) {
    acc += bit[j];
    snap(j, "query", acc, `prefix(${target}): add bit[${j}]=${bit[j]} (jump down by ${j & -j}) → ${acc}.`);
  }
  snap(0, "query", acc, `Sum of first ${target} elements = ${acc}, in O(log n) steps. ✓`);
  return steps;
}

const CODE = `class Fenwick {
  bit = Array(n + 1).fill(0);
  update(i, delta) {                 // i is 1-indexed
    for (; i <= n; i += i & -i) this.bit[i] += delta;
  }
  prefix(i) {                        // sum of [1..i]
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.bit[i];
    return s;
  }
}`;

export const fenwick: Topic = {
  id: "fenwick-tree",
  title: "Fenwick Tree (BIT)",
  category: "Data Structures",
  blurb: "Prefix sums with O(log n) update & query.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A Binary Indexed Tree stores cumulative sums in a clever layout: index i holds the sum of the (i & −i) elements ending at i. Updates climb by adding the lowest set bit; prefix queries descend by removing it — both O(log n) using bit tricks.\n\nUpdate / Prefix query: O(log n) · Space: O(n)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: s.mode === "query" ? C.sorted : C.active }}>
            {s.mode === "query" ? `prefix accumulator = ${s.acc}` : "building (point updates)"}
          </div>
          <Row gap={6}>
            {s.bit.slice(1).map((v, i) => (
              <Cell key={i} value={v} state={i + 1 === s.touched ? (s.mode === "query" ? "compare" : "active") : "default"} size={52} sub={i + 1} />
            ))}
          </Row>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>indices are 1-based</div>
        </div>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  arr: number[];
  count: number[];
  scanIdx: number; // index in arr being counted (-1)
  countIdx: number; // count bucket highlighted
  out: (number | null)[];
}

const MAXV = 8;

function build(input: number[]) {
  const arr = [...input];
  const count = Array(MAXV + 1).fill(0);
  const out: (number | null)[] = Array(arr.length).fill(null);
  const steps: Step[] = [];
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ arr: [...arr], count: [...count], scanIdx: -1, countIdx: -1, out: [...out], ...e });

  snap({ caption: "Counting Sort tallies how many times each value appears." });
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
    snap({ scanIdx: i, countIdx: arr[i], caption: `See ${arr[i]} → count[${arr[i]}]++.` });
  }
  snap({ caption: "Now emit values in order, using the counts." });
  let k = 0;
  for (let v = 0; v <= MAXV; v++) {
    while (count[v] > 0) {
      out[k] = v;
      count[v]--;
      snap({ countIdx: v, out: [...out], caption: `Output ${v} (${count[v]} left).` });
      k++;
    }
  }
  for (let i = 0; i < arr.length; i++) arr[i] = out[i]!;
  snap({ caption: "Sorted without any comparisons. ✓" });
  return steps;
}

const CODE = `function countingSort(a, max) {
  const count = Array(max + 1).fill(0);
  for (const x of a) count[x]++;       // tally
  const out = [];
  for (let v = 0; v <= max; v++)
    while (count[v]-- > 0) out.push(v); // emit in order
  return out;
}`;

export const countingSort: Topic = {
  id: "counting-sort",
  title: "Counting Sort",
  category: "Sorting",
  blurb: "Tally occurrences, then emit in value order.",
  create: () => {
    const input = [4, 2, 7, 1, 4, 2, 6, 1, 7, 3];
    return defineViz<Step>({
      steps: build(input),
      code: CODE,
      explanation:
        "Counting Sort works when values fall in a small known range. It counts occurrences of each value, then walks the count array to emit the sorted output. No comparisons needed. This demo uses the simple tally variant; a prefix-sum + backward pass is needed for stability.\n\nTime: O(n + k) · Space: O(k) · Stable: no (this variant) · k = value range",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
          <Row gap={6}>
            {s.arr.map((v, i) => (
              <Cell key={i} value={v} state={i === s.scanIdx ? "active" : "default"} size={46} />
            ))}
          </Row>
          <div style={{ display: "flex", gap: 6 }}>
            {s.count.map((c, v) => (
              <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 40, height: 40, borderRadius: 7, background: v === s.countIdx ? C.compare : "#1b2440", color: v === s.countIdx ? "#0e1424" : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, border: `1px solid ${C.surfaceBorder}`, transition: "background 180ms" }}>{c}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>{v}</div>
              </div>
            ))}
          </div>
          <Row gap={6}>
            {s.out.map((v, i) => (
              <Cell key={i} value={v ?? "·"} state={v == null ? "muted" : "sorted"} size={46} />
            ))}
          </Row>
        </div>
      ),
    });
  },
};

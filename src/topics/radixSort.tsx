import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  arr: number[];
  digitPlace: number; // 1, 10, 100
  buckets: number[][];
  phase: "distribute" | "collect" | "idle";
  active: number; // value just placed
}

function build(input: number[]) {
  const arr = [...input];
  const steps: Step[] = [];
  const maxDigits = Math.max(...arr).toString().length;
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ arr: [...arr], digitPlace: 1, buckets: Array.from({ length: 10 }, () => []), phase: "idle", active: -1, ...e });

  snap({ caption: "Radix Sort (LSD): stably sort by each digit, least-significant first." });
  for (let d = 0; d < maxDigits; d++) {
    const place = 10 ** d;
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const v of arr) {
      const digit = Math.floor(v / place) % 10;
      buckets[digit].push(v);
      snap({ digitPlace: place, buckets: buckets.map((b) => [...b]), phase: "distribute", active: v, caption: `Digit at place ${place}: ${v} → bucket ${digit}.` });
    }
    let k = 0;
    for (let b = 0; b < 10; b++) for (const v of buckets[b]) arr[k++] = v;
    snap({ digitPlace: place, buckets: buckets.map((b) => [...b]), phase: "collect", caption: `Collect buckets 0→9 to rebuild the array.` });
  }
  snap({ caption: "Sorted after processing every digit. ✓" });
  return steps;
}

const CODE = `function radixSort(a) {
  const max = Math.max(...a);
  for (let place = 1; place <= max; place *= 10) {
    const buckets = Array.from({length: 10}, () => []);
    for (const v of a) buckets[Math.floor(v / place) % 10].push(v);
    a = [].concat(...buckets);  // stable collect
  }
  return a;
}`;

export const radixSort: Topic = {
  id: "radix-sort",
  title: "Radix Sort",
  category: "Sorting",
  blurb: "Sort by each digit using stable bucket passes.",
  create: () => {
    const input = [170, 45, 75, 90, 2, 802, 24, 66];
    return defineViz<Step>({
      steps: build(input),
      code: CODE,
      explanation:
        "Radix Sort sorts integers digit by digit (here from the least-significant digit), using a stable bucket distribution each pass. After processing every digit place, the array is sorted.\n\nTime: O(d·(n + b)) · Space: O(n + b) · Stable: yes (d digits, b base)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
          <Row gap={5}>
            {s.arr.map((v, i) => (
              <Cell key={i} value={v} state={v === s.active ? "active" : "default"} size={48} />
            ))}
          </Row>
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>
            {s.phase === "idle" ? "" : `place = ${s.digitPlace} · ${s.phase}`}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {s.buckets.map((b, d) => (
              <div key={d} style={{ minWidth: 38, minHeight: 30, padding: 4, borderRadius: 7, border: `1px solid ${C.surfaceBorder}`, background: "#11182e", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted }}>{d}</div>
                {b.map((v, j) => (
                  <div key={j} style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.text, background: C.default, borderRadius: 4, padding: "1px 5px" }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  },
};

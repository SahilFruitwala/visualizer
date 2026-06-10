import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Bar, Row } from "../components/primitives";
import { shuffle } from "../engine/util";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  arr: number[];
  buckets: number[][];
  activeBucket: number;
  activeIdx: number;
}

function build(input: number[]) {
  const arr = [...input];
  const max = Math.max(...arr, 1);
  const bucketCount = 5;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  const steps: Step[] = [];

  const snap = (caption: string, extra: Partial<Step> = {}) =>
    steps.push({
      arr: [...arr],
      buckets: buckets.map((b) => [...b]),
      activeBucket: -1,
      activeIdx: -1,
      caption,
      ...extra,
    });

  snap("Bucket Sort distributes values into buckets, then sorts each bucket.", { chapter: "Setup" });

  for (let i = 0; i < arr.length; i++) {
    const b = Math.min(bucketCount - 1, Math.floor((arr[i] / (max + 1)) * bucketCount));
    buckets[b].push(arr[i]);
    snap(`Place ${arr[i]} into bucket ${b}.`, { activeBucket: b, activeIdx: buckets[b].length - 1 });
  }

  snap("Concatenate buckets in order — each bucket sorted with insertion sort.", { chapter: "Gather" });

  let k = 0;
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, c) => a - c);
    for (const v of buckets[b]) {
      arr[k++] = v;
      snap(`Emit ${v} from bucket ${b}.`, { activeBucket: b });
    }
  }

  snap("Array sorted via bucket distribution. ✓", { chapter: "Complete" });
  return steps;
}

const CODE = `function bucketSort(a, bucketCount = 5) {
  const max = Math.max(...a);
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (const x of a) {
    const b = Math.floor((x / (max + 1)) * bucketCount);
    buckets[Math.min(bucketCount - 1, b)].push(x);
  }
  return buckets.flatMap((b) => b.sort((u, v) => u - v));
}`;

export const bucketSort: Topic = {
  id: "bucket-sort",
  title: "Bucket Sort",
  category: "Sorting",
  blurb: "Distribute into buckets, sort each, concatenate.",
  create: () => {
    const input = shuffle([12, 4, 7, 2, 9, 5, 18, 3, 11, 6]);
    return defineViz<Step>({
      steps: build(input),
      code: CODE,
      explanation:
        "Bucket Sort assumes values are uniformly distributed over a range. It maps each value to a bucket index, sorts each bucket (often with insertion sort), then concatenates. Works well when input is evenly spread.\n\nTime: O(n + k) average · O(n²) worst · Space: O(n + k) · k = bucket count",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <Row gap={6}>
            {s.arr.map((v, i) => (
              <Bar key={i} value={v} max={20} state="default" width={36} />
            ))}
          </Row>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {s.buckets.map((bucket, bi) => (
              <div
                key={bi}
                style={{
                  minWidth: 72,
                  minHeight: 80,
                  padding: 8,
                  borderRadius: 10,
                  border: `2px solid ${bi === s.activeBucket ? C.activeBorder : C.surfaceBorder}`,
                  background: bi === s.activeBucket ? C.active : C.surface,
                }}
              >
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted, marginBottom: 6 }}>
                  bucket {bi}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {bucket.length === 0 ? (
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>·</span>
                  ) : (
                    bucket.map((v, vi) => (
                      <span
                        key={vi}
                        style={{
                          fontFamily: FONT_MONO,
                          fontWeight: 700,
                          fontSize: 13,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: bi === s.activeBucket && vi === s.activeIdx ? C.sorted : C.default,
                        }}
                      >
                        {v}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  },
};

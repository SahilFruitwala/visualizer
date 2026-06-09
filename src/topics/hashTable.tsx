import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const BUCKETS = 7;

interface Step extends StepBase {
  table: number[][];
  hashing: number | null; // value being inserted
  bucket: number; // target bucket (-1 none)
}

function build() {
  const table: number[][] = Array.from({ length: BUCKETS }, () => []);
  const steps: Step[] = [];
  const snap = (hashing: number | null, bucket: number, caption: string) =>
    steps.push({ table: table.map((b) => [...b]), hashing, bucket, caption });

  snap(null, -1, `Hash table with ${BUCKETS} buckets. Index = key % ${BUCKETS}.`);
  for (const v of [12, 5, 19, 26, 33, 8, 40]) {
    const idx = v % BUCKETS;
    snap(v, idx, `insert(${v}) → ${v} % ${BUCKETS} = ${idx}.`);
    const collision = table[idx].length > 0;
    table[idx].push(v);
    snap(null, idx, collision ? `Bucket ${idx} occupied → chain it (collision).` : `Place ${v} in empty bucket ${idx}.`);
  }
  snap(null, -1, "All keys stored. Average lookup is O(1).");
  return steps;
}

const CODE = `class HashMap {
  buckets = Array.from({length: 7}, () => []);
  hash(k) { return k % this.buckets.length; }
  set(k) {
    const b = this.buckets[this.hash(k)];
    if (!b.includes(k)) b.push(k); // separate chaining
  }
  has(k) { return this.buckets[this.hash(k)].includes(k); }
}`;

export const hashTable: Topic = {
  id: "hash-table",
  title: "Hash Table",
  category: "Data Structures",
  blurb: "Map keys to buckets via a hash; chain collisions.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A hash function maps each key to a bucket index. When two keys land in the same bucket (a collision), separate chaining stores them in a list at that bucket.\n\nAverage: O(1) insert/lookup · Worst: O(n) if many collisions",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {s.hashing != null && (
            <div style={{ fontFamily: FONT_MONO, color: C.active, marginBottom: 8 }}>
              hashing {s.hashing} → bucket {s.bucket}
            </div>
          )}
          {s.table.map((bucket, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: i === s.bucket ? C.active : C.surface, color: i === s.bucket ? C.ink : C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, border: `1px solid ${C.surfaceBorder}`, transition: "background 200ms" }}>{i}</div>
              <div style={{ color: C.surfaceBorder }}>→</div>
              <div style={{ display: "flex", gap: 6 }}>
                {bucket.length === 0 ? (
                  <span style={{ color: C.textMuted, fontFamily: FONT_MONO, fontSize: 14 }}>∅</span>
                ) : (
                  bucket.map((v, j) => (
                    <div key={j} style={{ padding: "6px 12px", borderRadius: 7, background: i === s.bucket && j === bucket.length - 1 ? C.sorted : C.default, color: i === s.bucket && j === bucket.length - 1 ? C.ink : C.text, fontFamily: FONT_MONO, fontWeight: 700, border: `1px solid ${C.surfaceBorder}` }}>{v}</div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    }),
};

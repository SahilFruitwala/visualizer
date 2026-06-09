import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  heap: number[];
  a: number; // node being moved
  b: number; // node compared/swapped with
}

function build() {
  const heap: number[] = [];
  const steps: Step[] = [];
  const snap = (a: number, b: number, caption: string) => steps.push({ heap: [...heap], a, b, caption });

  snap(-1, -1, "A min-heap keeps the smallest value at the root. Stored as an array.");

  const insert = (v: number) => {
    heap.push(v);
    let i = heap.length - 1;
    snap(i, -1, `Insert ${v} at the end, then sift up.`);
    while (i > 0) {
      const p = (i - 1) >> 1;
      snap(i, p, `Compare ${heap[i]} with parent ${heap[p]}.`);
      if (heap[p] <= heap[i]) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      snap(p, i, `Smaller → swap up.`);
      i = p;
    }
  };
  for (const v of [5, 3, 8, 1, 9, 2]) insert(v);

  // extract-min
  snap(0, -1, `extractMin() → root ${heap[0]} is the minimum.`);
  const last = heap.pop()!;
  heap[0] = last;
  let i = 0;
  snap(0, -1, `Move last element ${last} to root, then sift down.`);
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let small = i;
    if (l < heap.length && heap[l] < heap[small]) small = l;
    if (r < heap.length && heap[r] < heap[small]) small = r;
    if (small === i) break;
    snap(i, small, `Smallest child is ${heap[small]} → swap down.`);
    [heap[i], heap[small]] = [heap[small], heap[i]];
    i = small;
  }
  snap(0, -1, "Heap property restored. Root is the new minimum. ✓");
  return steps;
}

const CODE = `class MinHeap {
  h = [];
  push(v) {
    this.h.push(v);
    let i = this.h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p] <= this.h[i]) break;
      [this.h[i], this.h[p]] = [this.h[p], this.h[i]]; i = p;
    }
  }
  pop() { /* swap root with last, sift down */ }
}`;

function nodePos(i: number) {
  const depth = Math.floor(Math.log2(i + 1));
  const idxInLevel = i - (2 ** depth - 1);
  const count = 2 ** depth;
  return { x: (idxInLevel + 0.5) / count, y: depth };
}

const W = 520, H = 260, PAD = 30;

export const heap: Topic = {
  id: "heap",
  title: "Heap / Priority Queue",
  category: "Trees",
  blurb: "A tree where the root is always the min (or max).",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A binary heap is a complete tree stored in an array: children of i live at 2i+1 and 2i+2. Insertion sifts up; extract-min swaps the root with the last node and sifts down. It powers priority queues and Dijkstra.\n\npush / pop: O(log n) · peek-min: O(1)",
      renderStep: (s) => {
        const x = (f: number) => PAD + f * (W - 2 * PAD);
        const y = (d: number) => PAD + d * 70;
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <svg width={W} height={H} style={{ overflow: "visible" }}>
              {s.heap.map((_, i) => {
                if (i === 0) return null;
                const p = (i - 1) >> 1;
                const a = nodePos(i), b = nodePos(p);
                return <line key={`e${i}`} x1={x(a.x)} y1={y(a.y)} x2={x(b.x)} y2={y(b.y)} stroke={C.surfaceBorder} strokeWidth={2} />;
              })}
              {s.heap.map((v, i) => {
                const pos = nodePos(i);
                const on = i === s.a || i === s.b;
                return (
                  <g key={i}>
                    <circle cx={x(pos.x)} cy={y(pos.y)} r={22} fill={on ? C.active : i === 0 ? C.sorted : C.default} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                    <text x={x(pos.x)} y={y(pos.y) + 6} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={17} fill={on || i === 0 ? C.ink : C.text}>{v}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: 4 }}>
              {s.heap.map((v, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, background: i === s.a || i === s.b ? C.active : C.surface, color: i === s.a || i === s.b ? C.ink : C.text, border: `1px solid ${C.surfaceBorder}` }}>{v}</div>
              ))}
            </div>
          </div>
        );
      },
    }),
};

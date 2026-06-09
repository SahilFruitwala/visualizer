import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const N = 7;

interface Step extends StepBase {
  parent: number[];
  highlight: number[]; // nodes involved
  roots: number[]; // roots involved
}

function build() {
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = Array(N).fill(0);
  const steps: Step[] = [];
  const snap = (highlight: number[], roots: number[], caption: string) =>
    steps.push({ parent: [...parent], highlight, roots, caption });

  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));

  snap([], [], "Union-Find tracks disjoint sets. Each element points to a parent; roots represent sets.");

  const union = (a: number, b: number) => {
    const ra = find(a), rb = find(b);
    snap([a, b], [ra, rb], `union(${a}, ${b}): roots are ${ra} and ${rb}.`);
    if (ra === rb) {
      snap([a, b], [ra], `Already in the same set — skip.`);
      return;
    }
    if (rank[ra] < rank[rb]) { parent[ra] = rb; }
    else if (rank[ra] > rank[rb]) { parent[rb] = ra; }
    else { parent[rb] = ra; rank[ra]++; }
    snap([a, b], [ra, rb], `Attach the smaller tree under the larger root.`);
  };

  union(0, 1);
  union(2, 3);
  union(0, 3);
  union(4, 5);
  union(1, 5);
  snap([6], [6], "Element 6 is still its own set.");
  snap([2, 5], [find(2), find(5)], `find(2) and find(5) share a root → connected ✓ (path compressed).`);
  return steps;
}

const CODE = `class DSU {
  parent = [...Array(n).keys()];
  find(x) {
    while (this.parent[x] !== x)
      x = this.parent[x] = this.parent[this.parent[x]]; // compress
    return x;
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent[rb] = ra;
  }
}`;

export const unionFind: Topic = {
  id: "union-find",
  title: "Union-Find (DSU)",
  category: "Data Structures",
  blurb: "Merge sets and query connectivity, near O(1).",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A disjoint-set union tracks which elements belong to the same group. find follows parent pointers to a root; union links two roots. Union-by-rank + path compression make operations almost constant.\n\nfind / union: ~O(α(n)) (inverse Ackermann ≈ O(1))",
      renderStep: (s) => {
        const W = 520, gap = W / N;
        const cx = (i: number) => gap * (i + 0.5);
        return (
          <svg width={W} height={170} style={{ overflow: "visible" }}>
            {s.parent.map((p, i) => {
              if (p === i) return null;
              const x1 = cx(i), x2 = cx(p), y = 120;
              const mx = (x1 + x2) / 2;
              return (
                <path key={`a${i}`} d={`M ${x1} ${y - 18} Q ${mx} ${30} ${x2} ${y - 18}`} fill="none" stroke={C.pointer} strokeWidth={2} markerEnd="url(#ah)" />
              );
            })}
            <defs>
              <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={C.pointer} />
              </marker>
            </defs>
            {s.parent.map((p, i) => {
              const isRoot = p === i;
              const hot = s.highlight.includes(i);
              const root = s.roots.includes(i);
              const fill = hot ? C.active : root ? C.sorted : isRoot ? C.highlight : C.default;
              return (
                <g key={i}>
                  <circle cx={cx(i)} cy={120} r={20} fill={fill} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={cx(i)} y={125} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={16} fill={fill === C.default ? C.text : "#0e1424"}>{i}</text>
                </g>
              );
            })}
          </svg>
        );
      },
    }),
};

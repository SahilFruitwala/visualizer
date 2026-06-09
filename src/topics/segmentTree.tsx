import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const ARR = [5, 8, 6, 3, 2, 7, 2, 6];
const N = ARR.length;

interface SNode { lo: number; hi: number; sum: number; }
interface Step extends StepBase {
  tree: Record<number, SNode>;
  active: number | null; // heap index being computed
  used: number[]; // nodes contributing to a query
}

function build() {
  const tree: Record<number, SNode> = {};
  const steps: Step[] = [];
  const snap = (active: number | null, used: number[], caption: string) =>
    steps.push({ tree: structuredClone(tree), active, used, caption });

  snap(null, [], "A segment tree stores the sum of each range, so range queries take O(log n).");
  const buildNode = (node: number, lo: number, hi: number): number => {
    if (lo === hi) {
      tree[node] = { lo, hi, sum: ARR[lo] };
      snap(node, [], `Leaf [${lo}] = ${ARR[lo]}.`);
      return ARR[lo];
    }
    const mid = (lo + hi) >> 1;
    const left = buildNode(2 * node, lo, mid);
    const right = buildNode(2 * node + 1, mid + 1, hi);
    tree[node] = { lo, hi, sum: left + right };
    snap(node, [], `Node [${lo}..${hi}] = ${left} + ${right} = ${left + right}.`);
    return left + right;
  };
  buildNode(1, 0, N - 1);
  snap(null, [], "Tree built. Now query the sum over a range.");

  // range query [2,6]
  const ql = 2, qr = 6;
  const used: number[] = [];
  let total = 0;
  const query = (node: number, lo: number, hi: number) => {
    if (qr < lo || hi < ql) return; // no overlap
    if (ql <= lo && hi <= qr) {
      used.push(node);
      total += tree[node].sum;
      snap(node, [...used], `[${lo}..${hi}] fully inside query → add ${tree[node].sum} (total ${total}).`);
      return;
    }
    const mid = (lo + hi) >> 1;
    query(2 * node, lo, mid);
    query(2 * node + 1, mid + 1, hi);
  };
  query(1, 0, N - 1);
  snap(null, [...used], `Sum of [${ql}..${qr}] = ${total}, from just ${used.length} nodes. ✓`);
  return steps;
}

const CODE = `function query(node, lo, hi, ql, qr) {
  if (qr < lo || hi < ql) return 0;        // disjoint
  if (ql <= lo && hi <= qr) return tree[node]; // fully covered
  const mid = (lo + hi) >> 1;              // partial → split
  return query(2*node, lo, mid, ql, qr)
       + query(2*node+1, mid+1, hi, ql, qr);
}`;

function pos(i: number) {
  const depth = Math.floor(Math.log2(i));
  const idxInLevel = i - 2 ** depth;
  return { x: (idxInLevel + 0.5) / 2 ** depth, y: depth };
}
const W = 620, H = 300, PAD = 30;

export const segmentTree: Topic = {
  id: "segment-tree",
  title: "Segment Tree",
  category: "Data Structures",
  blurb: "Range queries & updates in O(log n).",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Each node covers a range and stores its aggregate (here, sum). A range query descends, fully-covered subranges contribute directly, and partial ones split — touching only O(log n) nodes. Point updates are also O(log n).\n\nBuild: O(n) · Query/Update: O(log n)",
      renderStep: (s) => {
        const x = (f: number) => PAD + f * (W - 2 * PAD);
        const y = (d: number) => PAD + d * 64;
        const keys = Object.keys(s.tree).map(Number);
        return (
          <svg width={W} height={H} style={{ overflow: "visible" }}>
            {keys.map((i) => {
              if (i === 1) return null;
              const p = Math.floor(i / 2);
              if (!s.tree[p]) return null;
              const a = pos(i), b = pos(p);
              return <line key={`e${i}`} x1={x(a.x)} y1={y(a.y)} x2={x(b.x)} y2={y(b.y)} stroke={C.surfaceBorder} strokeWidth={2} />;
            })}
            {keys.map((i) => {
              const n = s.tree[i];
              const p = pos(i);
              const on = i === s.active;
              const used = s.used.includes(i);
              const fill = used ? C.sorted : on ? C.active : C.default;
              return (
                <g key={i}>
                  <rect x={x(p.x) - 22} y={y(p.y) - 15} width={44} height={30} rx={7} fill={fill} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={x(p.x)} y={y(p.y) + 5} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={14} fill={fill === C.default ? C.text : C.ink}>{n.sum}</text>
                  <text x={x(p.x)} y={y(p.y) + 26} textAnchor="middle" fontFamily={FONT_MONO} fontSize={9} fill={C.textMuted}>[{n.lo}{n.lo !== n.hi ? `..${n.hi}` : ""}]</text>
                </g>
              );
            })}
          </svg>
        );
      },
    }),
};

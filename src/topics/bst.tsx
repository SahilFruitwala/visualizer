import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface TNode {
  val: number;
  left: TNode | null;
  right: TNode | null;
}
interface Placed {
  val: number;
  x: number; // in-order index
  y: number; // depth
  parent: { x: number; y: number } | null;
}

interface Step extends StepBase {
  nodes: Placed[];
  active: number | null; // value highlighted (on the comparison path)
  found: number | null;
}

function layout(root: TNode | null): Placed[] {
  // Pass 1: in-order x and depth y for every node.
  const coord = new Map<TNode, { x: number; y: number }>();
  let order = 0;
  const assign = (n: TNode | null, depth: number) => {
    if (!n) return;
    assign(n.left, depth + 1);
    coord.set(n, { x: order++, y: depth });
    assign(n.right, depth + 1);
  };
  assign(root, 0);

  // Pass 2: emit each node with its parent's coordinates.
  const out: Placed[] = [];
  const emit = (n: TNode | null, parent: TNode | null) => {
    if (!n) return;
    const c = coord.get(n)!;
    out.push({ val: n.val, x: c.x, y: c.y, parent: parent ? coord.get(parent)! : null });
    emit(n.left, n);
    emit(n.right, n);
  };
  emit(root, null);
  return out;
}

function build() {
  const steps: Step[] = [];
  let root: TNode | null = null;
  const snap = (active: number | null, found: number | null, caption: string) =>
    steps.push({ nodes: layout(root), active, found, caption });

  snap(null, null, "A BST keeps left < node < right, so search follows one branch.");

  const insert = (v: number) => {
    if (!root) {
      root = { val: v, left: null, right: null };
      snap(v, null, `Insert ${v} as the root.`);
      return;
    }
    let cur = root;
    while (true) {
      snap(cur.val, null, `Insert ${v}: ${v} ${v < cur.val ? "<" : ">"} ${cur.val} → go ${v < cur.val ? "left" : "right"}.`);
      if (v < cur.val) {
        if (!cur.left) { cur.left = { val: v, left: null, right: null }; break; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = { val: v, left: null, right: null }; break; }
        cur = cur.right;
      }
    }
    snap(v, null, `Place ${v}. ✓`);
  };
  for (const v of [8, 3, 10, 1, 6, 14, 4, 7]) insert(v);

  // search (root passed as a param so its type isn't narrowed to null)
  const search = (r: TNode | null, target: number) => {
    let cur = r;
    while (cur) {
      if (cur.val === target) { snap(cur.val, target, `Found ${target}! ✓`); break; }
      snap(cur.val, null, `Search ${target}: ${target} ${target < cur.val ? "<" : ">"} ${cur.val} → go ${target < cur.val ? "left" : "right"}.`);
      cur = target < cur.val ? cur.left : cur.right;
    }
  };
  search(root, 7);
  return steps;
}

const CODE = `function insert(root, v) {
  if (!root) return { val: v, left: null, right: null };
  if (v < root.val) root.left = insert(root.left, v);
  else root.right = insert(root.right, v);
  return root;
}
function search(root, v) {
  while (root && root.val !== v)
    root = v < root.val ? root.left : root.right;
  return root;
}`;

const W = 560, H = 320, PAD = 34;

export const bst: Topic = {
  id: "bst",
  title: "Binary Search Tree",
  category: "Trees",
  blurb: "Ordered tree: left < node < right.",
  create: () => {
    const steps = build();
    const maxX = Math.max(1, ...steps.flatMap((s) => s.nodes.map((n) => n.x)));
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "In a binary search tree every left descendant is smaller and every right descendant is larger. That ordering lets insert and search follow a single root-to-leaf path.\n\nBalanced: O(log n) · Degenerate (sorted input): O(n)",
      renderStep: (s) => {
        const x = (xi: number) => PAD + (maxX === 0 ? 0.5 : xi / maxX) * (W - 2 * PAD);
        const y = (d: number) => PAD + d * 64;
        return (
          <svg width={W} height={H} style={{ overflow: "visible" }}>
            {s.nodes.map((n, i) =>
              n.parent ? <line key={`e${i}`} x1={x(n.x)} y1={y(n.y)} x2={x(n.parent.x)} y2={y(n.parent.y)} stroke={C.surfaceBorder} strokeWidth={2} /> : null,
            )}
            {s.nodes.map((n, i) => {
              const on = n.val === s.active;
              const fnd = n.val === s.found;
              return (
                <g key={i}>
                  <circle cx={x(n.x)} cy={y(n.y)} r={20} fill={fnd ? C.sorted : on ? C.active : C.default} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={x(n.x)} y={y(n.y) + 5} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={16} fill={on || fnd ? C.ink : C.text}>{n.val}</text>
                </g>
              );
            })}
          </svg>
        );
      },
    });
  },
};

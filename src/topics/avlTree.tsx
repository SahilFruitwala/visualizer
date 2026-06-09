import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Node { val: number; left: Node | null; right: Node | null; h: number; }
interface Placed { val: number; bf: number; x: number; y: number; parent: { x: number; y: number } | null; }
interface Step extends StepBase { nodes: Placed[]; highlight: number | null; }

const ht = (n: Node | null) => (n ? n.h : 0);
const bf = (n: Node | null) => (n ? ht(n.left) - ht(n.right) : 0);
const fix = (n: Node) => { n.h = 1 + Math.max(ht(n.left), ht(n.right)); return n; };

function rotateRight(y: Node): Node {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  fix(y); fix(x);
  return x;
}
function rotateLeft(x: Node): Node {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  fix(x); fix(y);
  return y;
}

function layout(root: Node | null): Placed[] {
  const coord = new Map<Node, { x: number; y: number }>();
  let order = 0;
  const assign = (n: Node | null, d: number) => {
    if (!n) return;
    assign(n.left, d + 1);
    coord.set(n, { x: order++, y: d });
    assign(n.right, d + 1);
  };
  assign(root, 0);
  const out: Placed[] = [];
  const emit = (n: Node | null, p: Node | null) => {
    if (!n) return;
    const c = coord.get(n)!;
    out.push({ val: n.val, bf: bf(n), x: c.x, y: c.y, parent: p ? coord.get(p)! : null });
    emit(n.left, n); emit(n.right, n);
  };
  emit(root, null);
  return out;
}

function build() {
  let root: Node | null = null;
  const steps: Step[] = [];
  const snap = (highlight: number | null, caption: string) =>
    steps.push({ nodes: layout(root), highlight, caption });

  snap(null, "An AVL tree auto-balances after each insert via rotations (|balance| ≤ 1).");

  const insert = (node: Node | null, val: number): Node => {
    if (!node) return { val, left: null, right: null, h: 1 };
    if (val < node.val) node.left = insert(node.left, val);
    else node.right = insert(node.right, val);
    fix(node);
    const b = bf(node);
    if (b > 1 && val < node.left!.val) { snap(node.val, `${node.val} unbalanced (LL) → rotate right.`); return rotateRight(node); }
    if (b < -1 && val > node.right!.val) { snap(node.val, `${node.val} unbalanced (RR) → rotate left.`); return rotateLeft(node); }
    if (b > 1 && val > node.left!.val) { snap(node.val, `${node.val} unbalanced (LR) → rotate left-right.`); node.left = rotateLeft(node.left!); return rotateRight(node); }
    if (b < -1 && val < node.right!.val) { snap(node.val, `${node.val} unbalanced (RL) → rotate right-left.`); node.right = rotateRight(node.right!); return rotateLeft(node); }
    return node;
  };

  for (const v of [10, 20, 30, 40, 50, 25]) {
    root = insert(root, v);
    snap(v, `Inserted ${v}; tree rebalanced. ✓`);
  }
  snap(null, "Every insert kept the tree height O(log n). ✓");
  return steps;
}

const CODE = `function insert(node, val) {
  if (!node) return leaf(val);
  if (val < node.val) node.left = insert(node.left, val);
  else node.right = insert(node.right, val);
  updateHeight(node);
  const b = balance(node);                 // height(L) - height(R)
  if (b > 1 && val < node.left.val) return rotateRight(node);  // LL
  if (b < -1 && val > node.right.val) return rotateLeft(node); // RR
  if (b > 1) { node.left = rotateLeft(node.left); return rotateRight(node); } // LR
  if (b < -1) { node.right = rotateRight(node.right); return rotateLeft(node); } // RL
  return node;
}`;

const W = 560, H = 320, PAD = 34;

export const avlTree: Topic = {
  id: "avl-tree",
  title: "AVL Tree (Rotations)",
  category: "Data Structures",
  blurb: "Self-balancing BST via rotations.",
  create: () => {
    const steps = build();
    const maxX = Math.max(1, ...steps.flatMap((s) => s.nodes.map((n) => n.x)));
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "An AVL tree is a BST that keeps every node's balance factor (left height − right height) within ±1. After an insert breaks that, one or two rotations restore balance, guaranteeing O(log n) height. The number under each node is its balance factor.\n\ninsert / delete / search: O(log n) guaranteed",
      renderStep: (s) => {
        const x = (xi: number) => PAD + (maxX === 0 ? 0.5 : xi / maxX) * (W - 2 * PAD);
        const y = (d: number) => PAD + d * 64;
        return (
          <svg width={W} height={H} style={{ overflow: "visible" }}>
            {s.nodes.map((n, i) => (n.parent ? <line key={`e${i}`} x1={x(n.x)} y1={y(n.y)} x2={x(n.parent.x)} y2={y(n.parent.y)} stroke={C.surfaceBorder} strokeWidth={2} /> : null))}
            {s.nodes.map((n, i) => {
              const on = n.val === s.highlight;
              return (
                <g key={i}>
                  <circle cx={x(n.x)} cy={y(n.y)} r={20} fill={on ? C.active : C.default} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={x(n.x)} y={y(n.y) + 5} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={15} fill={on ? "#0e1424" : C.text}>{n.val}</text>
                  <text x={x(n.x)} y={y(n.y) - 26} textAnchor="middle" fontFamily={FONT_MONO} fontSize={11} fill={Math.abs(n.bf) > 1 ? C.compare : C.textMuted}>{n.bf > 0 ? `+${n.bf}` : n.bf}</text>
                </g>
              );
            })}
          </svg>
        );
      },
    });
  },
};

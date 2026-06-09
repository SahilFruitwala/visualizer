import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

// Complete binary tree stored as a heap array (index i → children 2i+1, 2i+2).
const TREE = [8, 3, 10, 1, 6, 9, 14];

interface Step extends StepBase {
  current: number;
  visited: number[]; // node indices output so far
  output: number[]; // values in visit order
}

function build() {
  const steps: Step[] = [];
  const visited: number[] = [];
  const output: number[] = [];
  const snap = (current: number, caption: string) =>
    steps.push({ current, visited: [...visited], output: [...output], caption });

  snap(-1, "In-order DFS: traverse Left → Node → Right. Produces sorted order for a BST.");
  const inorder = (i: number) => {
    if (i >= TREE.length || TREE[i] == null) return;
    snap(i, `Go left from ${TREE[i]}.`);
    inorder(2 * i + 1);
    visited.push(i);
    output.push(TREE[i]);
    snap(i, `Visit ${TREE[i]} → output.`);
    inorder(2 * i + 2);
  };
  inorder(0);
  snap(-1, `Done. In-order output: [${output.join(", ")}] — sorted! ✓`);
  return steps;
}

// Layout: assign x by in-order position, y by depth.
function layout() {
  const pos: Record<number, { x: number; y: number }> = {};
  let order = 0;
  const place = (i: number, depth: number) => {
    if (i >= TREE.length || TREE[i] == null) return;
    place(2 * i + 1, depth + 1);
    pos[i] = { x: order++, y: depth };
    place(2 * i + 2, depth + 1);
  };
  place(0, 0);
  return pos;
}
const POS = layout();
const COLS = Object.keys(POS).length;
const W = 520, H = 300, PAD = 40;
const px = (x: number) => PAD + (x / (COLS - 1)) * (W - 2 * PAD);
const py = (y: number) => PAD + y * 90;

const CODE = `function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);   // visit between subtrees
  inorder(node.right, out);
  return out;
}
// pre-order: visit before  ·  post-order: visit after`;

export const treeTraversal: Topic = {
  id: "tree-traversal",
  title: "Tree Traversal (DFS)",
  category: "Trees & Graphs",
  blurb: "In-order depth-first walk of a binary tree.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Depth-first traversal recurses down each branch before backtracking. In-order (Left·Node·Right) visits a binary search tree in sorted order. Swap where you 'visit' to get pre-order or post-order.\n\nTime: O(n) · Space: O(h) for the call stack (h = height)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <svg width={W} height={H} style={{ overflow: "visible" }}>
            {Object.keys(POS).map((k) => {
              const i = Number(k);
              return [2 * i + 1, 2 * i + 2].map((c) =>
                POS[c] ? (
                  <line
                    key={`${i}-${c}`}
                    x1={px(POS[i].x)} y1={py(POS[i].y)}
                    x2={px(POS[c].x)} y2={py(POS[c].y)}
                    stroke={C.surfaceBorder} strokeWidth={2}
                  />
                ) : null,
              );
            })}
            {Object.keys(POS).map((k) => {
              const i = Number(k);
              const isCur = i === s.current;
              const done = s.visited.includes(i);
              const fill = isCur ? C.active : done ? C.highlight : C.default;
              return (
                <g key={i} style={{ transition: "all 200ms" }}>
                  <circle cx={px(POS[i].x)} cy={py(POS[i].y)} r={26} fill={fill} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={px(POS[i].x)} y={py(POS[i].y) + 6} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={20} fill={isCur || done ? "#0e1424" : C.text}>
                    {TREE[i]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ fontFamily: FONT_MONO, color: C.textMuted, fontSize: 16 }}>
            output: <span style={{ color: C.sorted }}>[{s.output.join(", ")}]</span>
          </div>
        </div>
      ),
    }),
};

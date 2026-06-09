import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const TREE = [8, 3, 10, 1, 6, 9, 14];

interface Step extends StepBase {
  order: "pre" | "in" | "post";
  current: number;
  output: number[];
  phase: string;
}

function walk(order: "pre" | "in" | "post") {
  const steps: Step[] = [];
  const output: number[] = [];
  const snap = (current: number, caption: string) => steps.push({ order, current, output: [...output], phase: order.toUpperCase(), caption });

  const dfs = (i: number) => {
    if (i >= TREE.length || TREE[i] == null) return;
    if (order === "pre") { output.push(TREE[i]); snap(i, `Visit ${TREE[i]} (pre-order: node first).`); }
    dfs(2 * i + 1);
    if (order === "in") { output.push(TREE[i]); snap(i, `Visit ${TREE[i]} (in-order: between children).`); }
    dfs(2 * i + 2);
    if (order === "post") { output.push(TREE[i]); snap(i, `Visit ${TREE[i]} (post-order: node last).`); }
  };
  snap(-1, `${order}-order DFS on the same tree.`);
  dfs(0);
  snap(-1, `Done: [${output.join(", ")}]${order === "in" ? " — sorted for BST!" : ""} ✓`);
  return steps;
}

const CODE = `function preorder(node)  { visit(node); preorder(node.left); preorder(node.right); }
function inorder(node)    { inorder(node.left); visit(node); inorder(node.right); }
function postorder(node)  { postorder(node.left); postorder(node.right); visit(node); }`;

export const treeTraversalOrders: Topic = {
  id: "tree-traversal-orders",
  title: "Pre/In/Post-order Traversal",
  category: "Tree Algorithms",
  blurb: "Three DFS visit orders on the same tree.",
  prerequisites: ["tree-traversal", "bst"],
  create: () => {
    const steps = [...walk("pre"), ...walk("in"), ...walk("post")];
    return defineViz<Step>({
      steps, code: CODE,
      explanation: "The only difference in DFS tree walks is when you 'visit' the node. Pre: before children (copy tree). In: between (BST sorted order). Post: after children (delete tree, postfix eval).\n\nAll O(n) time.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.active, fontWeight: 700, letterSpacing: 1 }}>{s.order}-ORDER</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {TREE.map((v, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: i === s.current ? C.active : s.output.includes(v) && TREE.indexOf(v) <= i ? C.highlight : C.default, fontFamily: FONT_MONO, fontWeight: 700, color: i === s.current ? C.ink : C.text }}>{v}</div>
            ))}
          </div>
          <div style={{ fontFamily: FONT_MONO, color: C.textMuted }}>output: <span style={{ color: C.sorted }}>[{s.output.join(", ")}]</span></div>
        </div>
      ),
    });
  },
};

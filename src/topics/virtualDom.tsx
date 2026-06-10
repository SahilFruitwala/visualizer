import { PatchChip, TreeNode } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

type NodeState = "default" | "active" | "changed" | "removed" | "added" | "matched";

interface Step extends StepBase {
  phase: "old" | "new" | "diff" | "patch";
  focus?: "root" | "list" | "item" | "count";
  oldStates: Record<string, NodeState>;
  newStates: Record<string, NodeState>;
  patch?: { op: "update" | "insert" | "remove" | "replace"; target: string; detail?: string };
}

function build(): Step[] {
  return [
    {
      phase: "old",
      focus: "root",
      oldStates: { App: "active", Header: "default", List: "default", Item: "default", count: "default" },
      newStates: { App: "default", Header: "default", List: "default", Item: "default", count: "default" },
      chapter: "Previous tree",
      caption: "Previous render: <App> with <Header> and <List> of 3 <Item>s (count=3).",
    },
    {
      phase: "new",
      focus: "count",
      oldStates: { App: "default", Header: "default", List: "default", Item: "default", count: "default" },
      newStates: { App: "active", Header: "default", List: "changed", Item: "default", count: "changed" },
      chapter: "New tree",
      caption: "State update: count 3 → 5. React builds a new virtual tree (cheap JS objects).",
    },
    {
      phase: "diff",
      focus: "root",
      oldStates: { App: "matched", Header: "matched", List: "changed", Item: "default", count: "changed" },
      newStates: { App: "matched", Header: "matched", List: "changed", Item: "default", count: "changed" },
      caption: "Diff at root: same type <App> → reuse instance, recurse into children.",
    },
    {
      phase: "diff",
      focus: "list",
      oldStates: { App: "matched", Header: "matched", List: "changed", Item: "default", count: "changed" },
      newStates: { App: "matched", Header: "matched", List: "changed", Item: "default", count: "changed" },
      caption: "<Header> unchanged (props equal) → skip subtree. <List> props changed → update.",
    },
    {
      phase: "diff",
      focus: "item",
      oldStates: { App: "matched", Header: "matched", List: "matched", Item: "added", count: "default" },
      newStates: { App: "matched", Header: "matched", List: "matched", Item: "added", count: "default" },
      chapter: "Reconcile children",
      caption: "List children: keys match for items 1–3; items 4–5 are new → insert nodes.",
    },
    {
      phase: "patch",
      focus: "list",
      oldStates: { App: "matched", Header: "matched", List: "changed", Item: "added", count: "changed" },
      newStates: { App: "matched", Header: "matched", List: "changed", Item: "added", count: "changed" },
      patch: { op: "update", target: "<List>", detail: "count: 3 → 5" },
      caption: "Patch 1: update List props in the real DOM (no full page rebuild).",
    },
    {
      phase: "patch",
      focus: "item",
      oldStates: { App: "matched", Header: "matched", List: "matched", Item: "added", count: "default" },
      newStates: { App: "matched", Header: "matched", List: "matched", Item: "added", count: "default" },
      patch: { op: "insert", target: "<Item key=4>", detail: "+ <Item key=5>" },
      caption: "Patch 2: insert two new Item DOM nodes. Existing items reused via keys.",
    },
    {
      phase: "patch",
      focus: "root",
      oldStates: { App: "matched", Header: "matched", List: "matched", Item: "default", count: "default" },
      newStates: { App: "matched", Header: "matched", List: "matched", Item: "default", count: "default" },
      caption: "Minimal DOM writes applied. Header subtree never touched. ✓",
      insight: "Keys let React match list items across renders instead of re-creating all nodes.",
    },
  ];
}

function renderTree(states: Record<string, NodeState>, side: "old" | "new", focus?: string) {
  const s = (id: string): NodeState => {
    const st = states[id] ?? "default";
    if (focus === id && st === "default") return "active";
    return st;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: side === "old" ? C.textMuted : C.pointer,
          fontWeight: 700,
        }}
      >
        {side === "old" ? "Previous VDOM" : "New VDOM"}
      </div>
      <TreeNode label="App" state={s("App")} compact>
        <TreeNode label="Header" state={s("Header")} compact />
        <TreeNode label="List" state={s("List")} compact>
          <TreeNode label="Item" state={s("Item")} compact />
          <TreeNode label="Item" state={s("Item")} compact />
          <TreeNode label="Item" state={s("Item")} compact />
          {side === "new" && (states.Item === "added" || states.count === "changed") && (
            <>
              <TreeNode label="Item" state="added" compact />
              <TreeNode label="Item" state="added" compact />
            </>
          )}
        </TreeNode>
      </TreeNode>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>
        count: <span style={{ color: states.count === "changed" ? C.compare : C.text }}>{side === "old" ? 3 : 5}</span>
      </div>
    </div>
  );
}

const CODE = `// React reconciliation (simplified)
function reconcile(oldVNode, newVNode) {
  if (oldVNode.type !== newVNode.type) {
    replaceDOM(oldVNode, newVNode);
    return;
  }
  updateProps(oldVNode.dom, newVNode.props);
  reconcileChildren(oldVNode, newVNode); // uses keys for lists
}

// Keys: <Item key={id} /> lets React match rows across renders
// instead of destroying and recreating every <Item>.`;

export const virtualDom: Topic = {
  id: "virtual-dom",
  title: "Virtual DOM Reconciliation",
  category: "Rendering",
  blurb: "Diff two trees and apply minimal DOM patches.",
  useWhen: "Understanding React re-renders, keys, or why the DOM isn't rebuilt every time.",
  badges: ["diff + patch"],
  prerequisites: ["tree-traversal"],
  quiz: [
    {
      question: "Why use keys on list items?",
      options: ["Faster CSS", "Match items across renders", "Smaller bundle", "Skip hydration"],
      correctIndex: 1,
      explanation: "Keys let the reconciler identify which items moved, were added, or removed instead of re-creating every node.",
    },
    {
      question: "If two nodes have different types (div → span), React will…",
      options: ["Update props only", "Replace the subtree", "Skip the branch", "Re-run layout only"],
      correctIndex: 1,
      explanation: "Different element types cannot be updated in place — the old DOM node is replaced.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Libraries like React keep a lightweight virtual tree in memory. On each render they build a new tree, diff it against the previous one, and apply the smallest set of DOM mutations (patches). Same component type at the same position → update props and recurse. Different type → replace. Lists use keys to match children across renders.\n\nThis is why re-renders are cheap in JS but DOM writes stay minimal — and why missing keys cause bugs in dynamic lists.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {(s.phase === "old" || s.phase === "new") && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {s.phase === "old" && renderTree(s.oldStates, "old", s.focus)}
              {s.phase === "new" && renderTree(s.newStates, "new", s.focus)}
            </div>
          )}
          {s.phase === "diff" && (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", maxWidth: "100%" }}>
              {renderTree(s.oldStates, "old", s.focus)}
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: C.active, alignSelf: "center" }}>⇄</div>
              {renderTree(s.newStates, "new", s.focus)}
            </div>
          )}
          {s.phase === "patch" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {s.patch && <PatchChip op={s.patch.op} target={s.patch.target} detail={s.patch.detail} />}
              {renderTree(s.newStates, "new", s.focus)}
            </div>
          )}
        </div>
      ),
    }),
};

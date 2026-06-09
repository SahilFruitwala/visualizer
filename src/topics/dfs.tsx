import { defineViz, type StepBase, type Topic } from "../engine/types";
import { ADJ, NODES } from "./graphData";
import { GraphView, type NodeState } from "../components/GraphView";

interface Step extends StepBase {
  state: Record<string, NodeState>;
  stack: string[];
  output: string[];
}

function build(start: string) {
  const steps: Step[] = [];
  const state: Record<string, NodeState> = Object.fromEntries(NODES.map((n) => [n, "default"]));
  const seen = new Set<string>();
  const output: string[] = [];
  const callStack: string[] = [];
  const snap = (caption: string) =>
    steps.push({ state: { ...state }, stack: [...callStack], output: [...output], caption });

  snap("DFS dives as deep as possible before backtracking (recursion = a stack).");

  const dfs = (node: string) => {
    seen.add(node);
    callStack.push(node);
    state[node] = "current";
    output.push(node);
    snap(`Visit ${node}, then recurse into its neighbours.`);
    for (const nb of ADJ[node]) {
      if (!seen.has(nb)) {
        state[node] = "frontier";
        snap(`Go deeper from ${node} → ${nb}.`);
        dfs(nb);
        snap(`Backtrack to ${node}.`);
      }
    }
    state[node] = "visited";
    callStack.pop();
    snap(`${node} done — pop from the stack. ✓`);
  };
  dfs(start);
  snap(`DFS order from ${start}: ${output.join(" → ")} ✓`);
  return steps;
}

const CODE = `function dfs(node, adj, seen = new Set(), order = []) {
  seen.add(node);
  order.push(node);
  for (const nb of adj[node])
    if (!seen.has(nb)) dfs(nb, adj, seen, order); // recurse
  return order;
}`;

export const dfs: Topic = {
  id: "dfs",
  title: "Depth-First Search",
  category: "Trees & Graphs",
  blurb: "Dive deep, then backtrack — uses a stack.",
  create: () =>
    defineViz<Step>({
      steps: build("A"),
      code: CODE,
      explanation:
        "DFS follows one path as far as it can, then backtracks to try alternatives. The recursion call stack (shown) is the implicit stack. Used for cycle detection, topological sort, and maze solving.\n\nTime: O(V + E) · Space: O(V)",
      renderStep: (s) => <GraphView state={s.state} structLabel="call stack" struct={s.stack} output={s.output} />,
    }),
};

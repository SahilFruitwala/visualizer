import { defineViz, type StepBase, type Topic } from "../engine/types";
import { DAG_EDGES, DAG_NODES, DAG_POS } from "./weightedGraph";
import { WeightedGraphView, type NState } from "../components/WeightedGraphView";

interface Step extends StepBase {
  nodeState: Record<string, NState>;
  indeg: Record<string, number>;
  order: string[];
  queue: string[];
}

function build() {
  const adj: Record<string, string[]> = Object.fromEntries(DAG_NODES.map((n) => [n, []]));
  const indeg: Record<string, number> = Object.fromEntries(DAG_NODES.map((n) => [n, 0]));
  for (const [u, v] of DAG_EDGES) { adj[u].push(v); indeg[v]++; }

  const order: string[] = [];
  const queue: string[] = DAG_NODES.filter((n) => indeg[n] === 0);
  const steps: Step[] = [];
  const nstate = (cur?: string): Record<string, NState> =>
    Object.fromEntries(DAG_NODES.map((n) => [n, order.includes(n) ? "done" : n === cur ? "current" : queue.includes(n) ? "frontier" : "default"])) as Record<string, NState>;
  const snap = (caption: string, cur?: string) =>
    steps.push({ nodeState: nstate(cur), indeg: { ...indeg }, order: [...order], queue: [...queue], caption });

  snap("Kahn's algorithm: start with all nodes that have no prerequisites (in-degree 0).");
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    snap(`Output ${u} (no remaining prerequisites).`, u);
    for (const v of adj[u]) {
      indeg[v]--;
      if (indeg[v] === 0) queue.push(v);
    }
    snap(`Remove ${u}'s edges; newly free nodes join the queue.`, u);
  }
  if (order.length === DAG_NODES.length) {
    snap(`Valid order: ${order.join(" → ")} ✓`);
  } else {
    snap(`Cycle detected — only ${order.length}/${DAG_NODES.length} nodes ordered. ✗`);
  }
  return steps;
}

const CODE = `function topoSort(nodes, edges) {
  const indeg = {}, adj = {};
  // ...build adj and in-degrees...
  const queue = nodes.filter(n => indeg[n] === 0);
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) queue.push(v);
  }
  return order; // empty-of-cycle => length === nodes.length
}`;

export const topologicalSort: Topic = {
  id: "topological-sort",
  title: "Topological Sort",
  category: "Trees & Graphs",
  blurb: "Order a DAG so every edge points forward.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A topological sort orders the nodes of a directed acyclic graph so each task comes before everything that depends on it (like getting dressed: shirt before tie before jacket). Kahn's algorithm repeatedly emits any node with no remaining prerequisites.\n\nTime: O(V + E)",
      renderStep: (s) => (
        <WeightedGraphView
          nodes={DAG_NODES}
          pos={DAG_POS}
          edges={DAG_EDGES.map(([u, v]) => ({ u, v }))}
          nodeState={s.nodeState}
          directed
          legend={`order: ${s.order.join(" → ") || "—"}`}
        />
      ),
    }),
};

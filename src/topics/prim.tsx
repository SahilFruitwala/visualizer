import { defineViz, type StepBase, type Topic } from "../engine/types";
import { adjacency, WEDGES, WNODES, WPOS } from "./weightedGraph";
import { WeightedGraphView, type EState, type NState } from "../components/WeightedGraphView";

interface Step extends StepBase {
  edgeState: Record<string, EState>;
  nodeState: Record<string, NState>;
  total: number;
}

function build(start: string) {
  const adj = adjacency();
  const inTree = new Set<string>([start]);
  const edgeState: Record<string, EState> = {};
  const steps: Step[] = [];
  let total = 0;
  const nstate = (cur?: string): Record<string, NState> =>
    Object.fromEntries(WNODES.map((n) => [n, inTree.has(n) ? "done" : n === cur ? "current" : "default"])) as Record<string, NState>;
  const snap = (caption: string, cur?: string) =>
    steps.push({ edgeState: { ...edgeState }, nodeState: nstate(cur), total, caption });

  snap(`Prim grows one tree from ${start}, always adding the cheapest edge to a new node.`);
  while (inTree.size < WNODES.length) {
    // find cheapest edge from tree to outside
    let best: { u: string; v: string; w: number } | null = null;
    for (const u of inTree) for (const { to, w } of adj[u]) {
      if (!inTree.has(to) && (best === null || w < best.w)) best = { u, v: to, w };
    }
    if (!best) break;
    const key = `${best.u}-${best.v}`;
    edgeState[key] = "candidate";
    snap(`Cheapest edge leaving the tree: ${best.u}–${best.v} (weight ${best.w}).`, best.v);
    edgeState[key] = "chosen";
    inTree.add(best.v);
    total += best.w;
    snap(`Add ${best.v}. MST weight = ${total}.`);
  }
  snap(`Minimum spanning tree complete. Total weight = ${total}. ✓`);
  return steps;
}

const CODE = `function prim(start, adj) {
  const inTree = new Set([start]);
  const mst = [];
  while (inTree.size < numNodes) {
    let best = null; // cheapest edge from tree to a new node
    for (const u of inTree)
      for (const {to, w} of adj[u])
        if (!inTree.has(to) && (!best || w < best.w)) best = {u, to, w};
    inTree.add(best.to); mst.push(best);
  }
  return mst;
}`;

export const prim: Topic = {
  id: "prim",
  title: "Prim's MST",
  category: "Graph Algorithms",
  blurb: "Grow a spanning tree by cheapest frontier edge.",
  create: () =>
    defineViz<Step>({
      steps: build("A"),
      code: CODE,
      explanation:
        "Prim's algorithm builds a minimum spanning tree by starting from one node and repeatedly adding the cheapest edge that connects the current tree to a node outside it (a priority queue makes this fast).\n\nTime: O(E log V) with a heap · contrast with Kruskal (sorts all edges)",
      renderStep: (s) => (
        <WeightedGraphView
          nodes={WNODES}
          pos={WPOS}
          edges={WEDGES}
          nodeState={s.nodeState}
          edgeState={s.edgeState}
          legend={`MST weight so far: ${s.total}`}
        />
      ),
    }),
};

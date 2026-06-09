import { defineViz, type StepBase, type Topic } from "../engine/types";
import { WEDGES, WNODES, WPOS } from "./weightedGraph";
import { WeightedGraphView, type EState, type NState } from "../components/WeightedGraphView";

interface Step extends StepBase {
  edgeState: Record<string, EState>;
  nodeState: Record<string, NState>;
  total: number;
}

function build() {
  const sorted = [...WEDGES].sort((a, b) => a.w - b.w);
  const parent: Record<string, string> = Object.fromEntries(WNODES.map((n) => [n, n]));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));

  const edgeState: Record<string, EState> = {};
  const inTree = new Set<string>();
  const steps: Step[] = [];
  let total = 0;
  const nstate = (): Record<string, NState> =>
    Object.fromEntries(WNODES.map((n) => [n, inTree.has(n) ? "done" : "default"])) as Record<string, NState>;
  const snap = (caption: string) => steps.push({ edgeState: { ...edgeState }, nodeState: nstate(), total, caption });

  snap("Kruskal: consider edges from lightest to heaviest; keep one if it joins two trees.");
  for (const e of sorted) {
    const key = `${e.u}-${e.v}`;
    edgeState[key] = "candidate";
    snap(`Consider edge ${e.u}–${e.v} (weight ${e.w}).`);
    if (find(e.u) !== find(e.v)) {
      parent[find(e.u)] = find(e.v);
      edgeState[key] = "chosen";
      inTree.add(e.u); inTree.add(e.v);
      total += e.w;
      snap(`Different components → add it. MST weight = ${total}.`);
    } else {
      edgeState[key] = "rejected";
      snap(`Same component → would form a cycle, skip.`);
    }
  }
  snap(`Minimum spanning tree complete. Total weight = ${total}. ✓`);
  return steps;
}

const CODE = `function kruskal(nodes, edges) {
  edges.sort((a, b) => a.w - b.w);
  const dsu = new DSU(nodes);
  const mst = [];
  for (const e of edges)
    if (dsu.find(e.u) !== dsu.find(e.v)) { dsu.union(e.u, e.v); mst.push(e); }
  return mst;
}`;

export const kruskal: Topic = {
  id: "kruskal",
  title: "Kruskal's MST",
  category: "Graph Algorithms",
  blurb: "Greedily add the lightest non-cycle edge.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Kruskal's algorithm builds a minimum spanning tree by sorting edges by weight and adding each one unless it would create a cycle (detected with Union-Find). Green edges are in the tree; dark-red were rejected.\n\nTime: O(E log E) · uses Union-Find for cycle checks",
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

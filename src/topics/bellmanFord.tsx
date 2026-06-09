import { defineViz, type StepBase, type Topic } from "../engine/types";
import { BF_EDGES, BF_NODES, BF_POS } from "./weightedGraph";
import { WeightedGraphView, type EState, type NState } from "../components/WeightedGraphView";

interface Step extends StepBase {
  dist: Record<string, number>;
  edgeState: Record<string, EState>;
  nodeState: Record<string, NState>;
}

const INF = Infinity;

function build(start: string) {
  const dist: Record<string, number> = Object.fromEntries(BF_NODES.map((n) => [n, INF]));
  dist[start] = 0;
  const steps: Step[] = [];
  const nstate = (): Record<string, NState> =>
    Object.fromEntries(BF_NODES.map((n) => [n, dist[n] < INF ? "done" : "default"])) as Record<string, NState>;
  const snap = (edgeState: Record<string, EState>, caption: string) =>
    steps.push({ dist: { ...dist }, edgeState, nodeState: nstate(), caption });

  snap({}, `Bellman-Ford from ${start}. Relax every edge V−1 times (handles negative weights).`);
  for (let pass = 1; pass < BF_NODES.length; pass++) {
    snap({}, `Pass ${pass} of ${BF_NODES.length - 1}: scan all edges.`);
    for (const { u, v, w } of BF_EDGES) {
      const key = `${u}-${v}`;
      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        snap({ [key]: "chosen" }, `Relax ${u}→${v} (w ${w}): improve ${v} to ${dist[v]}.`);
      } else {
        snap({ [key]: "candidate" }, `Edge ${u}→${v}: no improvement.`);
      }
    }
  }
  snap({}, `Pass ${BF_NODES.length}: one more scan to detect negative cycles.`);
  let hasNegativeCycle = false;
  for (const { u, v, w } of BF_EDGES) {
    const key = `${u}-${v}`;
    if (dist[u] !== INF && dist[u] + w < dist[v]) {
      hasNegativeCycle = true;
      snap({ [key]: "chosen" }, `Relax ${u}→${v}: still improves ${v} → negative cycle!`);
    } else {
      snap({ [key]: "candidate" }, `Edge ${u}→${v}: no further improvement.`);
    }
  }
  snap(
    {},
    hasNegativeCycle
      ? "Negative cycle detected — shortest paths are undefined. ✗"
      : `Shortest distances from ${start} finalized (no negative cycle). ✓`,
  );
  return steps;
}

const CODE = `function bellmanFord(start, nodes, edges) {
  const dist = {}; for (const n of nodes) dist[n] = Infinity;
  dist[start] = 0;
  for (let i = 1; i < nodes.length; i++)
    for (const {u, v, w} of edges)
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w; // relax
  // one more pass detects negative cycles
  return dist;
}`;

export const bellmanFord: Topic = {
  id: "bellman-ford",
  title: "Bellman-Ford",
  category: "Trees & Graphs",
  blurb: "Shortest paths that tolerate negative edges.",
  create: () =>
    defineViz<Step>({
      steps: build("S"),
      code: CODE,
      explanation:
        "Bellman-Ford relaxes every edge V−1 times. Because the longest shortest-path uses at most V−1 edges, this guarantees correctness even with negative weights — and a V-th pass that still improves something reveals a negative cycle.\n\nTime: O(V·E) · Space: O(V)",
      renderStep: (s) => (
        <WeightedGraphView
          nodes={BF_NODES}
          pos={BF_POS}
          edges={BF_EDGES}
          nodeState={s.nodeState}
          edgeState={s.edgeState}
          directed
          nodeLabel={(n) => (s.dist[n] === INF ? "∞" : s.dist[n])}
        />
      ),
    }),
};

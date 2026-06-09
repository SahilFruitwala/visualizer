import { defineViz, type StepBase, type Topic } from "../engine/types";
import { adjacency, WEDGES, WNODES, WPOS } from "./weightedGraph";
import { WeightedGraphView, type NState } from "../components/WeightedGraphView";

interface Step extends StepBase {
  dist: Record<string, number>;
  nodeState: Record<string, NState>;
}

const INF = Infinity;

function build(start: string) {
  const adj = adjacency();
  const dist: Record<string, number> = Object.fromEntries(WNODES.map((n) => [n, INF]));
  const done: Record<string, boolean> = {};
  dist[start] = 0;
  const steps: Step[] = [];
  const stateOf = (current?: string): Record<string, NState> =>
    Object.fromEntries(WNODES.map((n) => [n, done[n] ? "done" : n === current ? "current" : dist[n] < INF ? "frontier" : "default"])) as Record<string, NState>;
  const snap = (caption: string, current?: string) => steps.push({ dist: { ...dist }, nodeState: stateOf(current), caption });

  snap(`Dijkstra from ${start}. Distance to ${start} = 0, all others ∞.`);
  for (let it = 0; it < WNODES.length; it++) {
    // pick unvisited node with smallest dist
    let u: string | null = null;
    for (const n of WNODES) if (!done[n] && (u === null || dist[n] < dist[u])) u = n;
    if (u === null || dist[u] === INF) break;
    snap(`Pick nearest unvisited node: ${u} (dist ${dist[u]}).`, u);
    for (const { to, w } of adj[u]) {
      if (done[to]) continue;
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        snap(`Relax edge ${u}→${to}: improve ${to} to ${dist[to]}.`, u);
      }
    }
    done[u] = true;
    snap(`${u} finalized — shortest distance locked. ✓`, u);
  }
  snap(`Done. Shortest distances from ${start} computed. ✓`);
  return steps;
}

const CODE = `function dijkstra(start, adj) {
  const dist = {}; for (const n in adj) dist[n] = Infinity;
  dist[start] = 0;
  const pq = new MinHeap([[0, start]]);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;
    for (const {to, w} of adj[u])
      if (d + w < dist[to]) { dist[to] = d + w; pq.push([dist[to], to]); }
  }
  return dist;
}`;

export const dijkstra: Topic = {
  id: "dijkstra",
  title: "Dijkstra's Shortest Path",
  category: "Graph Algorithms",
  blurb: "Greedy shortest paths on a weighted graph.",
  create: () =>
    defineViz<Step>({
      steps: build("A"),
      code: CODE,
      explanation:
        "Dijkstra repeatedly picks the unvisited node with the smallest known distance, finalizes it, and relaxes its edges (updating neighbours if a shorter path is found). Works for non-negative weights.\n\nBlue = tentative · amber = processing · purple = finalized\nTime: O((V + E) log V) with a heap",
      renderStep: (s) => (
        <WeightedGraphView
          nodes={WNODES}
          pos={WPOS}
          edges={WEDGES}
          nodeState={s.nodeState}
          nodeLabel={(n) => (s.dist[n] === INF ? "∞" : s.dist[n])}
        />
      ),
    }),
};

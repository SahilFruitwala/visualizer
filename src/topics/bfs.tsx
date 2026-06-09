import { defineViz, type StepBase, type Topic } from "../engine/types";
import { ADJ, NODES } from "./graphData";
import { GraphView, type NodeState } from "../components/GraphView";

interface Step extends StepBase {
  state: Record<string, NodeState>;
  queue: string[];
  output: string[];
}

function build(start: string) {
  const steps: Step[] = [];
  const state: Record<string, NodeState> = Object.fromEntries(NODES.map((n) => [n, "default"]));
  const queue: string[] = [];
  const output: string[] = [];
  const seen = new Set<string>();
  const snap = (caption: string) =>
    steps.push({ state: { ...state }, queue: [...queue], output: [...output], caption });

  snap("BFS explores level by level using a queue (FIFO).");
  queue.push(start);
  seen.add(start);
  state[start] = "frontier";
  snap(`Enqueue start node ${start}.`);

  while (queue.length) {
    const node = queue.shift()!;
    state[node] = "current";
    snap(`Dequeue ${node} and process it.`);
    for (const nb of ADJ[node]) {
      if (!seen.has(nb)) {
        seen.add(nb);
        queue.push(nb);
        state[nb] = "frontier";
        snap(`Neighbour ${nb} unseen → enqueue.`);
      }
    }
    state[node] = "visited";
    output.push(node);
    snap(`${node} fully processed. ✓`);
  }
  snap(`BFS order from ${start}: ${output.join(" → ")} ✓`);
  return steps;
}

const CODE = `function bfs(start, adj) {
  const seen = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();   // FIFO
    order.push(node);
    for (const nb of adj[node])
      if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
  }
  return order;
}`;

export const bfs: Topic = {
  id: "bfs",
  title: "Breadth-First Search",
  category: "Trees & Graphs",
  blurb: "Explore neighbours level by level with a queue.",
  create: () =>
    defineViz<Step>({
      steps: build("A"),
      code: CODE,
      explanation:
        "BFS uses a queue to visit all nodes at distance 1, then distance 2, and so on. This makes it find shortest paths in unweighted graphs.\n\nBlue = in queue · amber = processing · purple = done\nTime: O(V + E) · Space: O(V)",
      renderStep: (s) => <GraphView state={s.state} structLabel="queue" struct={s.queue} output={s.output} />,
    }),
};

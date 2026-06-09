import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
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
  const snap = (caption: string, extra?: Partial<Step>) =>
    steps.push({ state: { ...state }, queue: [...queue], output: [...output], caption, ...extra });

  snap("BFS explores level by level using a queue (FIFO).", {
    chapter: "Introduction",
    insight: "Blue nodes are waiting in the queue; amber is being processed.",
  });
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
  return withCodeLines(steps, (s, i) => {
    if (i === 0) return [0, 1, 2];
    if (s.caption.includes("Enqueue start")) return [3, 4, 5];
    if (s.caption.includes("Dequeue")) return [6, 7];
    if (s.caption.includes("enqueue")) return [8, 9, 10];
    if (s.caption.includes("fully processed")) return [7];
    return [5, 6];
  });
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
  category: "Graph Algorithms",
  blurb: "Explore neighbours level by level with a queue.",
  useWhen: "Shortest path in an unweighted graph or level-order traversal.",
  badges: ["O(V + E)"],
  prerequisites: ["queue"],
  quiz: [
    {
      question: "What data structure does BFS use?",
      options: ["Stack", "Queue", "Heap", "Hash table"],
      correctIndex: 1,
      explanation: "BFS is FIFO — first discovered nodes are processed first.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build("A"),
      code: CODE,
      explanation:
        "BFS uses a queue to visit all nodes at distance 1, then distance 2, and so on. This makes it find shortest paths in unweighted graphs.\n\nBlue = in queue · amber = processing · purple = done\nTime: O(V + E) · Space: O(V)",
      renderStep: (s) => <GraphView state={s.state} structLabel="queue" struct={s.queue} output={s.output} />,
    }),
};

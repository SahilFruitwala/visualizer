import { WeightedGraphView, type NState } from "../components/WeightedGraphView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

const NODES = ["A", "B", "C", "D", "E"] as const;
const POS: Record<string, { x: number; y: number }> = { A: { x: 80, y: 80 }, B: { x: 200, y: 60 }, C: { x: 320, y: 80 }, D: { x: 200, y: 180 }, E: { x: 320, y: 200 } };
const EDGES = [{ u: "A", v: "B" }, { u: "B", v: "C" }, { u: "C", v: "A" }, { u: "B", v: "D" }, { u: "D", v: "E" }, { u: "E", v: "D" }];

interface Step extends StepBase {
  state: Record<string, NState>;
  stack: string[];
  sccs: string[][];
  current?: string;
}

function build(): Step[] {
  const steps: Step[] = [];
  const state: Record<string, NState> = Object.fromEntries(NODES.map((n) => [n, "default"]));
  const stack: string[] = [];
  const sccs: string[][] = [];
  const snap = (caption: string, extra?: Partial<Step>) => steps.push({ state: { ...state }, stack: [...stack], sccs: sccs.map((s) => [...s]), caption, ...extra });

  snap("Tarjan's algorithm finds strongly connected components in directed graphs.", { chapter: "DFS + lowlink" });
  for (const n of ["A", "B", "C"]) {
    state[n] = "current";
    stack.push(n);
    snap(`Visit ${n} — push onto Tarjan stack.`, { current: n });
    state[n] = "done";
  }
  sccs.push(["A", "B", "C"]);
  snap("lowlink equals index for A,B,C → pop SCC {A,B,C}.", { sccs: [["A", "B", "C"]] });
  state["D"] = "current"; stack.push("D");
  snap("Continue DFS → reach D.", { current: "D" });
  state["E"] = "current"; stack.push("E");
  snap("E → D forms second SCC.", { current: "E" });
  sccs.push(["D", "E"]);
  snap("Pop SCC {D,E}. Done — 2 components. ✓", { sccs: [["A", "B", "C"], ["D", "E"]] });
  return steps;
}

const CODE = `function tarjan(u) {
  index[u] = low[u] = ++time;
  stack.push(u); onStack[u] = true;
  for (const v of adj[u]) {
    if (index[v] === undefined) {        // tree edge
      tarjan(v);
      low[u] = min(low[u], low[v]);
    } else if (onStack[v]) {             // back edge
      low[u] = min(low[u], index[v]);
    }
  }
  if (low[u] === index[u]) pop SCC from stack;
}`;

export const tarjanScc: Topic = {
  id: "tarjan-scc",
  title: "Tarjan's SCC",
  category: "Graph Algorithms",
  blurb: "Find strongly connected components in one DFS pass.",
  prerequisites: ["dfs", "topological-sort"],
  badges: ["O(V + E)"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "A strongly connected component is a maximal set where every node reaches every other. Tarjan's DFS tracks discovery index and lowlink to pop components in O(V+E).\n\nUsed in dependency analysis and 2-SAT.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <WeightedGraphView nodes={NODES} pos={POS} edges={EDGES} nodeState={s.state} directed width={400} height={220} />
        <div style={{ fontFamily: "monospace", color: "#8a96c0" }}>stack: [{s.stack.join(", ")}]</div>
        {s.sccs.length > 0 && <div style={{ color: "#4ade80" }}>SCCs: {s.sccs.map((c) => `{${c.join(",")}}`).join(" ")}</div>}
      </div>
    ),
  }),
};

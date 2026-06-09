// Weighted graphs reused by Dijkstra, MST (Kruskal/Prim).
export interface WEdge {
  u: string;
  v: string;
  w: number;
}

export const WNODES = ["A", "B", "C", "D", "E", "F"] as const;

export const WPOS: Record<string, { x: number; y: number }> = {
  A: { x: 70, y: 70 },
  B: { x: 250, y: 40 },
  C: { x: 70, y: 220 },
  D: { x: 260, y: 200 },
  E: { x: 430, y: 90 },
  F: { x: 440, y: 240 },
};

export const WEDGES: WEdge[] = [
  { u: "A", v: "B", w: 4 },
  { u: "A", v: "C", w: 3 },
  { u: "B", v: "D", w: 2 },
  { u: "B", v: "E", w: 5 },
  { u: "C", v: "D", w: 6 },
  { u: "D", v: "E", w: 1 },
  { u: "D", v: "F", w: 7 },
  { u: "E", v: "F", w: 3 },
];

export function adjacency(): Record<string, { to: string; w: number }[]> {
  const m: Record<string, { to: string; w: number }[]> = Object.fromEntries(WNODES.map((n) => [n, []]));
  for (const { u, v, w } of WEDGES) {
    m[u].push({ to: v, w });
    m[v].push({ to: u, w });
  }
  return m;
}

// A small directed weighted graph (with a negative edge) for Bellman-Ford.
export const BF_NODES = ["S", "A", "B", "C", "D"] as const;
export const BF_POS: Record<string, { x: number; y: number }> = {
  S: { x: 60, y: 140 },
  A: { x: 220, y: 50 },
  B: { x: 220, y: 230 },
  C: { x: 400, y: 50 },
  D: { x: 400, y: 230 },
};
export const BF_EDGES: WEdge[] = [
  { u: "S", v: "A", w: 4 },
  { u: "S", v: "B", w: 5 },
  { u: "A", v: "C", w: 6 },
  { u: "B", v: "A", w: -3 },
  { u: "B", v: "D", w: 4 },
  { u: "C", v: "D", w: -2 },
];

// A small directed acyclic graph for topological sort.
export const DAG_NODES = ["shirt", "tie", "belt", "jacket", "socks", "shoes"] as const;
export const DAG_POS: Record<string, { x: number; y: number }> = {
  shirt: { x: 60, y: 50 },
  tie: { x: 250, y: 40 },
  belt: { x: 250, y: 150 },
  jacket: { x: 450, y: 95 },
  socks: { x: 60, y: 220 },
  shoes: { x: 280, y: 250 },
};
export const DAG_EDGES: [string, string][] = [
  ["shirt", "tie"],
  ["shirt", "belt"],
  ["tie", "jacket"],
  ["belt", "jacket"],
  ["socks", "shoes"],
  ["belt", "shoes"],
];

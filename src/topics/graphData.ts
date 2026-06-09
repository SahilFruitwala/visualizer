// A small undirected graph reused by the BFS and DFS visualizations.
export const NODES = ["A", "B", "C", "D", "E", "F"] as const;

// Fixed pixel positions for a clean layout.
export const POS: Record<string, { x: number; y: number }> = {
  A: { x: 90, y: 60 },
  B: { x: 250, y: 40 },
  C: { x: 90, y: 200 },
  D: { x: 250, y: 180 },
  E: { x: 410, y: 90 },
  F: { x: 410, y: 240 },
};

export const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "D"],
  ["D", "F"],
  ["E", "F"],
];

export const ADJ: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = Object.fromEntries(NODES.map((n) => [n, []]));
  for (const [a, b] of EDGES) {
    m[a].push(b);
    m[b].push(a);
  }
  for (const n of NODES) m[n].sort();
  return m;
})();

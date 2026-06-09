import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const COLS = 11;
const ROWS = 7;
// . = open, # = wall, S = start, G = goal
const MAP = [
  "S.....#....",
  ".####.#.##.",
  ".#....#.#..",
  ".#.##.#.#.#",
  ".#.#..#.#..",
  "...#.##.#.G",
  ".###....#..",
];

type P = { r: number; c: number };
const key = (p: P) => `${p.r},${p.c}`;

interface Step extends StepBase {
  open: string[];
  closed: string[];
  current: string | null;
  path: string[];
}

function build() {
  let start: P = { r: 0, c: 0 }, goal: P = { r: 0, c: 0 };
  const wall = (r: number, c: number) => MAP[r][c] === "#";
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (MAP[r][c] === "S") start = { r, c };
    if (MAP[r][c] === "G") goal = { r, c };
  }
  const h = (p: P) => Math.abs(p.r - goal.r) + Math.abs(p.c - goal.c);

  const g: Record<string, number> = { [key(start)]: 0 };
  const came: Record<string, string> = {};
  const open = new Set<string>([key(start)]);
  const closed = new Set<string>();
  const steps: Step[] = [];
  const snap = (current: string | null, path: string[], caption: string) =>
    steps.push({ open: [...open], closed: [...closed], current, path, caption });

  snap(null, [], "A* explores cells by lowest f = g (cost so far) + h (estimate to goal).");

  while (open.size) {
    // pick lowest f
    let cur: string | null = null, bestF = Infinity;
    for (const k of open) {
      const [r, c] = k.split(",").map(Number);
      const f = g[k] + h({ r, c });
      if (f < bestF) { bestF = f; cur = k; }
    }
    if (!cur) break;
    open.delete(cur);
    closed.add(cur);
    const [cr, cc] = cur.split(",").map(Number);
    if (cr === goal.r && cc === goal.c) {
      // reconstruct
      const path: string[] = [];
      let k: string | undefined = cur;
      while (k) { path.push(k); k = came[k]; }
      snap(cur, path, `Reached the goal! Path length ${path.length - 1}. ✓`);
      return steps;
    }
    snap(cur, [], `Expand cell (${cr},${cc}) with lowest f = ${bestF}.`);
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || wall(nr, nc)) continue;
      const nk = `${nr},${nc}`;
      if (closed.has(nk)) continue;
      const ng = g[cur] + 1;
      if (ng < (g[nk] ?? Infinity)) {
        g[nk] = ng;
        came[nk] = cur;
        open.add(nk);
      }
    }
  }
  snap(null, [], "No path exists.");
  return steps;
}

const CODE = `function aStar(start, goal) {
  const open = new MinHeap();            // ordered by f = g + h
  open.push(start, h(start));
  while (open.size) {
    const cur = open.pop();
    if (cur === goal) return reconstruct(cur);
    for (const nb of neighbors(cur)) {
      const ng = g[cur] + 1;
      if (ng < g[nb]) { g[nb] = ng; open.push(nb, ng + h(nb)); }
    }
  }
}`;

export const aStar: Topic = {
  id: "a-star",
  title: "A* Pathfinding",
  category: "Trees & Graphs",
  blurb: "Heuristic-guided shortest path on a grid.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A* is Dijkstra plus a heuristic: it prefers cells whose estimated total cost f = g + h is lowest, so it heads toward the goal instead of expanding blindly. With an admissible heuristic (here Manhattan distance) it still finds the shortest path.\n\nBlue = frontier (open) · purple = expanded (closed) · green = final path",
      renderStep: (s) => {
        const size = 38;
        const open = new Set(s.open), closed = new Set(s.closed), path = new Set(s.path);
        return (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, ${size}px)`, gap: 3 }}>
            {Array.from({ length: ROWS * COLS }, (_, idx) => {
              const r = Math.floor(idx / COLS), c = idx % COLS;
              const k = `${r},${c}`;
              const ch = MAP[r][c];
              let bg = C.gridDefault;
              if (ch === "#") bg = "#0a0e1a";
              else if (path.has(k)) bg = C.sorted;
              else if (k === s.current) bg = C.active;
              else if (closed.has(k)) bg = C.highlight;
              else if (open.has(k)) bg = C.pointer;
              const label = ch === "S" ? "S" : ch === "G" ? "G" : "";
              return (
                <div key={idx} style={{ width: size, height: size, borderRadius: 6, background: bg, border: ch === "#" ? "none" : `1px solid ${C.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 14, color: C.ink, transition: "background 140ms" }}>
                  {label}
                </div>
              );
            })}
          </div>
        );
      },
    }),
};

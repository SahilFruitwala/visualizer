import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Grid, type CellMark } from "../components/Grid";
import { C, FONT_MONO } from "../theme";

const N = 4;
const LABELS = ["A", "B", "C", "D"];
const INF = 999;

// Directed edges: from → to, weight
const EDGES: [number, number, number][] = [
  [0, 1, 3],
  [0, 2, 8],
  [1, 2, 2],
  [2, 3, 1],
  [3, 1, 4],
];

interface Step extends StepBase {
  dist: number[][];
  k: number;
  i: number;
  j: number;
  updated: boolean;
}

function initDist(): number[][] {
  const d = Array.from({ length: N }, () => Array(N).fill(INF));
  for (let i = 0; i < N; i++) d[i][i] = 0;
  for (const [u, v, w] of EDGES) d[u][v] = w;
  return d;
}

function build() {
  const dist = initDist();
  const steps: Step[] = [];

  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ dist: dist.map((r) => [...r]), k: -1, i: -1, j: -1, updated: false, ...e });

  snap({
    chapter: "Setup",
    caption: "Floyd-Warshall: all-pairs shortest paths via intermediate nodes 0…n−1.",
    insight: "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for each k.",
  });
  snap({ caption: "Initialize: direct edges, 0 on diagonal, ∞ elsewhere." });

  for (let k = 0; k < N; k++) {
    snap({ k, caption: `Allow ${LABELS[k]} as an intermediate node (k = ${k}).` });
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) {
          const old = dist[i][j];
          dist[i][j] = via;
          snap({
            k,
            i,
            j,
            updated: true,
            caption: `Improve ${LABELS[i]}→${LABELS[j]}: ${old === INF ? "∞" : old} → ${via} via ${LABELS[k]}.`,
          });
        }
      }
    }
    snap({ k, caption: `Finished allowing ${LABELS[k]} as an intermediate node.` });
  }

  snap({ chapter: "Summary", caption: "All-pairs shortest distances computed. ✓" });
  return withCodeLines(steps, (s) => {
    if (s.caption.startsWith("Floyd-Warshall")) return [0, 1, 2];
    if (s.caption.startsWith("Initialize")) return [3, 4];
    if (s.caption.startsWith("Allow")) return [5, 6];
    if (s.updated) return [7, 8, 9, 10];
    if (s.caption.startsWith("Finished using")) return [5, 11];
    return [0];
  });
}

const CODE = `function floydWarshall(dist, n) {
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        dist[i][j] = Math.min(
          dist[i][j],
          dist[i][k] + dist[k][j]  // route through k
        );
  return dist;
}`;

export const floydWarshall: Topic = {
  id: "floyd-warshall",
  title: "Floyd-Warshall",
  category: "Graph Algorithms",
  blurb: "All-pairs shortest paths by trying every intermediate node.",
  useWhen: "You need distances between every pair of nodes (dense graphs, n ≤ 400).",
  badges: ["O(n³)", "handles negative edges"],
  prerequisites: ["dijkstra"],
  quiz: [
    {
      question: "What does the outer loop variable k represent?",
      options: [
        "Source node",
        "Destination node",
        "Allowed intermediate node",
        "Edge weight",
      ],
      correctIndex: 2,
      explanation: "Each k pass allows paths to route through node k as an intermediate stop.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Floyd-Warshall fills a distance matrix by gradually allowing more intermediate nodes. For each k, it checks whether routing through k improves any pair (i, j). Unlike Dijkstra, it handles negative edge weights (but not negative cycles).\n\nTime: O(n³) · Space: O(n²)",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {s.k >= 0 && (
            <div style={{ fontFamily: FONT_MONO, color: C.active, fontWeight: 700 }}>
              intermediate k = {LABELS[s.k]}
            </div>
          )}
          <Grid
            rows={N}
            cols={N}
            size={52}
            rowLabels={(r) => LABELS[r]}
            colLabels={(c) => LABELS[c]}
            cell={(r, c) => {
              const v = s.dist[r][c];
              return v >= INF ? "∞" : v;
            }}
            mark={(r, c): CellMark => {
              if (r === c) return "muted";
              if (s.updated && r === s.i && c === s.j) return "result";
              if (s.k >= 0 && (r === s.k || c === s.k)) return "compare";
              if (s.k >= 0 && r === s.i && c === s.j && !s.updated) return "active";
              return s.dist[r][c] < INF ? "filled" : "default";
            }}
          />
        </div>
      ),
    }),
};

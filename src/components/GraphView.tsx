import { EDGES, NODES, POS } from "../topics/graphData";
import { C, FONT_MONO } from "../theme";

export type NodeState = "default" | "frontier" | "current" | "visited";

const FILL: Record<NodeState, string> = {
  default: C.default,
  frontier: C.pointer, // in the queue/stack, not yet processed
  current: C.active, // being processed now
  visited: C.highlight, // fully processed
};

// Renders the shared graph, coloring each node by its traversal state, plus a
// "data structure" strip (the queue or stack) and the visit order output.
export function GraphView({
  state,
  structLabel,
  struct,
  output,
}: {
  state: Record<string, NodeState>;
  structLabel: string;
  struct: string[];
  output: string[];
}) {
  const W = 500, H = 290;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        {EDGES.map(([a, b]) => (
          <line key={a + b} x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} stroke={C.surfaceBorder} strokeWidth={2} />
        ))}
        {NODES.map((n) => {
          const st = state[n] ?? "default";
          const dark = st === "default";
          return (
            <g key={n}>
              <circle cx={POS[n].x} cy={POS[n].y} r={24} fill={FILL[st]} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 220ms" }} />
              <text x={POS[n].x} y={POS[n].y + 6} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={18} fill={dark ? C.text : "#0e1424"}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 28, fontFamily: FONT_MONO, fontSize: 15 }}>
        <div style={{ color: C.textMuted }}>
          {structLabel}: <span style={{ color: C.pointer }}>[{struct.join(", ")}]</span>
        </div>
        <div style={{ color: C.textMuted }}>
          visited: <span style={{ color: C.highlight }}>[{output.join(", ")}]</span>
        </div>
      </div>
    </div>
  );
}

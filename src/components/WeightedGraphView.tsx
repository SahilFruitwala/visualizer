import type { ReactNode } from "react";
import { C, FONT_MONO } from "../theme";

export type NState = "default" | "frontier" | "current" | "done";
export type EState = "default" | "candidate" | "chosen" | "rejected";

const NFILL: Record<NState, string> = {
  default: C.default,
  frontier: C.pointer,
  current: C.active,
  done: C.highlight,
};
const ECOLOR: Record<EState, string> = {
  default: C.surfaceBorder,
  candidate: C.active,
  chosen: C.sorted,
  rejected: "#5a2230",
};

export function WeightedGraphView({
  nodes,
  pos,
  edges,
  nodeState,
  edgeState,
  nodeLabel,
  directed = false,
  width = 520,
  height = 300,
  legend,
}: {
  nodes: readonly string[];
  pos: Record<string, { x: number; y: number }>;
  edges: { u: string; v: string; w?: number }[];
  nodeState: Record<string, NState>;
  edgeState?: Record<string, EState>;
  nodeLabel?: (n: string) => ReactNode; // e.g. distance under the node
  directed?: boolean;
  width?: number;
  height?: number;
  legend?: ReactNode;
}) {
  const ek = (u: string, v: string) => `${u}-${v}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        {directed && (
          <defs>
            <marker id="wgah" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C.surfaceBorder} />
            </marker>
          </defs>
        )}
        {edges.map(({ u, v, w }) => {
          const st = edgeState?.[ek(u, v)] ?? edgeState?.[ek(v, u)] ?? "default";
          const a = pos[u], b = pos[v];
          // shorten for arrowhead / node radius
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          const x2 = b.x - ux * 24, y2 = b.y - uy * 24;
          return (
            <g key={ek(u, v)}>
              <line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke={ECOLOR[st]} strokeWidth={st === "default" ? 2 : 3.5} markerEnd={directed ? "url(#wgah)" : undefined} style={{ transition: "stroke 220ms" }} />
              {w != null && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fontFamily={FONT_MONO} fontSize={14} fontWeight={700} fill={st === "chosen" ? C.sorted : C.textMuted}>{w}</text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => {
          const st = nodeState[n] ?? "default";
          const dark = st === "default";
          return (
            <g key={n}>
              <circle cx={pos[n].x} cy={pos[n].y} r={22} fill={NFILL[st]} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 220ms" }} />
              <text x={pos[n].x} y={pos[n].y + 5} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={n.length > 2 ? 10 : 16} fill={dark ? C.text : "#0e1424"}>{n}</text>
              {nodeLabel && (
                <text x={pos[n].x} y={pos[n].y + 40} textAnchor="middle" fontFamily={FONT_MONO} fontSize={13} fontWeight={700} fill={C.pointer}>{nodeLabel(n)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {legend && <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>{legend}</div>}
    </div>
  );
}

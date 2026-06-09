import type { ReactNode } from "react";
import { C, FONT_MONO } from "../theme";

export type State =
  | "default"
  | "active"
  | "compare"
  | "sorted"
  | "pointer"
  | "highlight"
  | "muted";

function fill(state: State): [string, string, boolean] {
  // [background, border, isDark]
  const map: Record<State, [string, string, boolean]> = {
    default: [C.default, C.defaultBorder, true],
    active: [C.active, C.activeBorder, false],
    compare: [C.compare, C.compareBorder, false],
    sorted: [C.sorted, C.sortedBorder, false],
    pointer: [C.pointer, C.pointerBorder, false],
    highlight: [C.highlight, C.highlightBorder, false],
    muted: [C.cellMuted, C.cellMutedBorder, true],
  };
  return map[state];
}

// A labelled square — the universal "array element / node value" primitive.
export function Cell({
  value,
  state = "default",
  size = 72,
  sub,
}: {
  value: ReactNode;
  state?: State;
  size?: number;
  sub?: ReactNode; // small label under the cell (e.g. an index)
}) {
  const [bg, border, dark] = fill(state);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.18,
          background: bg,
          border: `3px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_MONO,
          fontSize: size * 0.34,
          fontWeight: 700,
          color: dark ? C.text : C.ink,
          boxShadow: dark ? "none" : `0 0 22px ${border}55`,
          transition: "background 220ms ease, border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease",
        }}
      >
        {value}
      </div>
      {sub != null && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted, height: 16 }}>{sub}</div>
      )}
    </div>
  );
}

// A vertical proportional bar (for sorting where height encodes value).
export function Bar({
  value,
  max,
  state = "default",
  width = 46,
  maxHeight = 260,
}: {
  value: number;
  max: number;
  state?: State;
  width?: number;
  maxHeight?: number;
}) {
  const [bg, border] = fill(state);
  const h = Math.max(24, (value / max) * maxHeight);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width,
          height: h,
          borderRadius: 8,
          background: bg,
          border: `2px solid ${border}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 6,
          fontFamily: FONT_MONO,
          fontSize: 15,
          fontWeight: 700,
          color: C.text,
          transition: "height 260ms cubic-bezier(0.22,1,0.36,1), background 220ms ease, border-color 220ms ease",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// A floating pointer label (lo / hi / i / j / curr ...) that animates its x.
export function PointerTag({ label, color = C.pointer }: { label: string; color?: string }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 15,
        fontWeight: 700,
        color,
        background: `${color}22`,
        border: `1px solid ${color}66`,
        borderRadius: 8,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

// Horizontal row container with consistent spacing.
export function Row({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap }}>
      {children}
    </div>
  );
}

// A connecting arrow (for linked lists / trees / graphs).
export function Arrow({ active = false, length = 40 }: { active?: boolean; length?: number }) {
  const col = active ? C.sorted : C.surfaceBorder;
  return (
    <div style={{ width: length, height: 3, background: col, position: "relative", transition: "background 220ms" }}>
      <div
        style={{
          position: "absolute",
          right: -1,
          top: -5,
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderLeft: `10px solid ${col}`,
          transition: "border-left-color 220ms",
        }}
      />
    </div>
  );
}

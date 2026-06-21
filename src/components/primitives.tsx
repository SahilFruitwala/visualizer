import type { CSSProperties, ReactNode } from "react";
import { C, FONT_MONO, mixColor } from "../theme";

const cellInnerStatic: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: FONT_MONO,
  fontWeight: 700,
  transition: "background 220ms ease, border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease",
};

const barOuterStatic: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const barInnerStatic: CSSProperties = {
  borderRadius: 8,
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  transformOrigin: "bottom",
};

const barLabelStatic: CSSProperties = {
  position: "relative",
  zIndex: 1,
  paddingBottom: 6,
  fontFamily: FONT_MONO,
  fontSize: 15,
  fontWeight: 700,
  color: C.text,
};

const pointerTagStatic: CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 15,
  fontWeight: 700,
  borderRadius: 8,
  padding: "2px 8px",
  whiteSpace: "nowrap",
};

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
          ...cellInnerStatic,
          width: size,
          height: size,
          borderRadius: size * 0.18,
          background: bg,
          border: `3px solid ${border}`,
          fontSize: size * 0.34,
          color: dark ? C.text : C.ink,
          boxShadow: dark ? "none" : `0 0 22px ${mixColor(border, 33)}`,
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
  const scale = Math.max(24 / maxHeight, value / max);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ ...barOuterStatic, width, height: maxHeight }}>
        <div
          style={{
            ...barInnerStatic,
            height: maxHeight,
            background: bg,
            border: `2px solid ${border}`,
            transform: `scaleY(${scale})`,
            transition: "transform 260ms cubic-bezier(0.22,1,0.36,1), background 220ms ease, border-color 220ms ease",
          }}
        />
        <span style={barLabelStatic}>{value}</span>
      </div>
    </div>
  );
}

// A floating pointer label (lo / hi / i / j / curr ...) that animates its x.
export function PointerTag({ label, color = C.pointer }: { label: string; color?: string }) {
  return (
    <div
      style={{
        ...pointerTagStatic,
        color,
        background: mixColor(color, 13),
        border: `1px solid ${mixColor(color, 40)}`,
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

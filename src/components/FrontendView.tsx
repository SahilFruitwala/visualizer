import type { CSSProperties, ReactNode } from "react";
import { C, FONT_MONO, FONT_SANS } from "../theme";

/** Keeps code labels inside bordered chips at any viewport width. */
const CODE_CHIP: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.4,
  hyphens: "none",
};

const ZONE_BOX: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
};

export function PipelineRow({
  stages,
  activeIndex,
  phase,
}: {
  stages: { id: string; label: string; detail?: string }[];
  activeIndex: number;
  phase?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
      {phase && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.active,
            fontWeight: 700,
          }}
        >
          {phase}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 720,
        }}
      >
        {stages.map((stage, i) => {
          const active = i === activeIndex;
          const done = i < activeIndex;
          const bg = active ? `${C.pointer}22` : done ? `${C.sorted}18` : C.surface;
          const border = active ? C.pointerBorder : done ? C.sortedBorder : C.surfaceBorder;
          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: bg,
                  border: `2px solid ${border}`,
                  minWidth: 72,
                  maxWidth: 120,
                  textAlign: "center",
                  transition: "background 220ms, border-color 220ms",
                  ...ZONE_BOX,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontWeight: 700,
                    fontSize: 13,
                    color: active || done ? C.text : C.textMuted,
                    overflowWrap: "anywhere",
                    lineHeight: 1.3,
                  }}
                >
                  {stage.label}
                </div>
                {stage.detail && active && (
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{stage.detail}</div>
                )}
              </div>
              {i < stages.length - 1 && (
                <span style={{ color: done ? C.sorted : C.surfaceBorder, fontSize: 16, fontWeight: 700 }}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TreeNode({
  label,
  type = "element",
  state = "default",
  children,
  compact,
}: {
  label: string;
  type?: "element" | "text" | "root";
  state?: "default" | "active" | "changed" | "removed" | "added" | "matched";
  children?: ReactNode;
  compact?: boolean;
}) {
  const fills: Record<typeof state, [string, string]> = {
    default: [C.default, C.defaultBorder],
    active: [C.active, C.activeBorder],
    changed: [C.compare, C.compareBorder],
    removed: [C.rejected, C.compareBorder],
    added: [C.sorted, C.sortedBorder],
    matched: [C.highlight, C.highlightBorder],
  };
  const [bg, border] = fills[state];
  const size = compact ? 11 : 13;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 6 : 10 }}>
      <div
        style={{
          padding: compact ? "6px 10px" : "8px 14px",
          borderRadius: 8,
          background: bg,
          border: `2px solid ${border}`,
          fontFamily: FONT_MONO,
          fontSize: size,
          fontWeight: 700,
          color: state === "default" ? C.text : C.ink,
          transition: "background 220ms, border-color 220ms",
          overflowWrap: "anywhere",
          maxWidth: "100%",
          textAlign: "center",
        }}
      >
        {type === "text" ? `"${label}"` : `<${label}>`}
      </div>
      {children && (
        <div style={{ display: "flex", gap: compact ? 10 : 16, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "10%",
              right: "10%",
              height: 2,
              background: C.surfaceBorder,
            }}
          />
          {children}
        </div>
      )}
    </div>
  );
}

export function PatchChip({ op, target, detail }: { op: "update" | "insert" | "remove" | "replace"; target: string; detail?: string }) {
  const colors: Record<typeof op, [string, string]> = {
    update: [C.active, C.activeBorder],
    insert: [C.sorted, C.sortedBorder],
    remove: [C.compare, C.compareBorder],
    replace: [C.highlight, C.highlightBorder],
  };
  const [bg, border] = colors[op];
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 14px",
        borderRadius: 10,
        background: `${bg}22`,
        border: `2px solid ${border}`,
        fontFamily: FONT_MONO,
        fontSize: 13,
        minWidth: 160,
        maxWidth: 320,
        ...ZONE_BOX,
      }}
    >
      <span style={{ color: border, fontWeight: 700, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>
        {op}
      </span>
      <span style={{ color: C.text, fontWeight: 700, ...CODE_CHIP }}>{target}</span>
      {detail && <span style={{ color: C.textMuted, fontSize: 12, ...CODE_CHIP }}>{detail}</span>}
    </div>
  );
}

export type QueueItem = { id: string; label: string; kind?: "macro" | "micro" | "sync" };

export function EventLoopDiagram({
  callStack,
  microtasks,
  macrotasks,
  webApi,
  activeZone,
  phase,
}: {
  callStack: QueueItem[];
  microtasks: QueueItem[];
  macrotasks: QueueItem[];
  webApi?: QueueItem[];
  activeZone?: "stack" | "micro" | "macro" | "api" | "render";
  phase?: string;
}) {
  const zoneStyle = (zone: typeof activeZone): CSSProperties => ({
    padding: "14px 16px",
    borderRadius: 12,
    background: activeZone === zone ? `${C.pointer}18` : C.surface,
    border: `2px solid ${activeZone === zone ? C.pointerBorder : C.surfaceBorder}`,
    minWidth: 0,
    transition: "background 220ms, border-color 220ms",
    ...ZONE_BOX,
  });

  const renderQueue = (items: QueueItem[], emptyLabel: string, highlightFront?: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 120, width: "100%" }}>
      {items.length === 0 ? (
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>{emptyLabel}</div>
      ) : (
        items.map((item, i) => {
          const isTop = highlightFront ? i === 0 : i === items.length - 1;
          const kindColor =
            item.kind === "micro" ? C.sorted : item.kind === "macro" ? C.active : item.kind === "sync" ? C.highlight : C.default;
          return (
            <div
              key={`${item.id}-${i}`}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: isTop ? `${kindColor}33` : C.cellMuted,
                border: `2px solid ${isTop ? (kindColor === C.default ? C.defaultBorder : kindColor) : C.cellMutedBorder}`,
                fontFamily: FONT_MONO,
                fontSize: 12,
                fontWeight: isTop ? 700 : 500,
                color: C.text,
                transition: "background 220ms, border-color 220ms",
                ...CODE_CHIP,
              }}
            >
              {item.label}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
      {phase && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.active,
            fontWeight: 700,
          }}
        >
          {phase}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          gap: 14,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div style={zoneStyle("stack")}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>
            CALL STACK
          </div>
          {renderQueue([...callStack].reverse(), "empty", false)}
        </div>
        <div style={zoneStyle("api")}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>
            WEB APIs
          </div>
          {renderQueue(webApi ?? [], "idle", true)}
        </div>
        <div style={zoneStyle("micro")}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>
            MICROTASKS
          </div>
          {renderQueue(microtasks, "empty", true)}
        </div>
        <div style={zoneStyle("macro")}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>
            MACROTASKS
          </div>
          {renderQueue(macrotasks, "empty", true)}
        </div>
      </div>
      {activeZone === "render" && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: `${C.sorted}22`,
            border: `2px solid ${C.sortedBorder}`,
            fontFamily: FONT_MONO,
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
          }}
        >
          Browser render / paint frame
        </div>
      )}
    </div>
  );
}

export function RouteDiagram({
  url,
  matchedRoute,
  routes,
  activeComponent,
  outlet,
  phase,
}: {
  url: string;
  matchedRoute: string;
  routes: { path: string; component: string; active?: boolean }[];
  activeComponent: string;
  outlet?: ReactNode;
  phase?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
      {phase && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.active,
            fontWeight: 700,
          }}
        >
          {phase}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 10,
          background: C.cellMuted,
          border: `1px solid ${C.cellMutedBorder}`,
          fontFamily: FONT_MONO,
          fontSize: 15,
          color: C.text,
          width: "100%",
          maxWidth: 520,
          ...ZONE_BOX,
        }}
      >
        <span style={{ color: C.textMuted, flexShrink: 0 }}>URL</span>
        <span style={{ color: C.pointer, fontWeight: 700, ...CODE_CHIP, flex: 1, minWidth: 0 }}>{url}</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {routes.map((r) => (
          <div
            key={r.path}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: r.active || r.path === matchedRoute ? `${C.pointer}22` : C.surface,
              border: `2px solid ${r.active || r.path === matchedRoute ? C.pointerBorder : C.surfaceBorder}`,
              fontFamily: FONT_MONO,
              fontSize: 13,
              transition: "background 220ms, border-color 220ms",
              minWidth: 100,
              maxWidth: 160,
              ...ZONE_BOX,
            }}
          >
            <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 4, overflowWrap: "anywhere" }}>{r.path}</div>
            <div style={{ color: C.text, fontWeight: 700, overflowWrap: "anywhere" }}>{r.component}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 12,
          background: `${C.sorted}18`,
          border: `2px solid ${C.sortedBorder}`,
          minWidth: 260,
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 220ms",
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1, color: C.textMuted, fontWeight: 700 }}>
          OUTLET
        </div>
        {outlet ?? (
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: C.text }}>&lt;{activeComponent} /&gt;</div>
        )}
      </div>
    </div>
  );
}

export function VirtualListView({
  totalItems,
  itemHeight,
  viewportHeight,
  scrollTop,
  visibleStart,
  visibleEnd,
  phase,
}: {
  totalItems: number;
  itemHeight: number;
  viewportHeight: number;
  scrollTop: number;
  visibleStart: number;
  visibleEnd: number;
  phase?: string;
}) {
  const buffer = 1;
  const renderStart = Math.max(0, visibleStart - buffer);
  const renderEnd = Math.min(totalItems - 1, visibleEnd + buffer);
  const totalHeight = totalItems * itemHeight;
  const offsetY = renderStart * itemHeight;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {phase && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.active,
            fontWeight: 700,
          }}
        >
          {phase}
        </div>
      )}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 220,
            height: viewportHeight,
            borderRadius: 12,
            border: `2px solid ${C.surfaceBorder}`,
            background: C.surface,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: totalHeight,
              transform: `translateY(-${scrollTop}px)`,
              transition: "transform 280ms ease",
            }}
          >
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {Array.from({ length: renderEnd - renderStart + 1 }, (_, i) => {
                const idx = renderStart + i;
                const inViewport = idx >= visibleStart && idx <= visibleEnd;
                return (
                  <div
                    key={idx}
                    style={{
                      height: itemHeight,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      background: inViewport ? `${C.active}22` : `${C.pointer}12`,
                      borderBottom: `1px solid ${C.cellMutedBorder}`,
                      fontFamily: FONT_MONO,
                      fontSize: 13,
                      color: inViewport ? C.text : C.textMuted,
                      transition: "background 220ms",
                    }}
                  >
                    Row {idx + 1}
                    {inViewport && <span style={{ marginLeft: 8, color: C.active, fontSize: 11 }}>visible</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `2px dashed ${C.sortedBorder}`,
              borderRadius: 10,
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>
          <div>
            total items: <span style={{ color: C.text }}>{totalItems}</span>
          </div>
          <div>
            DOM nodes: <span style={{ color: C.sorted }}>{renderEnd - renderStart + 1}</span>{" "}
            <span style={{ color: C.textMuted }}>(not {totalItems})</span>
          </div>
          <div>
            scrollTop: <span style={{ color: C.pointer }}>{scrollTop}px</span>
          </div>
          <div>
            visible range:{" "}
            <span style={{ color: C.active }}>
              [{visibleStart}…{visibleEnd}]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DomSnippet({
  title,
  nodes,
  highlight,
}: {
  title: string;
  nodes: { tag: string; text?: string; state?: "default" | "active" | "new" }[];
  highlight?: number;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.surfaceBorder}`,
        borderRadius: 12,
        padding: "12px 14px",
        minWidth: 180,
        maxWidth: 300,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: C.textMuted,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, lineHeight: 1.8, overflowWrap: "anywhere" }}>
        {nodes.map((n, i) => {
          const active = highlight === i || n.state === "active";
          const isNew = n.state === "new";
          const line = `${"  ".repeat(Math.min(i, 2))}<${n.tag}>${n.text ? ` ${n.text}` : ""}`;
          return (
            <div
              key={i}
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                background: active ? `${C.pointer}22` : isNew ? `${C.sorted}18` : "transparent",
                color: active ? C.pointer : isNew ? C.sorted : C.text,
                transition: "background 220ms",
                ...CODE_CHIP,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

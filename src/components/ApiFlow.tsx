import type { ReactNode } from "react";
import { C, FONT_MONO, FONT_SANS } from "../theme";

export type StatusClass = "2xx" | "4xx" | "5xx" | "pending";

export function statusClass(code: number): StatusClass {
  if (code >= 500) return "5xx";
  if (code >= 400) return "4xx";
  return "2xx";
}

function statusColors(cls: StatusClass): [string, string] {
  const map: Record<StatusClass, [string, string]> = {
    "2xx": [C.sorted, C.sortedBorder],
    "4xx": [C.active, C.activeBorder],
    "5xx": [C.compare, C.compareBorder],
    pending: [C.pointer, C.pointerBorder],
  };
  return map[cls];
}

export function StatusBadge({ code, label }: { code: number; label?: string }) {
  const cls = statusClass(code);
  const [bg, border] = statusColors(cls);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 8,
        background: bg,
        border: `2px solid ${border}`,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 15,
        color: C.ink,
      }}
    >
      <span>{code}</span>
      {label && <span style={{ fontWeight: 600, opacity: 0.85 }}>{label}</span>}
    </div>
  );
}

export type HttpHeader = { name: string; value: string };

export function HttpMessage({
  direction,
  method,
  path,
  status,
  statusLabel,
  headers = [],
  body,
  highlight = [],
}: {
  direction: "request" | "response";
  method?: string;
  path?: string;
  status?: number;
  statusLabel?: string;
  headers?: HttpHeader[];
  body?: string;
  highlight?: string[];
}) {
  const isReq = direction === "request";
  const hl = (field: string) => highlight.includes(field);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.surfaceBorder}`,
        borderRadius: 12,
        padding: "14px 16px",
        fontFamily: FONT_MONO,
        fontSize: 13,
        minWidth: 280,
        maxWidth: 420,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: isReq ? C.pointer : C.sorted,
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        {isReq ? "Request" : "Response"}
      </div>

      {isReq && method && path && (
        <div
          style={{
            marginBottom: 10,
            padding: "6px 10px",
            borderRadius: 6,
            background: hl("line") ? `${C.pointer}22` : "transparent",
            border: hl("line") ? `1px solid ${C.pointer}66` : "1px solid transparent",
          }}
        >
          <span style={{ color: C.active, fontWeight: 700 }}>{method}</span>{" "}
          <span style={{ color: C.text }}>{path}</span>
        </div>
      )}

      {!isReq && status != null && (
        <div style={{ marginBottom: 10 }}>
          <StatusBadge code={status} label={statusLabel} />
        </div>
      )}

      {headers.length > 0 && (
        <div style={{ marginBottom: body ? 10 : 0 }}>
          {headers.map((h) => (
            <div
              key={h.name}
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                marginBottom: 2,
                background: hl(h.name) ? `${C.pointer}22` : "transparent",
                border: hl(h.name) ? `1px solid ${C.pointer}44` : "1px solid transparent",
              }}
            >
              <span style={{ color: C.textMuted }}>{h.name}: </span>
              <span style={{ color: C.text }}>{h.value}</span>
            </div>
          ))}
        </div>
      )}

      {body && (
        <pre
          style={{
            margin: 0,
            padding: "8px 10px",
            borderRadius: 6,
            background: hl("body") ? `${C.sorted}18` : C.cellMuted,
            border: `1px solid ${hl("body") ? C.sortedBorder : C.cellMutedBorder}`,
            color: C.text,
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {body}
        </pre>
      )}
    </div>
  );
}

export function ApiFlow({
  phase,
  activeSide,
  direction = "right",
  children,
}: {
  phase?: string;
  activeSide?: "client" | "server" | "both" | "none";
  direction?: "right" | "left" | "both";
  children?: ReactNode;
}) {
  const clientActive = activeSide === "client" || activeSide === "both";
  const serverActive = activeSide === "server" || activeSide === "both";

  const boxStyle = (active: boolean) => ({
    padding: "16px 20px",
    borderRadius: 12,
    background: active ? `${C.pointer}18` : C.surface,
    border: `2px solid ${active ? C.pointerBorder : C.surfaceBorder}`,
    fontFamily: FONT_SANS,
    fontWeight: 700,
    fontSize: 16,
    color: active ? C.text : C.textMuted,
    minWidth: 90,
    textAlign: "center" as const,
    transition: "background 220ms, border-color 220ms, color 220ms",
  });

  const arrowColor =
    direction === "both" ? C.highlight : direction === "right" ? C.pointer : C.sorted;

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
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={boxStyle(clientActive)}>Client</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {direction !== "left" && (
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 36, height: 2, background: arrowColor }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: `8px solid ${arrowColor}`,
                }}
              />
            </div>
          )}
          {direction === "both" && (
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderRight: `8px solid ${C.sorted}`,
                }}
              />
              <div style={{ width: 36, height: 2, background: C.sorted }} />
            </div>
          )}
          {direction === "left" && (
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderRight: `8px solid ${arrowColor}`,
                }}
              />
              <div style={{ width: 36, height: 2, background: arrowColor }} />
            </div>
          )}
        </div>
        <div style={boxStyle(serverActive)}>Server</div>
      </div>
      {children}
    </div>
  );
}

export function ResourceCard({
  label,
  data,
  removed,
}: {
  label: string;
  data: Record<string, unknown> | null;
  removed?: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${removed ? C.compareBorder : C.surfaceBorder}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 200,
        opacity: removed ? 0.5 : 1,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: C.textMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {removed || !data ? (
        <div style={{ fontFamily: FONT_MONO, color: C.compare, fontSize: 13 }}>(deleted)</div>
      ) : (
        <pre
          style={{
            margin: 0,
            fontFamily: FONT_MONO,
            fontSize: 13,
            color: C.text,
            lineHeight: 1.6,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function TokenChip({ token, highlight }: { token: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 6,
        background: highlight ? `${C.pointer}22` : C.cellMuted,
        border: `1px solid ${highlight ? C.pointerBorder : C.cellMutedBorder}`,
        fontFamily: FONT_MONO,
        fontSize: 12,
        color: C.textMuted,
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {token}
    </div>
  );
}

export function BucketMeter({ tokens, capacity }: { tokens: number; capacity: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: C.textMuted,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Token bucket
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: capacity }, (_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: i < tokens ? C.sorted : C.cellMuted,
              border: `2px solid ${i < tokens ? C.sortedBorder : C.cellMutedBorder}`,
              transition: "background 220ms, border-color 220ms",
            }}
          />
        ))}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.text }}>
        {tokens} / {capacity} tokens
      </div>
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";
import { C, FONT_MONO, FONT_SANS } from "../theme";

const CHIP: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  overflowWrap: "anywhere",
  lineHeight: 1.4,
};

export function CacheLayerStack({
  layers,
  activeLayer,
  phase,
}: {
  layers: { id: string; label: string; hit?: boolean; detail?: string }[];
  activeLayer: string;
  phase?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
      {phase && <PhaseLabel>{phase}</PhaseLabel>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 420 }}>
        {layers.map((l) => {
          const active = l.id === activeLayer;
          return (
            <div
              key={l.id}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: active ? (l.hit ? `${C.sorted}22` : `${C.pointer}18`) : C.surface,
                border: `2px solid ${active ? (l.hit ? C.sortedBorder : C.pointerBorder) : C.surfaceBorder}`,
                transition: "all 220ms",
                ...CHIP,
              }}
            >
              <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 14, color: C.text }}>
                {l.label} {l.hit != null && (l.hit ? <span style={{ color: C.sorted }}>HIT</span> : <span style={{ color: C.compare }}>MISS</span>)}
              </div>
              {l.detail && active && <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted, marginTop: 4 }}>{l.detail}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function JwtDiagram({
  header,
  payload,
  signature,
  highlight,
  phase,
}: {
  header: string;
  payload: string;
  signature: string;
  highlight?: "header" | "payload" | "signature" | "verify";
  phase?: string;
}) {
  const part = (name: string, value: string, key: typeof highlight) => (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: highlight === key ? `${C.pointer}18` : C.surface,
        border: `2px solid ${highlight === key ? C.pointerBorder : C.surfaceBorder}`,
        fontFamily: FONT_MONO,
        fontSize: 12,
        transition: "all 220ms",
        ...CHIP,
      }}
    >
      <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>{name}</div>
      <div style={{ color: C.text }}>{value}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", maxWidth: 480 }}>
      {phase && <PhaseLabel>{phase}</PhaseLabel>}
      {part("HEADER (alg + typ)", header, "header")}
      <div style={{ color: C.active, fontWeight: 700 }}>.</div>
      {part("PAYLOAD (claims)", payload, "payload")}
      <div style={{ color: C.active, fontWeight: 700 }}>.</div>
      {part("SIGNATURE", signature, "signature")}
    </div>
  );
}

export function RetryTimeline({
  attempts,
  phase,
}: {
  attempts: { n: number; status: number; label: string; idempotent?: boolean }[];
  phase?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {phase && <PhaseLabel>{phase}</PhaseLabel>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {attempts.map((a) => (
          <div
            key={a.n}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              minWidth: 120,
              background: a.status >= 500 ? `${C.compare}18` : a.status >= 200 && a.status < 300 ? `${C.sorted}18` : `${C.active}18`,
              border: `2px solid ${a.status >= 500 ? C.compareBorder : a.status < 300 ? C.sortedBorder : C.activeBorder}`,
              fontFamily: FONT_MONO,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, color: C.text }}>Attempt {a.n}</div>
            <div style={{ color: C.textMuted, marginTop: 4 }}>{a.status}</div>
            <div style={{ color: C.text, marginTop: 6, fontSize: 11 }}>{a.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProtobufFrame({
  fields,
  transport,
  phase,
}: {
  fields: { name: string; value: string; highlight?: boolean }[];
  transport: string;
  phase?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {phase && <PhaseLabel>{phase}</PhaseLabel>}
      <div style={{ padding: "10px 16px", borderRadius: 8, background: C.cellMuted, fontFamily: FONT_MONO, fontSize: 13, color: C.pointer }}>{transport}</div>
      <div style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}`, borderRadius: 12, padding: 14, minWidth: 260, maxWidth: 360 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 8 }}>PROTOBUF MESSAGE</div>
        {fields.map((f) => (
          <div key={f.name} style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 4, background: f.highlight ? `${C.active}22` : "transparent", fontFamily: FONT_MONO, fontSize: 12, color: C.text }}>
            {f.name}: <span style={{ color: C.sorted }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BloomFilterView({
  bits,
  size,
  queries,
  phase,
}: {
  bits: boolean[];
  size: number;
  queries: { key: string; hashes: number[]; maybe: boolean }[];
  phase?: string;
}) {
  const q = queries[queries.length - 1];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {phase && <PhaseLabel>{phase}</PhaseLabel>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 360, justifyContent: "center" }}>
        {Array.from({ length: size }, (_, i) => {
          const lit = bits[i] || (q?.hashes.includes(i) ?? false);
          const hl = q?.hashes.includes(i);
          return (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: lit ? (hl ? C.active : C.sorted) : C.cellMuted,
                border: `1px solid ${hl ? C.activeBorder : C.cellMutedBorder}`,
                fontFamily: FONT_MONO,
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.ink,
                transition: "background 220ms",
              }}
            >
              {bits[i] ? 1 : ""}
            </div>
          );
        })}
      </div>
      {q && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.text }}>
          query &quot;{q.key}&quot; → {q.maybe ? <span style={{ color: C.active }}>MAYBE present</span> : <span style={{ color: C.compare }}>definitely absent</span>}
        </div>
      )}
    </div>
  );
}

export function PhaseLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.active, fontWeight: 700 }}>
      {children}
    </div>
  );
}

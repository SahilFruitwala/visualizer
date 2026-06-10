import { ApiFlow, TlsMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO, FONT_SANS, mixProp } from "../theme";

type Phase = "closed" | "syn" | "syn-ack" | "ack" | "established";

interface Step extends StepBase {
  phase: Phase;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  packet?: { dir: "client" | "server"; label: string; detail: string };
  clientSeq: number;
  serverSeq: number;
}

function build(): Step[] {
  return [
    {
      phase: "closed",
      activeSide: "none",
      direction: "right",
      clientSeq: 1000,
      serverSeq: 0,
      chapter: "Closed",
      caption: "No connection yet. Client wants to connect to api.example.com:443.",
    },
    {
      phase: "syn",
      activeSide: "client",
      direction: "right",
      packet: { dir: "client", label: "SYN", detail: "seq=1000 · flags=SYN · win=65535" },
      clientSeq: 1000,
      serverSeq: 0,
      chapter: "SYN",
      caption: "Client sends SYN — proposes initial sequence number (ISN).",
    },
    {
      phase: "syn-ack",
      activeSide: "server",
      direction: "left",
      packet: { dir: "server", label: "SYN-ACK", detail: "seq=5000 · ack=1001 · flags=SYN,ACK" },
      clientSeq: 1000,
      serverSeq: 5000,
      chapter: "SYN-ACK",
      caption: "Server responds SYN-ACK — its own ISN plus ack of client seq+1.",
    },
    {
      phase: "ack",
      activeSide: "client",
      direction: "right",
      packet: { dir: "client", label: "ACK", detail: "seq=1001 · ack=5001 · flags=ACK" },
      clientSeq: 1001,
      serverSeq: 5000,
      chapter: "ACK",
      caption: "Client sends ACK — acknowledges server ISN. Handshake complete.",
    },
    {
      phase: "established",
      activeSide: "both",
      direction: "both",
      clientSeq: 1001,
      serverSeq: 5000,
      chapter: "ESTABLISHED",
      caption: "Connection ESTABLISHED — both sides can send application data (HTTP, TLS, …). ✓",
    },
  ];
}

const CODE = `// TCP three-way handshake (simplified)
// 1. Client → Server:  SYN      (seq=x)
// 2. Server → Client:  SYN-ACK  (seq=y, ack=x+1)
// 3. Client → Server:  ACK      (seq=x+1, ack=y+1)
// → state = ESTABLISHED

// In Node/browser this happens before fetch() sends bytes:
const socket = net.connect({ host: "api.example.com", port: 443 });
// OS kernel performs SYN → SYN-ACK → ACK automatically`;

const TCP_STEPS = withCodeLines(build(), (s) => {
  if (s.phase === "closed") return [0, 1];
  if (s.phase === "syn") return [2, 3];
  if (s.phase === "syn-ack") return [4, 5];
  if (s.phase === "ack") return [6, 7];
  return [8, 9];
});

export const tcpHandshake: Topic = {
  id: "tcp-handshake",
  title: "TCP Three-Way Handshake",
  category: "Protocol",
  blurb: "SYN, SYN-ACK, ACK — how TCP opens a connection.",
  prerequisites: ["http-lifecycle"],
  create: () =>
    defineViz<Step>({
      steps: TCP_STEPS,
      code: CODE,
      explanation:
        "Before HTTP or TLS can send data, TCP must establish a reliable connection. The three-way handshake synchronizes sequence numbers on both sides and confirms both endpoints are ready.\n\nSYN consumes one sequence number; the peer's ACK is always seq+1. After ESTABLISHED, bytes are delivered in order with retransmission on loss. This is the \"TCP connect\" step in the HTTP lifecycle.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.phase.toUpperCase()}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel="Client"
            serverLabel="Server"
          />
          {s.packet && (
            <TlsMessage
              direction={s.packet.dir}
              label={s.packet.label}
              detail={s.packet.detail}
              highlight
            />
          )}
          <div
            style={{
              display: "flex",
              gap: 24,
              fontFamily: FONT_MONO,
              fontSize: 13,
              color: C.textMuted,
            }}
          >
            <span>
              client seq: <strong style={{ color: C.pointer }}>{s.clientSeq}</strong>
            </span>
            <span>
              server seq: <strong style={{ color: C.sorted }}>{s.serverSeq || "—"}</strong>
            </span>
          </div>
          {s.phase === "established" && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: mixProp("sorted", 13),
                border: `2px solid ${C.sortedBorder}`,
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Ready for HTTP / TLS / application data
            </div>
          )}
        </div>
      ),
    }),
};

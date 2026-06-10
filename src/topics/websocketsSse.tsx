import { ApiFlow, ConnectionLine, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS, mixProp } from "../theme";

type Mode = "polling" | "sse-open" | "sse-push" | "ws-upgrade" | "ws-bidir";

interface Step extends StepBase {
  mode: Mode;
  activeSide: "client" | "server" | "both" | "none";
  pollCount?: number;
  events?: string[];
  wsClientMsg?: string;
  wsServerMsg?: string;
}

function build(): Step[] {
  return [
    {
      mode: "polling",
      activeSide: "client",
      pollCount: 1,
      chapter: "HTTP polling",
      caption: "HTTP polling: client repeatedly asks “anything new?” every few seconds.",
    },
    {
      mode: "polling",
      activeSide: "client",
      pollCount: 2,
      caption: "Poll #2 → still empty. Wastes bandwidth and adds latency.",
    },
    {
      mode: "polling",
      activeSide: "client",
      pollCount: 3,
      caption: "Poll #3 finally returns data — up to N seconds late.",
    },
    {
      mode: "sse-open",
      activeSide: "both",
      chapter: "SSE open stream",
      caption: "SSE: one long-lived GET with Accept: text/event-stream.",
    },
    {
      mode: "sse-push",
      activeSide: "server",
      events: ["data: {\"msg\":\"hello\"}", "data: {\"msg\":\"world\"}"],
      chapter: "SSE server push",
      caption: "Server pushes text/event-stream lines over the open connection.",
    },
    {
      mode: "ws-upgrade",
      activeSide: "both",
      chapter: "WebSocket upgrade",
      caption: "WebSocket: HTTP Upgrade handshake → 101 Switching Protocols.",
    },
    {
      mode: "ws-bidir",
      activeSide: "both",
      wsClientMsg: '{"type":"subscribe","channel":"chat"}',
      wsServerMsg: '{"type":"message","text":"Hi!"}',
      chapter: "WebSocket bidirectional",
      caption: "Full-duplex: both sides send framed messages anytime — chat, games, live data.",
    },
  ];
}

const CODE = `// HTTP polling — simple, high latency
setInterval(() => fetch("/messages").then(r => r.json()), 3000);

// SSE — server → client, over HTTP
const es = new EventSource("/events");
es.onmessage = (e) => console.log(JSON.parse(e.data));

// WebSocket — bidirectional, persistent
const ws = new WebSocket("wss://api.example.com/ws");
ws.send(JSON.stringify({ type: "subscribe", channel: "chat" }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));`;

export const websocketsSse: Topic = {
  id: "websockets-sse",
  title: "WebSockets & SSE",
  category: "Operations",
  blurb: "Polling vs server-sent events vs bidirectional WebSockets.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Standard HTTP is request-response: the client must ask for every update. For live data you have three patterns.\n\nPolling repeats GET requests on a timer — simple but wasteful and laggy. SSE (Server-Sent Events) keeps one HTTP connection open; the server pushes text/event-stream events — great for feeds and notifications (one-way). WebSockets upgrade to a full-duplex protocol — both sides send messages anytime, ideal for chat and collaborative apps.",
      renderStep: (s) => {
        const modeLabel: Record<Mode, string> = {
          polling: "HTTP polling",
          "sse-open": "SSE · open stream",
          "sse-push": "SSE · server push",
          "ws-upgrade": "WebSocket · upgrade",
          "ws-bidir": "WebSocket · bidirectional",
        };
        const connMode =
          s.mode === "polling"
            ? "polling"
            : s.mode.startsWith("sse")
              ? "sse"
              : "websocket";

        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: C.pointer,
                fontWeight: 700,
              }}
            >
              {modeLabel[s.mode]}
            </div>
            <ApiFlow activeSide={s.activeSide} direction="both" />
            <ConnectionLine
              mode={connMode}
              label={
                s.mode === "polling"
                  ? "short-lived connections"
                  : s.mode.startsWith("sse")
                    ? "one-way · server → client"
                    : "two-way · full duplex"
              }
            />

            {s.mode === "polling" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path="/messages"
                  highlight={["line"]}
                />
                <HttpMessage
                  direction="response"
                  status={200}
                  statusLabel="OK"
                  body={s.pollCount === 3 ? '[{ "id": 1, "text": "New!" }]' : "[]"}
                  highlight={["body"]}
                />
                <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted, alignSelf: "center" }}>
                  poll #{s.pollCount}
                </div>
              </div>
            )}

            {s.mode === "sse-open" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path="/events"
                  headers={[{ name: "Accept", value: "text/event-stream" }]}
                  highlight={["Accept"]}
                />
                <HttpMessage
                  direction="response"
                  status={200}
                  statusLabel="OK"
                  headers={[
                    { name: "Content-Type", value: "text/event-stream" },
                    { name: "Cache-Control", value: "no-cache" },
                    { name: "Connection", value: "keep-alive" },
                  ]}
                  highlight={["Content-Type"]}
                />
              </div>
            )}

            {s.mode === "sse-push" && s.events && (
              <pre
                style={{
                  margin: 0,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: C.surface,
                  border: `1px solid ${C.surfaceBorder}`,
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  color: C.text,
                  lineHeight: 1.8,
                  textAlign: "left",
                }}
              >
                {s.events.join("\n\n")}
              </pre>
            )}

            {s.mode === "ws-upgrade" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path="/ws"
                  headers={[
                    { name: "Upgrade", value: "websocket" },
                    { name: "Connection", value: "Upgrade" },
                    { name: "Sec-WebSocket-Key", value: "dGhlIHNhbXBsZSBub25jZQ==" },
                  ]}
                  highlight={["Upgrade", "Connection"]}
                />
                <HttpMessage
                  direction="response"
                  status={101}
                  statusLabel="Switching Protocols"
                  headers={[
                    { name: "Upgrade", value: "websocket" },
                    { name: "Connection", value: "Upgrade" },
                    { name: "Sec-WebSocket-Accept", value: "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=" },
                  ]}
                  highlight={["Upgrade"]}
                />
              </div>
            )}

            {s.mode === "ws-bidir" && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                <div
                  style={{
                    background: mixProp("pointer", 9),
                    border: `1px solid ${C.pointerBorder}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    color: C.text,
                  }}
                >
                  <div style={{ color: C.pointer, fontWeight: 700, marginBottom: 6 }}>Client →</div>
                  {s.wsClientMsg}
                </div>
                <div
                  style={{
                    background: mixProp("sorted", 9),
                    border: `1px solid ${C.sortedBorder}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    color: C.text,
                  }}
                >
                  <div style={{ color: C.sorted, fontWeight: 700, marginBottom: 6 }}>Server →</div>
                  {s.wsServerMsg}
                </div>
              </div>
            )}
          </div>
        );
      },
    }),
};

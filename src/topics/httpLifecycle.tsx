import { ApiFlow, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";

type Phase = "build" | "dns" | "tcp" | "request" | "process" | "response" | "parse";

interface Step extends StepBase {
  phase: Phase;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  showRequest: boolean;
  showResponse: boolean;
  highlight: string[];
}

function build(): Step[] {
  return [
    {
      phase: "build",
      activeSide: "client",
      direction: "right",
      showRequest: true,
      showResponse: false,
      highlight: ["line"],
      chapter: "Build request",
      caption: "Client builds GET /users/42 with Accept: application/json.",
    },
    {
      phase: "dns",
      activeSide: "both",
      direction: "right",
      showRequest: true,
      showResponse: false,
      highlight: [],
      chapter: "DNS lookup",
      caption: "DNS resolves api.example.com → server IP address.",
    },
    {
      phase: "tcp",
      activeSide: "both",
      direction: "both",
      showRequest: false,
      showResponse: false,
      highlight: [],
      chapter: "TCP connect",
      caption: "TCP three-way handshake establishes a connection.",
    },
    {
      phase: "request",
      activeSide: "client",
      direction: "right",
      showRequest: true,
      showResponse: false,
      highlight: ["line", "Host", "Accept"],
      chapter: "Send request",
      caption: "Request line + headers sent over the connection.",
    },
    {
      phase: "process",
      activeSide: "server",
      direction: "right",
      showRequest: false,
      showResponse: false,
      highlight: [],
      chapter: "Server processing",
      caption: "Server routes the request, queries the database, builds JSON.",
    },
    {
      phase: "response",
      activeSide: "server",
      direction: "left",
      showRequest: false,
      showResponse: true,
      highlight: ["body"],
      chapter: "Response",
      caption: "Server returns 200 OK with Content-Type: application/json.",
    },
    {
      phase: "parse",
      activeSide: "client",
      direction: "left",
      showRequest: false,
      showResponse: true,
      highlight: ["body"],
      chapter: "Parse response",
      caption: "Client parses the JSON body → { id: 42, name: \"Alice\" }.",
    },
  ];
}

const REQ = {
  method: "GET",
  path: "/users/42",
  headers: [
    { name: "Host", value: "api.example.com" },
    { name: "Accept", value: "application/json" },
  ],
};

const RES_BODY = '{\n  "id": 42,\n  "name": "Alice"\n}';

const CODE = `async function fetchUser(id) {
  const res = await fetch(\`https://api.example.com/users/\${id}\`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(res.status);
  return res.json(); // { id: 42, name: "Alice" }
}`;

const STEPS = withCodeLines(build(), (s) => {
  if (s.phase === "build" || s.phase === "request") return [0, 1, 2];
  if (s.phase === "parse") return [4, 5, 6];
  if (s.phase === "response") return [3, 4];
  return [0, 1];
});

export const httpLifecycle: Topic = {
  id: "http-lifecycle",
  title: "HTTP Request Lifecycle",
  category: "Protocol",
  blurb: "From building a request to parsing the JSON response.",
  useWhen: "Debugging slow requests, timeouts, or connection errors.",
  badges: ["client ↔ server"],
  quiz: [
    {
      question: "What happens before the HTTP request is sent?",
      options: ["JSON parse", "DNS + TCP", "CORS preflight only", "Webhook delivery"],
      correctIndex: 1,
      explanation: "The client resolves the host and opens a TCP connection before bytes hit the wire.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: STEPS,
      code: CODE,
      explanation:
        "An HTTP call is more than fetch(). The client resolves the hostname (DNS), opens a TCP connection, sends a request line + headers, waits while the server processes, then reads the status, headers, and body from the response.\n\nMost of this is handled by the browser/runtime — but knowing the lifecycle helps you debug timeouts, TLS errors, and malformed responses.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <ApiFlow
            phase={s.phase.toUpperCase()}
            activeSide={s.activeSide}
            direction={s.direction}
          />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {s.showRequest && (
              <HttpMessage
                direction="request"
                method={REQ.method}
                path={REQ.path}
                headers={REQ.headers}
                highlight={s.highlight}
              />
            )}
            {s.showResponse && (
              <HttpMessage
                direction="response"
                status={200}
                statusLabel="OK"
                headers={[{ name: "Content-Type", value: "application/json" }]}
                body={RES_BODY}
                highlight={s.highlight}
              />
            )}
          </div>
        </div>
      ),
    }),
};

import { ApiFlow, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_SANS } from "../theme";

type Scenario = "same-origin" | "simple" | "blocked" | "preflight" | "options" | "actual";

interface Step extends StepBase {
  scenario: Scenario;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  showRequest: boolean;
  showResponse: boolean;
  method: string;
  path: string;
  status?: number;
  statusLabel?: string;
  reqHeaders: { name: string; value: string }[];
  resHeaders: { name: string; value: string }[];
  body?: string;
  highlight: string[];
  blocked?: boolean;
}

function build(): Step[] {
  return [
    {
      scenario: "same-origin",
      activeSide: "client",
      direction: "right",
      showRequest: true,
      showResponse: true,
      method: "GET",
      path: "/users",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '[{ "id": 1, "name": "Alice" }]',
      highlight: ["line"],
      chapter: "Same origin",
      caption: "Same origin (app on api.example.com) — no CORS check needed.",
    },
    {
      scenario: "simple",
      activeSide: "both",
      direction: "both",
      showRequest: true,
      showResponse: true,
      method: "GET",
      path: "/users",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [{ name: "Origin", value: "https://app.example.com" }],
      resHeaders: [
        { name: "Access-Control-Allow-Origin", value: "https://app.example.com" },
        { name: "Content-Type", value: "application/json" },
      ],
      body: '[{ "id": 1, "name": "Alice" }]',
      highlight: ["Origin", "Access-Control-Allow-Origin"],
      chapter: "Simple cross-origin GET",
      caption: "Cross-origin GET — server echoes Allow-Origin → browser exposes response to JS.",
    },
    {
      scenario: "blocked",
      activeSide: "client",
      direction: "left",
      showRequest: true,
      showResponse: true,
      method: "GET",
      path: "/users",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [{ name: "Origin", value: "https://app.example.com" }],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '[{ "id": 1 }]',
      highlight: ["line"],
      blocked: true,
      chapter: "Blocked response",
      caption: "Missing Allow-Origin → browser receives 200 but blocks JS from reading it.",
    },
    {
      scenario: "preflight",
      activeSide: "client",
      direction: "right",
      showRequest: true,
      showResponse: false,
      method: "POST",
      path: "/users",
      reqHeaders: [
        { name: "Origin", value: "https://app.example.com" },
        { name: "Content-Type", value: "application/json" },
      ],
      resHeaders: [],
      body: '{ "name": "Bob" }',
      highlight: ["Content-Type", "body"],
      chapter: "Preflight trigger",
      caption: "JSON POST is not a “simple” request → browser sends OPTIONS preflight first.",
    },
    {
      scenario: "options",
      activeSide: "server",
      direction: "left",
      showRequest: true,
      showResponse: true,
      method: "OPTIONS",
      path: "/users",
      status: 204,
      statusLabel: "No Content",
      reqHeaders: [
        { name: "Origin", value: "https://app.example.com" },
        { name: "Access-Control-Request-Method", value: "POST" },
        { name: "Access-Control-Request-Headers", value: "content-type" },
      ],
      resHeaders: [
        { name: "Access-Control-Allow-Origin", value: "https://app.example.com" },
        { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE" },
        { name: "Access-Control-Allow-Headers", value: "content-type, authorization" },
        { name: "Access-Control-Max-Age", value: "86400" },
      ],
      highlight: ["Access-Control-Request-Method", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"],
      chapter: "OPTIONS preflight",
      caption: "Preflight OPTIONS → server declares allowed origin, methods, and headers.",
    },
    {
      scenario: "actual",
      activeSide: "both",
      direction: "both",
      showRequest: true,
      showResponse: true,
      method: "POST",
      path: "/users",
      status: 201,
      statusLabel: "Created",
      reqHeaders: [
        { name: "Origin", value: "https://app.example.com" },
        { name: "Content-Type", value: "application/json" },
      ],
      resHeaders: [
        { name: "Access-Control-Allow-Origin", value: "https://app.example.com" },
        { name: "Content-Type", value: "application/json" },
      ],
      body: '{ "id": 2, "name": "Bob" }',
      highlight: ["body", "Access-Control-Allow-Origin"],
      chapter: "Actual request",
      caption: "Preflight passed → real POST goes through → JS can read the 201 response.",
    },
  ];
}

const CODE = `// Browser adds Origin automatically on cross-origin requests
const res = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Bob" }),
});
// Server must respond with:
// Access-Control-Allow-Origin: https://app.example.com
// (and answer OPTIONS preflight for non-simple requests)

// Server-side (Express example)
app.use(cors({ origin: "https://app.example.com" }));`;

const CORS_STEPS = withCodeLines(build(), (s) => {
  if (s.scenario === "same-origin" || s.scenario === "simple") return [0, 1, 2];
  if (s.scenario === "preflight" || s.scenario === "options") return [3, 4, 5];
  if (s.scenario === "blocked") return [0, 1];
  return [6, 7];
});

export const cors: Topic = {
  id: "cors",
  title: "CORS",
  category: "API",
  blurb: "Cross-origin requests, preflight OPTIONS, and Allow-Origin.",
  useWhen: "A browser app calls an API on a different domain.",
  badges: ["browser security"],
  prerequisites: ["http-lifecycle", "rest-crud"],
  quiz: [
    {
      question: "Who enforces CORS?",
      options: ["The API server", "The browser", "DNS", "TLS"],
      correctIndex: 1,
      explanation: "Servers respond with headers; the browser blocks JS from reading disallowed cross-origin responses.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: CORS_STEPS,
      code: CODE,
      explanation:
        "CORS is a browser security policy — not something curl enforces. When JavaScript on app.example.com calls api.example.com, the browser checks whether the response includes Access-Control-Allow-Origin matching the page's origin.\n\n“Simple” GET requests skip preflight. JSON POSTs, custom headers, and PUT/DELETE trigger an OPTIONS preflight. The server must explicitly allow the origin, methods, and headers or the browser hides the response from your code.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.scenario === "blocked" ? "BLOCKED" : s.scenario.toUpperCase()}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel="Browser"
            serverLabel="API Server"
          />
          {s.blocked && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: `${C.compare}22`,
                border: `2px solid ${C.compareBorder}`,
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Browser blocks JS access — network tab still shows 200
            </div>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {s.showRequest && (
              <HttpMessage
                direction="request"
                method={s.method}
                path={s.path}
                headers={s.reqHeaders}
                body={s.body}
                highlight={s.highlight}
              />
            )}
            {s.showResponse && s.status != null && (
              <HttpMessage
                direction="response"
                status={s.status}
                statusLabel={s.statusLabel}
                headers={s.resHeaders}
                body={s.body && s.method !== "OPTIONS" ? s.body : undefined}
                highlight={s.highlight}
              />
            )}
          </div>
        </div>
      ),
    }),
};

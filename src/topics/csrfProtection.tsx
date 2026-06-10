import { ApiFlow, HttpMessage, TokenChip } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO, FONT_SANS, mixProp } from "../theme";

type Scenario = "legit" | "attack" | "samesite" | "token-page" | "token-submit" | "token-blocked";

interface Step extends StepBase {
  scenario: Scenario;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  clientLabel: string;
  serverLabel: string;
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
  csrfToken?: string;
}

const CSRF_TOKEN = "a8f3c2e1b9d04f7a";

function build(): Step[] {
  return [
    {
      scenario: "legit",
      activeSide: "both",
      direction: "both",
      clientLabel: "Your App",
      serverLabel: "API Server",
      showRequest: true,
      showResponse: true,
      method: "POST",
      path: "/transfer",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [
        { name: "Cookie", value: "session=abc123" },
        { name: "Origin", value: "https://app.example.com" },
      ],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '{ "amount": 50 }',
      highlight: ["Cookie", "Origin"],
      chapter: "Legitimate request",
      caption: "User on app.example.com POSTs /transfer — browser sends session cookie automatically.",
    },
    {
      scenario: "attack",
      activeSide: "client",
      direction: "right",
      clientLabel: "Evil Site",
      serverLabel: "API Server",
      showRequest: true,
      showResponse: true,
      method: "POST",
      path: "/transfer",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [
        { name: "Cookie", value: "session=abc123" },
        { name: "Origin", value: "https://evil.example.com" },
      ],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '{ "amount": 1000 }',
      highlight: ["Cookie", "Origin"],
      blocked: true,
      chapter: "CSRF attack",
      caption: "Hidden form on evil.com triggers POST — browser still sends the session cookie!",
    },
    {
      scenario: "samesite",
      activeSide: "client",
      direction: "right",
      clientLabel: "Evil Site",
      serverLabel: "API Server",
      showRequest: true,
      showResponse: false,
      method: "POST",
      path: "/transfer",
      reqHeaders: [{ name: "Origin", value: "https://evil.example.com" }],
      resHeaders: [],
      body: '{ "amount": 1000 }',
      highlight: ["Origin"],
      blocked: true,
      chapter: "SameSite cookie",
      caption: "Set-Cookie: SameSite=Strict — browser withholds cookie on cross-site requests.",
    },
    {
      scenario: "token-page",
      activeSide: "server",
      direction: "left",
      clientLabel: "Your App",
      serverLabel: "API Server",
      showRequest: false,
      showResponse: true,
      method: "GET",
      path: "/transfer-form",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [],
      resHeaders: [{ name: "Content-Type", value: "text/html" }],
      body: '<input type="hidden" name="_csrf" value="a8f3c2e1…">',
      highlight: ["body"],
      csrfToken: CSRF_TOKEN,
      chapter: "CSRF token",
      caption: "Server embeds a unique CSRF token in the form HTML.",
    },
    {
      scenario: "token-submit",
      activeSide: "both",
      direction: "both",
      clientLabel: "Your App",
      serverLabel: "API Server",
      showRequest: true,
      showResponse: true,
      method: "POST",
      path: "/transfer",
      status: 200,
      statusLabel: "OK",
      reqHeaders: [
        { name: "Cookie", value: "session=abc123" },
        { name: "X-CSRF-Token", value: CSRF_TOKEN },
      ],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '{ "amount": 50, "_csrf": "a8f3c2e1…" }',
      highlight: ["X-CSRF-Token", "body"],
      csrfToken: CSRF_TOKEN,
      caption: "Legitimate submit includes token — server verifies it matches the session.",
    },
    {
      scenario: "token-blocked",
      activeSide: "client",
      direction: "right",
      clientLabel: "Evil Site",
      serverLabel: "API Server",
      showRequest: true,
      showResponse: true,
      method: "POST",
      path: "/transfer",
      status: 403,
      statusLabel: "Forbidden",
      reqHeaders: [{ name: "Cookie", value: "session=abc123" }],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: '{ "amount": 1000 }',
      highlight: ["line"],
      blocked: true,
      caption: "Attacker lacks the CSRF token → server returns 403. ✓",
    },
  ];
}

const CODE = `// Defense 1: SameSite cookies
Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly

// Defense 2: CSRF token (double-submit or synchronizer)
// Server renders token in form; client sends it back
app.post("/transfer", (req, res) => {
  if (req.body._csrf !== req.session.csrfToken)
    return res.status(403).json({ error: "CSRF" });
  // … process transfer
});

// Always combine with HTTPS; for SPAs, require a custom CSRF header
// or use bearer tokens instead of cookie sessions.`;

const CSRF_STEPS = withCodeLines(build(), (s) => {
  if (s.scenario === "legit") return [0, 1];
  if (s.scenario === "attack") return [0, 1];
  if (s.scenario === "samesite") return [2, 3];
  if (s.scenario === "token-page") return [4, 5, 6];
  if (s.scenario === "token-submit") return [7, 8, 9];
  return [7, 8, 9];
});

export const csrfProtection: Topic = {
  id: "csrf-protection",
  title: "CSRF Protection",
  category: "Auth & Security",
  blurb: "Cross-site request forgery — SameSite cookies and CSRF tokens.",
  prerequisites: ["cors", "bearer-auth"],
  create: () =>
    defineViz<Step>({
      steps: CSRF_STEPS,
      code: CODE,
      explanation:
        "CSRF tricks a logged-in user's browser into making unwanted requests. Because cookies are sent automatically, a malicious site can POST to your API using the victim's session.\n\nDefenses: SameSite=Strict/Lax cookies block cross-site cookie sending. CSRF tokens require a secret value only your app knows — attackers can't read it due to same-origin policy. For SPAs using bearer tokens (not cookies), CSRF is less of a concern.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.scenario.toUpperCase().replace(/-/g, " ")}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel={s.clientLabel}
            serverLabel={s.serverLabel}
          />
          {s.blocked && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: mixProp("compare", 13),
                border: `2px solid ${C.compareBorder}`,
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              {s.scenario === "samesite"
                ? "Cookie blocked by SameSite policy"
                : s.scenario === "token-blocked"
                  ? "403 — missing or invalid CSRF token"
                  : "Vulnerable — cookie sent cross-site"}
            </div>
          )}
          {s.csrfToken && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>CSRF token:</span>
              <TokenChip token={s.csrfToken} highlight={s.scenario === "token-submit"} />
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
                body={s.body && s.scenario !== "token-submit" ? s.body : s.scenario === "token-page" ? s.body : s.scenario === "token-submit" ? '{ "ok": true }' : undefined}
                highlight={s.highlight}
              />
            )}
          </div>
        </div>
      ),
    }),
};

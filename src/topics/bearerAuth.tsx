import { ApiFlow, HttpMessage, TokenChip } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  showLogin: boolean;
  showProfile: boolean;
  profileStatus?: number;
  profileLabel?: string;
  hasToken: boolean;
  tokenStored: boolean;
  authHeader: boolean;
  profileBody?: string;
}

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…";
const PROFILE = '{\n  "name": "Alice",\n  "email": "alice@example.com"\n}';

function build(): Step[] {
  return [
    {
      phase: "Login",
      showLogin: true,
      showProfile: false,
      hasToken: false,
      tokenStored: false,
      authHeader: false,
      chapter: "Login",
      caption: "POST /login with email + password credentials.",
    },
    {
      phase: "Token issued",
      showLogin: true,
      showProfile: false,
      hasToken: true,
      tokenStored: false,
      authHeader: false,
      chapter: "Token issued",
      caption: "Server validates credentials → 200 OK + JWT token in body.",
    },
    {
      phase: "No auth",
      showLogin: false,
      showProfile: true,
      profileStatus: 401,
      profileLabel: "Unauthorized",
      hasToken: true,
      tokenStored: false,
      authHeader: false,
      profileBody: '{ "error": "Missing Authorization header" }',
      chapter: "Missing Authorization",
      caption: "GET /profile without Authorization header → 401.",
    },
    {
      phase: "Store token",
      showLogin: false,
      showProfile: false,
      hasToken: true,
      tokenStored: true,
      authHeader: false,
      chapter: "Store token",
      caption: "Client stores the token (memory, sessionStorage, etc.).",
    },
    {
      phase: "Authenticated",
      showLogin: false,
      showProfile: true,
      profileStatus: 200,
      profileLabel: "OK",
      hasToken: true,
      tokenStored: true,
      authHeader: true,
      profileBody: PROFILE,
      chapter: "Authenticated request",
      caption: "GET /profile with Authorization: Bearer <token> → 200 + profile.",
    },
    {
      phase: "Expired token",
      showLogin: false,
      showProfile: true,
      profileStatus: 401,
      profileLabel: "Unauthorized",
      hasToken: true,
      tokenStored: true,
      authHeader: true,
      profileBody: '{ "error": "Token expired" }',
      chapter: "Expired token",
      caption: "Expired or invalid token → 401 again. Re-login or refresh.",
    },
  ];
}

const CODE = `// 1. Login → get token
const { token } = await fetch("/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
}).then(r => r.json());

// 2. Attach token to protected requests
const profile = await fetch("/profile", {
  headers: { Authorization: \`Bearer \${token}\` },
}).then(r => r.json());`;

export const bearerAuth: Topic = {
  id: "bearer-auth",
  title: "Bearer Token Auth",
  category: "API",
  blurb: "Login, store a JWT, attach Authorization header.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Bearer token auth is stateless: the server issues a signed token after login. The client sends it on every protected request in the Authorization header. The server verifies the signature without storing session state.\n\nNever put tokens in URLs. Use HTTPS. Handle 401 by refreshing the token or redirecting to login.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow phase={s.phase} activeSide={s.showLogin ? "both" : s.authHeader ? "client" : "server"} direction="both" />
          {s.tokenStored && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>stored:</span>
              <TokenChip token={TOKEN} highlight={s.authHeader} />
            </div>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {s.showLogin && (
              <>
                <HttpMessage
                  direction="request"
                  method="POST"
                  path="/login"
                  body='{\n  "email": "alice@example.com",\n  "password": "••••••••"\n}'
                  highlight={["line", "body"]}
                />
                <HttpMessage
                  direction="response"
                  status={200}
                  statusLabel="OK"
                  body={s.hasToken ? `{\n  "token": "${TOKEN}"\n}` : undefined}
                  highlight={s.hasToken ? ["body"] : []}
                />
              </>
            )}
            {s.showProfile && (
              <>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path="/profile"
                  headers={
                    s.authHeader
                      ? [{ name: "Authorization", value: `Bearer ${TOKEN}` }]
                      : []
                  }
                  highlight={s.authHeader ? ["Authorization"] : ["line"]}
                />
                <HttpMessage
                  direction="response"
                  status={s.profileStatus!}
                  statusLabel={s.profileLabel}
                  body={s.profileBody}
                />
              </>
            )}
          </div>
        </div>
      ),
    }),
};

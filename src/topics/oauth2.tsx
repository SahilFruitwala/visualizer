import { ApiFlow, HttpMessage, TokenChip } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  showAuth: boolean;
  showToken: boolean;
  showApi: boolean;
  hasCode: boolean;
  hasToken: boolean;
  tokenStored: boolean;
  apiStatus?: number;
  apiLabel?: string;
  apiBody?: string;
}

const CODE = "SplxlOBeZQQYbYS6WxSbIA";
const VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9…";

function build(): Step[] {
  return [
    {
      phase: "PKCE setup",
      showAuth: false,
      showToken: false,
      showApi: false,
      hasCode: false,
      hasToken: false,
      tokenStored: false,
      chapter: "PKCE setup",
      caption: "Client generates code_verifier (random) and code_challenge = SHA256(verifier).",
      insight: "PKCE prevents authorization-code interception on public clients.",
    },
    {
      phase: "Authorize",
      showAuth: true,
      showToken: false,
      showApi: false,
      hasCode: false,
      hasToken: false,
      tokenStored: false,
      chapter: "Authorization",
      caption: "Redirect user to /authorize with code_challenge — user logs in & consents.",
    },
    {
      phase: "Auth code",
      showAuth: true,
      showToken: false,
      showApi: false,
      hasCode: true,
      hasToken: false,
      tokenStored: false,
      caption: "Auth server redirects back with ?code=… (one-time, short-lived).",
    },
    {
      phase: "Token exchange",
      showAuth: false,
      showToken: true,
      showApi: false,
      hasCode: true,
      hasToken: false,
      tokenStored: false,
      chapter: "Token exchange",
      caption: "POST /token with code + code_verifier — server verifies SHA256(verifier) = challenge.",
    },
    {
      phase: "Access token",
      showAuth: false,
      showToken: true,
      showApi: false,
      hasCode: true,
      hasToken: true,
      tokenStored: false,
      caption: "Server returns access_token (+ optional refresh_token).",
    },
    {
      phase: "Store token",
      showAuth: false,
      showToken: false,
      showApi: false,
      hasCode: false,
      hasToken: true,
      tokenStored: true,
      chapter: "API request",
      caption: "Client stores access token securely.",
    },
    {
      phase: "API call",
      showAuth: false,
      showToken: false,
      showApi: true,
      hasCode: false,
      hasToken: true,
      tokenStored: true,
      apiStatus: 200,
      apiLabel: "OK",
      apiBody: '{\n  "id": 42,\n  "name": "Alice"\n}',
      caption: "GET /api/user with Authorization: Bearer <access_token> → 200.",
    },
    {
      phase: "Expired",
      showAuth: false,
      showToken: false,
      showApi: true,
      hasCode: false,
      hasToken: true,
      tokenStored: true,
      apiStatus: 401,
      apiLabel: "Unauthorized",
      apiBody: '{ "error": "invalid_token" }',
      chapter: "Refresh",
      caption: "Expired token → 401. Use refresh_token to get a new access_token.",
    },
  ];
}

const CODE_SNIPPET = `// 1. PKCE — generate before redirect
const verifier = randomString(43);
const challenge = base64url(sha256(verifier));

// 2. Redirect user to authorize
location.href = \`/authorize?client_id=…&code_challenge=\${challenge}\`;

// 3. Exchange code for token (back-channel)
const { access_token } = await fetch("/token", {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, code_verifier: verifier,
  }),
}).then(r => r.json());`;

export const oauth2: Topic = {
  id: "oauth2",
  title: "OAuth 2.0 (Auth Code + PKCE)",
  category: "Auth & Security",
  blurb: "Delegated authorization via redirect, code exchange, and bearer token.",
  useWhen: "A third-party app needs limited access to a user's resources.",
  prerequisites: ["bearer-auth", "http-lifecycle"],
  quiz: [
    {
      question: "Why send code_verifier only during token exchange, not in the authorize URL?",
      options: [
        "It's too long for URLs",
        "The verifier proves the same client that started the flow is exchanging the code",
        "Servers can't read POST bodies",
        "It's optional",
      ],
      correctIndex: 1,
      explanation: "PKCE binds the authorization code to the client that created the challenge.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE_SNIPPET,
      explanation:
        "OAuth 2.0 lets users grant apps limited access without sharing passwords. The Authorization Code flow redirects to a login page, returns a one-time code, then exchanges it server-side for tokens. PKCE adds a code_challenge/code_verifier pair so intercepted codes can't be redeemed by attackers.\n\nAlways use HTTPS. Store tokens securely. Prefer short-lived access tokens + refresh tokens.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.phase}
            activeSide={s.showAuth ? "both" : s.showToken ? "both" : s.showApi ? "client" : "client"}
            direction="both"
          />
          {s.phase === "PKCE setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: FONT_MONO, fontSize: 12 }}>
              <div style={{ color: C.textMuted }}>
                code_verifier: <span style={{ color: C.text }}>{VERIFIER.slice(0, 20)}…</span>
              </div>
              <div style={{ color: C.textMuted }}>
                code_challenge: <span style={{ color: C.active }}>{CHALLENGE.slice(0, 20)}…</span>
              </div>
            </div>
          )}
          {s.tokenStored && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>stored:</span>
              <TokenChip token={TOKEN} highlight={s.showApi} />
            </div>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {s.showAuth && (
              <>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path={`/authorize?client_id=my-app&code_challenge=${CHALLENGE.slice(0, 12)}…&redirect_uri=https://app/callback`}
                  highlight={["line"]}
                />
                <HttpMessage
                  direction="response"
                  status={302}
                  statusLabel="Found"
                  headers={[{ name: "Location", value: `/callback?code=${CODE.slice(0, 12)}…` }]}
                  highlight={s.hasCode ? ["Location"] : []}
                />
              </>
            )}
            {s.showToken && (
              <>
                <HttpMessage
                  direction="request"
                  method="POST"
                  path="/token"
                  body={`grant_type=authorization_code\ncode=${CODE}\ncode_verifier=${VERIFIER.slice(0, 16)}…`}
                  highlight={["body"]}
                />
                <HttpMessage
                  direction="response"
                  status={200}
                  statusLabel="OK"
                  body={s.hasToken ? `{\n  "access_token": "${TOKEN}",\n  "token_type": "Bearer"\n}` : undefined}
                  highlight={s.hasToken ? ["body"] : []}
                />
              </>
            )}
            {s.showApi && (
              <>
                <HttpMessage
                  direction="request"
                  method="GET"
                  path="/api/user"
                  headers={[{ name: "Authorization", value: `Bearer ${TOKEN}` }]}
                  highlight={["Authorization"]}
                />
                <HttpMessage
                  direction="response"
                  status={s.apiStatus!}
                  statusLabel={s.apiLabel}
                  body={s.apiBody}
                />
              </>
            )}
          </div>
        </div>
      ),
    }),
};

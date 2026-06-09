import { JwtDiagram } from "../components/BackendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  phase: string;
  highlight?: "header" | "payload" | "signature" | "verify";
}

const HDR = '{"alg":"RS256","typ":"JWT"}';
const PAY = '{"sub":"user_42","exp":1735689600,"role":"admin"}';
const SIG = "HMACSHA256(base64(header)+'.'+base64(payload), secret)";

const build = (): Step[] => [
  { phase: "Encode header", highlight: "header", chapter: "Structure", caption: "Header: algorithm + type — base64url encoded." },
  { phase: "Encode payload", highlight: "payload", caption: "Payload: claims (sub, exp, custom) — not encrypted, just encoded!" },
  { phase: "Sign", highlight: "signature", caption: "Signature: HMAC or RSA over header.payload — tamper detection." },
  { phase: "Verify", highlight: "verify", chapter: "Verification", caption: "Server verifies signature + exp claim before trusting claims." },
  { phase: "Done", caption: "JWT = header.payload.signature — stateless auth (can't revoke without blocklist). ✓" },
];

const CODE = `const token = base64(header) + '.' + base64(payload) + '.' + sign(...);
// Verify on each request
const claims = jwt.verify(token, PUBLIC_KEY);
if (claims.exp < Date.now()/1000) throw new Error('expired');`;

export const jwtStructure: Topic = {
  id: "jwt-structure",
  title: "JWT Structure",
  category: "Auth & Security",
  blurb: "Header, payload, signature — and what to verify.",
  prerequisites: ["bearer-auth"],
  badges: ["stateless"],
  quiz: [{ question: "Is JWT payload encrypted?", options: ["Yes, always", "No, only signed/encoded", "Only with HTTPS", "Only RS256"], correctIndex: 1, explanation: "JWT payload is base64url-encoded JSON — readable by anyone. Signature prevents tampering." }],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "A JWT has three dot-separated parts. The signature proves integrity; exp/nbf claims bound validity. Never put secrets in the payload.\n\nFor session revocation, use short TTLs + refresh tokens or a denylist.",
    renderStep: (s) => <JwtDiagram header={HDR} payload={PAY} signature={SIG} highlight={s.highlight} phase={s.phase} />,
  }),
};

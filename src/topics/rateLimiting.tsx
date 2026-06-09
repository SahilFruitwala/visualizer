import { BucketMeter, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const CAPACITY = 5;

interface Step extends StepBase {
  tokens: number;
  requestNum: number | null;
  status: number | null;
  statusLabel?: string;
}

function build(): Step[] {
  const steps: Step[] = [];
  let tokens = CAPACITY;
  let req = 0;

  const snap = (caption: string, requestNum: number | null, status: number | null, statusLabel?: string) => {
    steps.push({ tokens, requestNum, status, statusLabel, caption });
  };

  snap(`Token bucket starts full: ${CAPACITY} tokens (capacity).`, null, null);

  // 3 rapid requests — all succeed
  for (let i = 0; i < 3; i++) {
    req++;
    tokens--;
    snap(`Request #${req} arrives → consume 1 token → 200 OK.`, req, 200, "OK");
  }

  // 2 more — still succeed
  for (let i = 0; i < 2; i++) {
    req++;
    tokens--;
    snap(`Request #${req} → last token consumed → 200 OK.`, req, 200, "OK");
  }

  // Bucket empty — 3 requests rejected
  for (let i = 0; i < 3; i++) {
    req++;
    snap(`Request #${req} but bucket empty → 429 Too Many Requests.`, req, 429, "Too Many Requests");
  }

  // Refill
  tokens = 2;
  snap("1 second passes → bucket refills +2 tokens (rate = 2/sec).", null, null);

  req++;
  tokens--;
  snap(`Request #${req} after refill → 200 OK.`, req, 200, "OK");

  return steps;
}

const CODE = `// Token bucket: burst up to capacity, steady refill rate
class RateLimiter {
  constructor(capacity, refillPerSec) {
    this.tokens = capacity;
    this.capacity = capacity;
    this.refill = refillPerSec;
  }
  allow() {
    if (this.tokens <= 0) return false; // → 429
    this.tokens--;
    return true; // → 200
  }
}`;

export const rateLimiting: Topic = {
  id: "rate-limiting",
  title: "Rate Limiting",
  category: "API",
  blurb: "Token bucket: burst allowance + steady refill.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Rate limiting protects APIs from abuse. A token bucket allows short bursts (up to capacity) while enforcing a steady refill rate over time. Each request consumes one token; when the bucket is empty, respond with 429 and a Retry-After header.\n\nCommon alternatives: fixed window (simpler but allows burst at boundaries) and sliding window (smoother but more state).",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <BucketMeter tokens={s.tokens} capacity={CAPACITY} />
          {s.requestNum != null && s.status != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  color: C.text,
                  padding: "8px 14px",
                  background: C.surface,
                  border: `1px solid ${C.surfaceBorder}`,
                  borderRadius: 8,
                }}
              >
                Request #{s.requestNum}
              </div>
              <div style={{ fontFamily: FONT_MONO, color: C.textMuted }}>→</div>
              <HttpMessage
                direction="response"
                status={s.status}
                statusLabel={s.statusLabel}
                body={s.status === 429 ? '{ "error": "Rate limit exceeded" }' : '{ "ok": true }'}
              />
            </div>
          )}
        </div>
      ),
    }),
};

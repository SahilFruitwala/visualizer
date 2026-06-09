import { RetryTimeline } from "../components/BackendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  phase: string;
  attempts: { n: number; status: number; label: string }[];
  idempotent: boolean;
}

const build = (): Step[] => [
  { phase: "POST payment", attempts: [{ n: 1, status: 500, label: "timeout" }], idempotent: false, chapter: "Dangerous retry", caption: "POST /charge without idempotency key — retry could double-charge!" },
  { phase: "Idempotency key", attempts: [], idempotent: true, caption: "Client sends Idempotency-Key: uuid — server dedupes duplicate attempts." },
  { phase: "Retry 1", attempts: [{ n: 1, status: 500, label: "500" }], idempotent: true, caption: "First attempt 500 → safe to retry with same key." },
  { phase: "Retry 2", attempts: [{ n: 1, status: 500, label: "500" }, { n: 2, status: 200, label: "200 OK" }], idempotent: true, caption: "Second attempt succeeds — only one charge recorded. ✓" },
  { phase: "GET safe", attempts: [{ n: 1, status: 200, label: "GET safe" }], idempotent: true, chapter: "Idempotent verbs", caption: "GET, PUT, DELETE are idempotent by design — retries are safe." },
];

const CODE = `await fetch('/charge', {
  method: 'POST',
  headers: { 'Idempotency-Key': crypto.randomUUID() },
  body: JSON.stringify({ amount: 1000 }),
});
// Server stores key → returns same response on replay`;

export const idempotencyRetries: Topic = {
  id: "idempotency-retries",
  title: "Idempotency & Retries",
  category: "Operations",
  blurb: "Safe retries without duplicate side effects.",
  prerequisites: ["rest-crud", "http-status-codes"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Network failures invite retries. Idempotent operations (GET, PUT with same body) are safe to repeat. POST needs idempotency keys so the server recognizes duplicates.\n\nExponential backoff + jitter prevents thundering herds.",
    renderStep: (s) => <RetryTimeline attempts={s.attempts} phase={`${s.phase}${s.idempotent ? " (idempotent)" : " ⚠"}`} />,
  }),
};

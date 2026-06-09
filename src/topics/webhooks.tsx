import { ApiFlow, EventBadge, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  showRegister: boolean;
  showDelivery: boolean;
  showRetry: boolean;
  event?: string;
  deliveryStatus?: number;
  deliveryLabel?: string;
  attempt?: number;
}

const WEBHOOK_URL = "https://myapp.com/hooks/payment";
const EVENT_BODY = '{\n  "type": "payment.succeeded",\n  "data": { "id": "pi_3Nx", "amount": 4200 }\n}';

function build(): Step[] {
  return [
    {
      phase: "Register",
      activeSide: "both",
      direction: "right",
      showRegister: true,
      showDelivery: false,
      showRetry: false,
      chapter: "Register endpoint",
      caption: "Your server registers a webhook URL with the provider.",
    },
    {
      phase: "Confirmed",
      activeSide: "server",
      direction: "left",
      showRegister: true,
      showDelivery: false,
      showRetry: false,
      chapter: "Registration confirmed",
      caption: "Provider stores the endpoint → 201 Created with webhook id wh_abc.",
    },
    {
      phase: "Event fires",
      activeSide: "server",
      direction: "right",
      showRegister: false,
      showDelivery: false,
      showRetry: false,
      event: "payment.succeeded",
      chapter: "Event fires",
      caption: "Later: a payment completes on the provider's platform.",
    },
    {
      phase: "Deliver",
      activeSide: "server",
      direction: "left",
      showRegister: false,
      showDelivery: true,
      showRetry: false,
      event: "payment.succeeded",
      deliveryStatus: 200,
      deliveryLabel: "OK",
      chapter: "Deliver payload",
      caption: "Provider POSTs the event payload to your URL (server → server).",
    },
    {
      phase: "Verify",
      activeSide: "client",
      direction: "left",
      showRegister: false,
      showDelivery: true,
      showRetry: false,
      event: "payment.succeeded",
      deliveryStatus: 200,
      deliveryLabel: "OK",
      chapter: "Verify & acknowledge",
      caption: "Your server verifies the signature header, processes the event, returns 200.",
    },
    {
      phase: "Retry",
      activeSide: "server",
      direction: "left",
      showRegister: false,
      showDelivery: true,
      showRetry: true,
      deliveryStatus: 500,
      deliveryLabel: "Internal Server Error",
      attempt: 1,
      chapter: "Retry on failure",
      caption: "If your server returns 5xx, provider retries with exponential backoff.",
    },
    {
      phase: "Retry OK",
      activeSide: "both",
      direction: "left",
      showRegister: false,
      showDelivery: true,
      showRetry: true,
      deliveryStatus: 200,
      deliveryLabel: "OK",
      attempt: 3,
      chapter: "Retry succeeds",
      caption: "Attempt #3 succeeds → provider marks the event delivered.",
    },
  ];
}

const CODE = `// 1. Register your endpoint
await fetch("https://api.stripe.com/v1/webhook_endpoints", {
  method: "POST",
  body: new URLSearchParams({ url: "https://myapp.com/hooks/payment" }),
});

// 2. Provider pushes events to YOU (not a poll)
// POST https://myapp.com/hooks/payment
// Stripe-Signature: t=...,v1=...
// { "type": "payment.succeeded", "data": { ... } }

// 3. Verify signature, return 2xx quickly, process async
app.post("/hooks/payment", (req, res) => {
  if (!verifySignature(req)) return res.status(400).end();
  queue.process(req.body);
  res.status(200).end(); // non-2xx → provider retries
});`;

export const webhooks: Topic = {
  id: "webhooks",
  title: "Webhooks",
  category: "API",
  blurb: "Server-to-server event delivery, signatures, and retries.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Webhooks invert the usual flow: instead of your app polling for changes, the provider POSTs events to a URL you register. This is how payment processors, GitHub, and Slack notify you in near real time.\n\nYour endpoint must verify cryptographic signatures (never trust raw payloads), return 2xx quickly, and process work asynchronously. Providers retry on failure with backoff — design for idempotency since the same event may arrive more than once.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.phase}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel="Your Server"
            serverLabel="Provider"
          />
          {s.event && <EventBadge event={s.event} highlight={s.phase === "Event fires"} />}
          {s.showRegister && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <HttpMessage
                direction="request"
                method="POST"
                path="/webhook_endpoints"
                body={`{\n  "url": "${WEBHOOK_URL}"\n}`}
                highlight={["line", "body"]}
              />
              <HttpMessage
                direction="response"
                status={201}
                statusLabel="Created"
                body={`{\n  "id": "wh_abc",\n  "url": "${WEBHOOK_URL}"\n}`}
                highlight={["body"]}
              />
            </div>
          )}
          {s.showDelivery && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <HttpMessage
                direction="request"
                method="POST"
                path="/hooks/payment"
                headers={[
                  { name: "Provider-Signature", value: "t=1710000000,v1=abc123…" },
                  { name: "Content-Type", value: "application/json" },
                ]}
                body={EVENT_BODY}
                highlight={["Provider-Signature", "body"]}
              />
              <HttpMessage
                direction="response"
                status={s.deliveryStatus!}
                statusLabel={s.deliveryLabel}
                body={s.deliveryStatus === 500 ? '{ "error": "DB unavailable" }' : undefined}
              />
            </div>
          )}
          {s.showRetry && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>
              Retry attempt #{s.attempt} · backoff: 1s → 5s → 30s → …
            </div>
          )}
        </div>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

interface Server {
  id: string;
  load: number;
  healthy: boolean;
}

interface Step extends StepBase {
  servers: Server[];
  requestNum: number;
  selected?: string;
  algorithm: "round-robin" | "least-conn" | "unhealthy";
}

function build(): Step[] {
  const servers: Server[] = [
    { id: "S1", load: 2, healthy: true },
    { id: "S2", load: 1, healthy: true },
    { id: "S3", load: 3, healthy: true },
  ];
  const steps: Step[] = [];

  steps.push({
    servers: servers.map((s) => ({ ...s })),
    requestNum: 0,
    algorithm: "round-robin",
    chapter: "Round robin",
    caption: "Load balancer distributes requests across backend servers.",
  });

  const rr = [0, 1, 2, 0];
  for (let i = 0; i < 4; i++) {
    const idx = rr[i];
    servers[idx].load++;
    steps.push({
      servers: servers.map((s) => ({ ...s })),
      requestNum: i + 1,
      selected: servers[idx].id,
      algorithm: "round-robin",
      caption: `Request ${i + 1} → ${servers[idx].id} (round-robin pointer).`,
    });
  }

  steps.push({
    servers: servers.map((s) => ({ ...s, load: s.id === "S2" ? 1 : s.load })),
    requestNum: 5,
    algorithm: "least-conn",
    chapter: "Least connections",
    caption: "Least-connections picks the server with fewest active connections.",
  });

  const leastIdx = servers.reduce((min, s, i, arr) => (s.load < arr[min].load ? i : min), 0);
  servers[leastIdx].load++;
  steps.push({
    servers: servers.map((s) => ({ ...s })),
    requestNum: 5,
    selected: servers[leastIdx].id,
    algorithm: "least-conn",
    caption: `Request 5 → ${servers[leastIdx].id} (lowest load: ${servers[leastIdx].load - 1}).`,
  });

  servers[1].healthy = false;
  steps.push({
    servers: servers.map((s) => ({ ...s })),
    requestNum: 6,
    algorithm: "unhealthy",
    chapter: "Health checks",
    caption: "S2 fails health check — removed from rotation. Traffic rerouted.",
  });

  const healthy = servers.filter((s) => s.healthy);
  const pick = healthy.reduce((min, s) => (s.load < min.load ? s : min), healthy[0]);
  pick.load++;
  steps.push({
    servers: servers.map((s) => ({ ...s })),
    requestNum: 6,
    selected: pick.id,
    algorithm: "unhealthy",
    caption: `Request 6 → ${pick.id} (S2 skipped). ✓`,
  });

  return steps;
}

const CODE = `// Round robin — rotate through backends
let i = 0;
function pickRR(servers) { return servers[i++ % servers.length]; }

// Least connections — route to least busy
function pickLC(servers) {
  return servers.reduce((a, b) => a.conns <= b.conns ? a : b);
}

// Health checks remove unhealthy nodes from pool`;

export const loadBalancing: Topic = {
  id: "load-balancing",
  title: "Load Balancing",
  category: "Operations",
  blurb: "Distribute traffic across servers with health checks.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A load balancer sits between clients and multiple backend servers. Round-robin rotates evenly; least-connections routes to the least busy server. Health checks remove failed nodes. Layer 4 (TCP) balancers are fast; Layer 7 (HTTP) can route by path/header.\n\nCommon implementations: NGINX, HAProxy, AWS ALB, Cloudflare.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 10,
              background: C.pointer,
              border: `2px solid ${C.pointerBorder}`,
              fontFamily: FONT_MONO,
              fontWeight: 700,
            }}
          >
            Load Balancer
            {s.requestNum > 0 && (
              <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 600 }}>req #{s.requestNum}</span>
            )}
          </div>
          <div style={{ fontSize: 24, color: C.textMuted }}>↓</div>
          <div style={{ display: "flex", gap: 16 }}>
            {s.servers.map((srv) => {
              const selected = srv.id === s.selected;
              return (
                <div
                  key={srv.id}
                  style={{
                    width: 90,
                    padding: "14px 10px",
                    borderRadius: 10,
                    textAlign: "center",
                    background: !srv.healthy ? C.compare : selected ? C.sorted : C.surface,
                    border: `2px solid ${selected ? C.sortedBorder : C.surfaceBorder}`,
                    opacity: srv.healthy ? 1 : 0.5,
                    fontFamily: FONT_MONO,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{srv.id}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                    {srv.healthy ? `load: ${srv.load}` : "DOWN"}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted }}>{s.algorithm}</div>
        </div>
      ),
    }),
};

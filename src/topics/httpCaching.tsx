import { CacheLayerStack } from "../components/BackendView";
import { HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  phase: string;
  activeLayer: string;
  layers: { id: string; label: string; hit?: boolean; detail?: string }[];
  showResponse?: boolean;
  status?: number;
}

const build = (): Step[] => [
  { phase: "First request", activeLayer: "network", layers: [{ id: "memory", label: "Memory cache" }, { id: "disk", label: "Disk cache" }, { id: "network", label: "Network" }], caption: "GET /users — no cache entry → full network fetch.", chapter: "Cache miss" },
  { phase: "Store", activeLayer: "disk", layers: [{ id: "memory", label: "Memory cache", hit: false }, { id: "disk", label: "Disk cache", hit: true, detail: "200 + Cache-Control: max-age=3600" }, { id: "network", label: "Network" }], caption: "Response stored with cache headers." },
  { phase: "Memory hit", activeLayer: "memory", layers: [{ id: "memory", label: "Memory cache", hit: true, detail: "0ms — no network" }, { id: "disk", label: "Disk cache" }, { id: "network", label: "Network" }], chapter: "Cache hit", caption: "Repeat request in same session → memory cache HIT." },
  { phase: "Revalidate", activeLayer: "network", layers: [{ id: "memory", label: "Memory cache", hit: false }, { id: "disk", label: "Disk cache", hit: true }, { id: "network", label: "Network", hit: false, detail: "If-None-Match: etag" }], caption: "max-age expired → conditional request with ETag." },
  { phase: "304", activeLayer: "disk", layers: [{ id: "disk", label: "Disk cache", hit: true, detail: "304 Not Modified" }, { id: "network", label: "Network" }], showResponse: true, status: 304, caption: "Server 304 → reuse cached body. ✓" },
];

const CODE = `// Response headers
Cache-Control: max-age=3600, public
ETag: "abc123"

// Conditional request
If-None-Match: "abc123"
// → 304 Not Modified (no body)`;

export const httpCaching: Topic = {
  id: "http-caching",
  title: "HTTP Caching",
  category: "Protocol",
  blurb: "Memory, disk, ETag, and 304 revalidation.",
  prerequisites: ["http-lifecycle"],
  badges: ["Cache-Control · ETag"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Browsers cache responses per URL. Cache-Control and ETag let servers control freshness. Conditional requests (If-None-Match) avoid re-downloading unchanged bodies via 304.\n\nCritical for API performance and CDN edge caching.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <CacheLayerStack layers={s.layers} activeLayer={s.activeLayer} phase={s.phase} />
        {s.showResponse && <HttpMessage direction="response" status={s.status ?? 304} statusLabel="Not Modified" headers={[{ name: "ETag", value: '"abc123"' }]} />}
      </div>
    ),
  }),
};

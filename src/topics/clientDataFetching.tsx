import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  cache: "empty" | "stale" | "fresh";
  network: boolean;
  data?: string;
}

const build = (): Step[] => [
  { phase: "First fetch", cache: "empty", network: true, chapter: "SWR / React Query", caption: "useQuery('/users') — cache empty → network request, show loading." },
  { phase: "Cached", cache: "fresh", network: false, data: "[users…]", caption: "Response stored. Re-mount component → instant render from cache." },
  { phase: "Stale", cache: "stale", network: false, data: "[users…]", caption: "After staleTime, data shown but marked stale — background refetch starts." },
  { phase: "Revalidate", cache: "stale", network: true, data: "[users…]", caption: "Background fetch returns fresh data → cache updated, UI morphs." },
  { phase: "Deduped", cache: "fresh", network: true, caption: "Two components same key → one network call (request deduplication). ✓" },
];

const CODE = `const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json()),
  staleTime: 30_000,  // fresh for 30s
  gcTime: 5 * 60_000, // garbage-collect after 5m
});`;

export const clientDataFetching: Topic = {
  id: "client-data-fetching",
  title: "Client Data Fetching",
  category: "Performance",
  blurb: "Cache, stale-while-revalidate, and deduplication.",
  prerequisites: ["lru-cache", "http-lifecycle"],
  badges: ["SWR · React Query"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Modern fetch libraries cache by query key, serve cached data instantly, and revalidate in the background. This gives snappy UI with fresh data — the same eviction intuition as LRU, keyed by URL+params.\n\nstaleTime controls freshness; gcTime controls memory.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.active, fontWeight: 700, letterSpacing: 1 }}>{s.phase}</div>
        <div style={{ padding: 16, borderRadius: 12, border: `2px solid ${s.cache === "fresh" ? C.sortedBorder : s.cache === "stale" ? C.activeBorder : C.surfaceBorder}`, background: C.surface, minWidth: 240, textAlign: "center" }}>
          <div style={{ color: C.textMuted, fontSize: 11 }}>CACHE</div>
          <div style={{ fontFamily: FONT_MONO, fontWeight: 700, color: C.text, marginTop: 6 }}>{s.cache.toUpperCase()}</div>
          {s.data && <div style={{ marginTop: 8, color: C.sorted }}>{s.data}</div>}
        </div>
        {s.network && <div style={{ fontFamily: FONT_MONO, color: C.pointer }}>→ network request</div>}
      </div>
    ),
  }),
};

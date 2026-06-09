import { ApiFlow } from "../components/ApiFlow";
import { DomSnippet } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  showServer: boolean;
  showClient: boolean;
  htmlReady: boolean;
  jsAttached: boolean;
  mismatch?: boolean;
}

const build = (): Step[] => [
  { phase: "SSR request", showServer: true, showClient: false, htmlReady: false, jsAttached: false, chapter: "Server render", caption: "Browser requests /dashboard — server renders React to HTML string." },
  { phase: "HTML response", showServer: true, showClient: true, htmlReady: true, jsAttached: false, caption: "Server sends HTML shell with content already in the DOM (fast first paint)." },
  { phase: "Parse HTML", showServer: false, showClient: true, htmlReady: true, jsAttached: false, caption: "Browser paints static HTML immediately — buttons look real but aren't interactive yet." },
  { phase: "Download JS", showServer: false, showClient: true, htmlReady: true, jsAttached: false, chapter: "Hydration", caption: "Client bundle downloads. React loads and walks the existing DOM." },
  { phase: "Attach listeners", showServer: false, showClient: true, htmlReady: true, jsAttached: true, caption: "React attaches event handlers and state — no full re-create if markup matches." },
  { phase: "Interactive", showServer: false, showClient: true, htmlReady: true, jsAttached: true, caption: "Hydration complete — clicks work. ✓" },
  { phase: "Mismatch", showServer: false, showClient: true, htmlReady: true, jsAttached: false, mismatch: true, chapter: "Mismatch", caption: "Server HTML ≠ client render → React discards server nodes and re-renders (bad for perf)." },
];

const CODE = `// Server: renderToString(<App />)
// Client: hydrateRoot(document, <App />);
// React reuses existing DOM nodes when structure matches.
// Mismatch (Date.now(), random ids) forces client re-render.`;

export const hydration: Topic = {
  id: "hydration",
  title: "SSR Hydration",
  category: "Runtime",
  blurb: "Attach React to server-rendered HTML.",
  prerequisites: ["critical-rendering-path", "virtual-dom"],
  badges: ["SSR"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "SSR sends ready-to-paint HTML. Hydration is the client pass where React claims that DOM, wires events, and attaches state without rebuilding nodes when the virtual tree matches.\n\nAvoid non-deterministic markup on server vs client to prevent hydration mismatches.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <ApiFlow phase={s.phase} activeSide={s.showClient && s.showServer ? "both" : s.showServer ? "server" : "client"} clientLabel="Browser" serverLabel="SSR Server" />
        {s.htmlReady && <DomSnippet title="DOM (from HTML)" nodes={[{ tag: "div", text: "Dashboard" }, { tag: "button", text: "Save", state: s.jsAttached ? "active" : "default" }]} highlight={1} />}
        {s.mismatch && <div style={{ fontFamily: FONT_MONO, color: C.compare, fontWeight: 700 }}>⚠ hydration mismatch — client re-render</div>}
        {s.jsAttached && <div style={{ fontFamily: FONT_MONO, color: C.sorted }}>event listeners attached ✓</div>}
      </div>
    ),
  }),
};

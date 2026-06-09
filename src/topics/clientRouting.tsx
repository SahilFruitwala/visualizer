import { RouteDiagram } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO, FONT_SANS } from "../theme";

interface Step extends StepBase {
  url: string;
  matchedRoute: string;
  activeComponent: string;
  phase: string;
  highlightLink?: string;
  showHistory?: boolean;
  historyStack?: string[];
}

const ROUTES = [
  { path: "/", component: "Home" },
  { path: "/users", component: "UserList" },
  { path: "/users/:id", component: "UserDetail" },
];

function build(): Step[] {
  return [
    {
      url: "/",
      matchedRoute: "/",
      activeComponent: "Home",
      phase: "Initial load",
      chapter: "First paint",
      caption: "Browser loads / — router matches path \"/\" → renders <Home />.",
    },
    {
      url: "/",
      matchedRoute: "/",
      activeComponent: "Home",
      phase: "Click link",
      highlightLink: "/users",
      caption: "User clicks <Link to=\"/users\"> — SPA intercepts, no full page reload.",
    },
    {
      url: "/users",
      matchedRoute: "/users",
      activeComponent: "UserList",
      phase: "Navigate",
      showHistory: true,
      historyStack: ["/", "/users"],
      chapter: "history.pushState",
      caption: "Router calls history.pushState — URL bar updates to /users without a network round-trip.",
    },
    {
      url: "/users",
      matchedRoute: "/users",
      activeComponent: "UserList",
      phase: "Match route",
      caption: "Route table: /users matches <UserList /> — outlet swaps from Home to UserList.",
    },
    {
      url: "/users/42",
      matchedRoute: "/users/:id",
      activeComponent: "UserDetail",
      phase: "Dynamic segment",
      chapter: "Params",
      showHistory: true,
      historyStack: ["/", "/users", "/users/42"],
      caption: "Navigate to /users/42 — :id param captured as { id: \"42\" } for <UserDetail />.",
    },
    {
      url: "/users/42",
      matchedRoute: "/users/:id",
      activeComponent: "UserDetail",
      phase: "Data fetch",
      caption: "UserDetail mounts → useEffect fetches user 42 (HTTP request happens here, not on link click).",
    },
    {
      url: "/users",
      matchedRoute: "/users",
      activeComponent: "UserList",
      phase: "Back button",
      chapter: "popstate",
      showHistory: true,
      historyStack: ["/", "/users"],
      caption: "Browser back → popstate event → router reads history and re-renders <UserList />.",
    },
    {
      url: "/nope",
      matchedRoute: "*",
      activeComponent: "NotFound",
      phase: "No match",
      caption: "Unknown path /nope → catch-all route renders <NotFound />. ✓",
      insight: "SPA routing is client-side URL → component mapping; the server still needs a fallback for deep links.",
    },
  ];
}

const CODE = `// React Router (conceptual)
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users" element={<UserList />} />
    <Route path="/users/:id" element={<UserDetail />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

// Link click → pushState + match path → swap outlet
// Back/forward → popstate → re-match`;

function UserDetailPreview({ id }: { id: string }) {
  return (
    <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.text, textAlign: "center" }}>
      <div style={{ fontWeight: 700 }}>&lt;UserDetail /&gt;</div>
      <div style={{ color: C.textMuted, marginTop: 6 }}>params.id = {id}</div>
      <div style={{ color: C.pointer, marginTop: 8, fontSize: 12 }}>fetch(`/api/users/${id}`)</div>
    </div>
  );
}

const STEPS = withCodeLines(build(), (s) => {
  if (s.phase === "Initial load") return [0, 1, 2];
  if (s.caption.includes("pushState")) return [3, 4];
  if (s.caption.includes(":id")) return [2, 3];
  if (s.phase === "Back button") return [5, 6];
  return [0, 1, 2, 3, 4, 5];
});

export const clientRouting: Topic = {
  id: "client-routing",
  title: "Client-Side Routing",
  category: "Navigation",
  blurb: "URL changes without reload — match paths to components.",
  useWhen: "Building SPAs, deep links, or debugging back-button behavior.",
  badges: ["SPA · pushState"],
  prerequisites: ["http-lifecycle"],
  quiz: [
    {
      question: "What API updates the URL without reloading the page?",
      options: ["fetch()", "history.pushState", "document.write", "WebSocket.send"],
      correctIndex: 1,
      explanation: "pushState (and replaceState) change the URL bar; the router listens and swaps components.",
    },
    {
      question: "When does the browser fire popstate?",
      options: ["On every Link click", "On back/forward navigation", "On JSON parse", "On CSS load"],
      correctIndex: 1,
      explanation: "popstate fires when the user moves through session history — the router must re-match the URL.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: STEPS,
      code: CODE,
      explanation:
        "Single-page apps keep one HTML shell. A client router maps URL paths to components: on link click it prevents default navigation, updates history with pushState, matches the new path (including dynamic segments like :id), and swaps the outlet. Data fetching typically happens after the route component mounts.\n\nBack/forward uses the popstate event. Production apps also need server fallback routes so refreshing /users/42 still serves index.html.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <RouteDiagram
            url={s.url}
            matchedRoute={s.matchedRoute}
            routes={ROUTES.map((r) => ({
              ...r,
              active: r.path === s.matchedRoute || (s.matchedRoute === "*" && r.path === "/users/:id"),
            }))}
            activeComponent={s.activeComponent}
            phase={s.phase}
            outlet={
              s.activeComponent === "UserDetail" ? (
                <UserDetailPreview id="42" />
              ) : s.activeComponent === "NotFound" ? (
                <div style={{ fontFamily: FONT_MONO, color: C.compare, fontWeight: 700 }}>404 — Not Found</div>
              ) : undefined
            }
          />
          {s.highlightLink && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: `${C.active}22`,
                border: `2px solid ${C.activeBorder}`,
                fontFamily: FONT_MONO,
                fontSize: 13,
                color: C.text,
                maxWidth: "100%",
                overflowWrap: "anywhere",
              }}
            >
              click → <span style={{ color: C.pointer }}>{s.highlightLink}</span>
            </div>
          )}
          {s.showHistory && s.historyStack && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  letterSpacing: 1,
                  color: C.textMuted,
                  fontWeight: 700,
                }}
              >
                HISTORY STACK
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: "100%" }}>
                {s.historyStack.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: i === s.historyStack!.length - 1 ? `${C.sorted}22` : C.cellMuted,
                      border: `1px solid ${i === s.historyStack!.length - 1 ? C.sortedBorder : C.cellMutedBorder}`,
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      color: C.text,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    }),
};

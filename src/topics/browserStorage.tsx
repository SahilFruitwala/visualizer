import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

type Store = "cookie" | "session" | "local" | "indexed";

interface Step extends StepBase {
  store: Store;
  action: "write" | "read" | "expire" | "scope";
  key: string;
  value?: string;
  sentToServer?: boolean;
  persists?: boolean;
}

const build = (): Step[] => [
  {
    store: "cookie",
    action: "write",
    key: "session_id",
    value: "abc123",
    sentToServer: true,
    persists: true,
    chapter: "Cookies",
    caption: "document.cookie sets a cookie — automatically sent with every request to the domain.",
  },
  {
    store: "cookie",
    action: "scope",
    key: "session_id",
    sentToServer: true,
    caption: "Cookies are domain-scoped and can be HttpOnly (JS can't read) + Secure + SameSite.",
  },
  {
    store: "session",
    action: "write",
    key: "draft",
    value: '{"title":"Hello"}',
    persists: false,
    chapter: "sessionStorage",
    caption: "sessionStorage survives refreshes but clears when the tab closes.",
  },
  {
    store: "local",
    action: "write",
    key: "theme",
    value: "dark",
    persists: true,
    chapter: "localStorage",
    caption: "localStorage persists across tabs and browser restarts (same origin).",
  },
  {
    store: "local",
    action: "read",
    key: "theme",
    value: "dark",
    persists: true,
    caption: "localStorage.getItem('theme') — synchronous, ~5 MB limit per origin.",
  },
  {
    store: "indexed",
    action: "write",
    key: "offline-cache",
    value: "Blob(2.4 MB)",
    persists: true,
    chapter: "IndexedDB",
    caption: "IndexedDB stores structured data & blobs asynchronously — much larger quota.",
  },
  {
    store: "cookie",
    action: "expire",
    key: "session_id",
    sentToServer: false,
    chapter: "Summary",
    caption: "Pick cookies for auth tokens (server-sent), localStorage for prefs, IndexedDB for offline data. ✓",
  },
];

const CODE = `// Cookies — sent automatically, small (~4 KB each)
document.cookie = "theme=dark; Secure; SameSite=Lax";

// HttpOnly auth cookies must be set by the server:
Set-Cookie: sid=abc; Secure; HttpOnly; SameSite=Strict

// sessionStorage — per tab, cleared on close
sessionStorage.setItem("draft", json);

// localStorage — persists across sessions
localStorage.setItem("theme", "dark");

// IndexedDB — async, large structured storage
const db = await openDB("app", 1);`;

const storeLabel: Record<Store, string> = {
  cookie: "Cookie",
  session: "sessionStorage",
  local: "localStorage",
  indexed: "IndexedDB",
};

const storeColor: Record<Store, string> = {
  cookie: C.compare,
  session: C.pointer,
  local: C.active,
  indexed: C.sorted,
};

export const browserStorage: Topic = {
  id: "browser-storage",
  title: "Browser Storage",
  category: "Runtime",
  blurb: "Cookies vs sessionStorage vs localStorage vs IndexedDB.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Cookies are the only storage sent automatically with HTTP requests — use for session IDs (prefer HttpOnly). sessionStorage is tab-scoped. localStorage persists across sessions synchronously. IndexedDB is async and handles large structured data for offline apps.\n\nNever store sensitive tokens in localStorage (XSS can read them).",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", maxWidth: 420 }}>
          <div
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 12,
              background: storeColor[s.store],
              border: `2px solid ${C.surfaceBorder}`,
              fontFamily: FONT_MONO,
            }}
          >
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{storeLabel[s.store]}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {s.action === "read" ? "get" : s.action === "expire" ? "delete" : "set"}("{s.key}"
              {s.value ? `, "${s.value}"` : ""})
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, fontFamily: FONT_SANS, fontSize: 13 }}>
            {s.sentToServer != null && (
              <span style={{ color: s.sentToServer ? C.compare : C.textMuted }}>
                {s.sentToServer ? "↔ sent with requests" : "✗ not sent to server"}
              </span>
            )}
            {s.persists != null && (
              <span style={{ color: s.persists ? C.sorted : C.active }}>
                {s.persists ? "persists" : "tab-scoped"}
              </span>
            )}
          </div>
        </div>
      ),
    }),
};

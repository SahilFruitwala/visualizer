import { ApiFlow, HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, mixProp } from "../theme";

interface Step extends StepBase {
  phase: string;
  uiState: string;
  apiStatus?: number;
  rolledBack?: boolean;
}

const build = (): Step[] => [
  { phase: "Click like", uiState: "♥ Liked (optimistic)", chapter: "Optimistic update", caption: "User taps Like — UI updates immediately before server responds." },
  { phase: "Request in flight", uiState: "♥ Liked", caption: "POST /likes sent in background — user sees instant feedback." },
  { phase: "Success", uiState: "♥ Liked ✓", apiStatus: 201, caption: "Server returns 201 — optimistic state confirmed." },
  { phase: "Failure", uiState: "♡ Like", apiStatus: 500, rolledBack: true, chapter: "Rollback", caption: "Server 500 — rollback UI to previous state, show error toast." },
  { phase: "Done", uiState: "♡ Like", caption: "Optimistic UI feels fast; rollback handles failures honestly. ✓" },
];

const CODE = `async function toggleLike() {
  setLiked(true); // optimistic
  try {
    await fetch('/api/likes', { method: 'POST' });
  } catch {
    setLiked(false); // rollback
    toast.error('Could not save');
  }
}`;

export const optimisticUI: Topic = {
  id: "optimistic-ui",
  title: "Optimistic UI",
  category: "Performance",
  blurb: "Update UI first, confirm with server later.",
  prerequisites: ["rest-crud", "client-data-fetching"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Optimistic updates assume success — the UI changes before the network round-trip. On failure, roll back and notify the user. Common in likes, todos, and chat.\n\nPair with idempotency keys on the server for safe retries.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <ApiFlow phase={s.phase} activeSide="both" direction="right" />
        <div style={{ padding: "14px 24px", borderRadius: 10, background: s.rolledBack ? mixProp("compare", 9) : mixProp("sorted", 9), border: `2px solid ${s.rolledBack ? C.compareBorder : C.sortedBorder}`, fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: C.text }}>{s.uiState}</div>
        {s.apiStatus && <HttpMessage direction="response" status={s.apiStatus} statusLabel={s.apiStatus < 300 ? "Created" : "Error"} />}
      </div>
    ),
  }),
};

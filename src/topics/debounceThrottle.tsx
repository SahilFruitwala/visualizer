import { DebounceTimeline } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  events: { t: number; label: string; dropped?: boolean }[];
  fired: boolean;
  mode: "debounce" | "throttle";
  phase: string;
}

function debounceSteps(): Step[] {
  return [
    { events: [], fired: false, mode: "debounce", phase: "Debounce", chapter: "Rapid input", caption: "User types fast — each keypress fires input event." },
    { events: [{ t: 0, label: "input" }], fired: false, mode: "debounce", phase: "Debounce", caption: "t=0 input → start 300ms timer." },
    { events: [{ t: 0, label: "input" }, { t: 50, label: "input", dropped: true }], fired: false, mode: "debounce", phase: "Debounce", caption: "t=50 another input → cancel previous timer, restart." },
    { events: [{ t: 0, label: "input", dropped: true }, { t: 50, label: "input", dropped: true }, { t: 120, label: "input" }], fired: false, mode: "debounce", phase: "Debounce", caption: "t=120 input → restart timer again." },
    { events: [{ t: 120, label: "input" }], fired: true, mode: "debounce", phase: "Debounce", caption: "t=420 (300ms quiet) → handler runs once. ✓" },
    { events: [], fired: false, mode: "throttle", phase: "Throttle", chapter: "Throttle", caption: "Scroll events fire 60×/sec — throttle caps handler rate." },
    { events: [{ t: 0, label: "scroll" }], fired: true, mode: "throttle", phase: "Throttle", caption: "t=0 scroll → handler runs immediately." },
    { events: [{ t: 0, label: "scroll" }, { t: 16, label: "scroll", dropped: true }, { t: 32, label: "scroll", dropped: true }], fired: false, mode: "throttle", phase: "Throttle", caption: "t=16, t=32 scroll → ignored (within 100ms window)." },
    { events: [{ t: 100, label: "scroll" }], fired: true, mode: "throttle", phase: "Throttle", caption: "t=100 scroll → handler runs again. Max ~10/sec. ✓" },
  ];
}

const CODE = `// Debounce — wait for pause
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Throttle — at most once per window
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}`;

export const debounceThrottle: Topic = {
  id: "debounce-throttle",
  title: "Debounce & Throttle",
  category: "Performance",
  blurb: "Control how often expensive handlers run.",
  useWhen: "Search inputs (debounce) or scroll/resize listeners (throttle).",
  badges: ["rate limit UI"],
  prerequisites: ["sliding-window", "event-loop"],
  shufflable: true,
  quiz: [{ question: "Which waits for the user to stop typing?", options: ["Throttle", "Debounce", "Memo", "Prefetch"], correctIndex: 1, explanation: "Debounce resets a timer on each event and fires after a quiet period." }],
  create: () => defineViz<Step>({ steps: debounceSteps(), code: CODE, explanation: "Debounce collapses a burst of events into one call after activity stops — ideal for search. Throttle guarantees at most one call per interval — ideal for scroll.\n\nBoth prevent layout thrashing and excess network calls.", renderStep: (s) => <DebounceTimeline events={s.events} fired={s.fired} mode={s.mode} phase={s.phase} /> }),
};

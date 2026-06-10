import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

interface Step extends StepBase {
  mainStack: string[];
  workerStack: string[];
  messageFlow: "main→worker" | "worker→main" | "none";
  message?: string;
  mainBlocked: boolean;
}

const build = (): Step[] => [
  {
    mainStack: ["UI render"],
    workerStack: [],
    messageFlow: "none",
    mainBlocked: false,
    chapter: "Main thread",
    caption: "Main thread runs JS, DOM, and rendering — heavy work blocks the UI.",
  },
  {
    mainStack: ["heavyCompute()"],
    workerStack: [],
    messageFlow: "none",
    mainBlocked: true,
    caption: "Long synchronous loop freezes the page — no clicks, no paint.",
  },
  {
    mainStack: ["new Worker()"],
    workerStack: ["worker boot"],
    messageFlow: "main→worker",
    message: "postMessage({ data })",
    mainBlocked: false,
    chapter: "Spawn worker",
    caption: "Web Worker runs in a separate thread — own global scope, no DOM access.",
  },
  {
    mainStack: ["onmessage handler"],
    workerStack: ["process(data)", "compute"],
    messageFlow: "none",
    mainBlocked: false,
    caption: "Worker crunches data off the main thread — UI stays responsive.",
  },
  {
    mainStack: ["onmessage handler"],
    workerStack: ["postMessage(result)"],
    messageFlow: "worker→main",
    message: "postMessage({ result: 42 })",
    mainBlocked: false,
    caption: "Worker posts result back — main thread receives via onmessage.",
  },
  {
    mainStack: ["UI render", "update DOM"],
    workerStack: [],
    messageFlow: "none",
    mainBlocked: false,
    chapter: "Complete",
    caption: "Main thread updates UI with the result. Worker terminated. ✓",
  },
];

const CODE = `// main.js
const worker = new Worker("worker.js");
worker.postMessage(largeDataset);
worker.onmessage = (e) => render(e.data.result);

// worker.js — no DOM, no window
self.onmessage = (e) => {
  const result = heavyCompute(e.data);
  self.postMessage({ result });
};`;

export const webWorkers: Topic = {
  id: "web-workers",
  title: "Web Workers",
  category: "Runtime",
  blurb: "Offload heavy JS to a background thread.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Web Workers run JavaScript in a parallel thread with no shared memory (by default). Communication is via structured postMessage. Use for parsing large files, crypto, image processing — anything that would block the main thread.\n\nWorkers can't touch the DOM. For shared state, use SharedArrayBuffer (with cross-origin isolation).",
      renderStep: (s) => (
        <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "flex-start" }}>
          <ThreadColumn label="Main thread" stack={s.mainStack} blocked={s.mainBlocked} color={C.active} />
          {s.messageFlow !== "none" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 40 }}>
              <span style={{ fontSize: 20, color: C.pointer }}>{s.messageFlow === "main→worker" ? "→" : "←"}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted, maxWidth: 120, textAlign: "center" }}>
                {s.message}
              </span>
            </div>
          )}
          <ThreadColumn label="Worker thread" stack={s.workerStack} blocked={false} color={C.sorted} />
        </div>
      ),
    }),
};

function ThreadColumn({
  label,
  stack,
  blocked,
  color,
}: {
  label: string;
  stack: string[];
  blocked: boolean;
  color: string;
}) {
  return (
    <div style={{ minWidth: 160 }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, marginBottom: 8, color: C.text }}>
        {label}
        {blocked && <span style={{ color: C.compare, marginLeft: 6 }}>BLOCKED</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, minHeight: 120 }}>
        {stack.length === 0 ? (
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>(idle)</div>
        ) : (
          stack.map((fn, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: i === stack.length - 1 ? color : C.default,
                border: `1px solid ${C.surfaceBorder}`,
                fontFamily: FONT_MONO,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {fn}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

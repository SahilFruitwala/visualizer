import { EventLoopDiagram, type QueueItem } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";

interface Step extends StepBase {
  callStack: QueueItem[];
  microtasks: QueueItem[];
  macrotasks: QueueItem[];
  webApi: QueueItem[];
  activeZone: "stack" | "micro" | "macro" | "api" | "render";
  phase: string;
}

function build(): Step[] {
  const sync1: QueueItem = { id: "s1", label: "log('start')", kind: "sync" };
  const sync2: QueueItem = { id: "s2", label: "log('end')", kind: "sync" };
  const micro1: QueueItem = { id: "m1", label: ".then → resolved", kind: "micro" };
  const micro2: QueueItem = { id: "m2", label: "queueMicrotask", kind: "micro" };
  const macro1: QueueItem = { id: "t1", label: "setTimeout cb", kind: "macro" };
  const timer: QueueItem = { id: "api1", label: "Timer(0ms)", kind: "macro" };

  return [
    {
      callStack: [sync1],
      microtasks: [],
      macrotasks: [],
      webApi: [],
      activeZone: "stack",
      phase: "Run script",
      chapter: "Synchronous code",
      caption: "Main script runs — console.log('start') enters the call stack.",
    },
    {
      callStack: [sync1, { id: "p1", label: "Promise.resolve()", kind: "sync" }],
      microtasks: [],
      macrotasks: [],
      webApi: [],
      activeZone: "stack",
      phase: "Promise",
      caption: "Promise.resolve() runs synchronously; .then callback is queued as a microtask.",
    },
    {
      callStack: [],
      microtasks: [micro1],
      macrotasks: [],
      webApi: [],
      activeZone: "micro",
      phase: "Microtask queue",
      caption: "Microtask queue: Promise.then callback waits for the stack to clear.",
    },
    {
      callStack: [{ id: "st1", label: "setTimeout(0)", kind: "sync" }],
      microtasks: [micro1],
      macrotasks: [],
      webApi: [],
      activeZone: "stack",
      phase: "setTimeout",
      chapter: "Macrotasks",
      caption: "setTimeout registers a timer — callback goes to the macrotask queue, not the stack.",
    },
    {
      callStack: [],
      microtasks: [micro1],
      macrotasks: [macro1],
      webApi: [timer],
      activeZone: "api",
      phase: "Web APIs",
      caption: "Web API holds the timer; macrotask queue now has the timeout callback.",
    },
    {
      callStack: [sync2],
      microtasks: [micro1],
      macrotasks: [macro1],
      webApi: [timer],
      activeZone: "stack",
      phase: "Sync finish",
      caption: "console.log('end') runs — synchronous code finishes before any queued callbacks.",
    },
    {
      callStack: [],
      microtasks: [micro1],
      macrotasks: [macro1],
      webApi: [],
      activeZone: "stack",
      phase: "Stack empty",
      chapter: "Drain microtasks",
      caption: "Call stack empty → event loop drains ALL microtasks before the next macrotask.",
    },
    {
      callStack: [micro1],
      microtasks: [],
      macrotasks: [macro1],
      webApi: [],
      activeZone: "micro",
      phase: "Run microtask",
      caption: "Run Promise.then → logs 'resolved'. Microtask queue cleared.",
    },
    {
      callStack: [],
      microtasks: [],
      macrotasks: [macro1],
      webApi: [],
      activeZone: "macro",
      phase: "Macrotask turn",
      chapter: "Next macrotask",
      caption: "Microtasks done → pick next macrotask: setTimeout callback runs.",
    },
    {
      callStack: [macro1],
      microtasks: [],
      macrotasks: [],
      webApi: [],
      activeZone: "macro",
      phase: "Run macrotask",
      caption: "setTimeout logs 'timeout'. Output order: start → end → resolved → timeout.",
    },
    {
      callStack: [],
      microtasks: [micro2],
      macrotasks: [],
      webApi: [],
      activeZone: "micro",
      phase: "Nested microtask",
      chapter: "Nested microtasks",
      caption: "A microtask can enqueue more microtasks — they still run before the next macrotask.",
    },
    {
      callStack: [micro2],
      microtasks: [],
      macrotasks: [],
      webApi: [],
      activeZone: "micro",
      phase: "Drain again",
      caption: "queueMicrotask runs in the same turn. Then the browser may render.",
    },
    {
      callStack: [],
      microtasks: [],
      macrotasks: [],
      webApi: [],
      activeZone: "render",
      phase: "Paint frame",
      chapter: "Render",
      caption: "Stack and queues idle → browser paints pending DOM updates. ✓",
      insight: "Microtasks (Promises) always beat macrotasks (setTimeout, I/O).",
    },
  ];
}

const CODE = `console.log('start');

Promise.resolve().then(() => console.log('resolved'));

setTimeout(() => console.log('timeout'), 0);

console.log('end');

// Output: start → end → resolved → timeout
// Microtasks drain completely before the next macrotask.`;

const STEPS = withCodeLines(build(), (s) => {
  if (s.phase === "Run script") return [0];
  if (s.caption.includes("Promise")) return [1, 2];
  if (s.caption.includes("setTimeout")) return [3, 4];
  if (s.caption.includes("'end'")) return [5];
  if (s.activeZone === "micro" && s.caption.includes("resolved")) return [1, 2];
  if (s.activeZone === "macro") return [3, 4];
  return [0, 1, 2, 3, 4, 5];
});

export const eventLoop: Topic = {
  id: "event-loop",
  title: "JavaScript Event Loop",
  category: "Runtime",
  blurb: "Call stack, microtasks, and macrotasks — what runs when.",
  useWhen: "Debugging async order, Promise timing, or 'why setTimeout(0) runs last'.",
  badges: ["microtasks first"],
  prerequisites: ["queue", "stack"],
  quiz: [
    {
      question: "When does a Promise.then callback run relative to setTimeout(0)?",
      options: ["Before sync code", "After setTimeout", "Before setTimeout", "Random order"],
      correctIndex: 2,
      explanation: "Microtasks (Promises) drain completely after the stack clears but before the next macrotask (setTimeout).",
    },
    {
      question: "What must be empty before microtasks run?",
      options: ["Macrotask queue", "Call stack", "DOM tree", "Network socket"],
      correctIndex: 1,
      explanation: "The event loop only processes queued callbacks when the call stack has no synchronous frames left.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: STEPS,
      code: CODE,
      explanation:
        "JavaScript runs one thing at a time on the call stack. Async work is delegated to Web APIs (timers, fetch, DOM events), and callbacks land in queues. When the stack empties, the event loop drains every microtask (Promises, queueMicrotask) before taking the next macrotask (setTimeout, I/O, render).\n\nThat is why Promise.then beats setTimeout(0), and why long microtask chains can starve rendering.",
      renderStep: (s) => (
        <EventLoopDiagram
          callStack={s.callStack}
          microtasks={s.microtasks}
          macrotasks={s.macrotasks}
          webApi={s.webApi}
          activeZone={s.activeZone}
          phase={s.phase}
        />
      ),
    }),
};

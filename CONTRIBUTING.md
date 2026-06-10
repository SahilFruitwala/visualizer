# Contributing

Thanks for wanting to improve **Dev Visualizer**! Contributions of all sizes are welcome — fixing a
typo in a caption, correcting an algorithm, or adding a whole new topic.

This project is plain **React + TypeScript + Vite**. Every visualization is just a TypeScript file, so
you don't need any special tooling to contribute.

---

## Can I contribute without leaving the browser? Yes.

You do **not** need to clone the repo or install anything to make a change. Two browser-only paths:

### Option A — Edit a single file (quick fixes, typos, a wrong caption)

1. Open the file you want to change on GitHub (every topic lives in
   [`src/topics/`](https://github.com/SahilFruitwala/visualizer/tree/master/src/topics)).
2. Click the **✏️ pencil icon** ("Edit this file"). GitHub forks the repo for you automatically.
3. Make your edit, scroll down, and click **Propose changes** → **Create pull request**.

That's it — no local setup, all in the browser.

### Option B — Full editor in the browser (adding a new topic / multi-file changes)

1. Go to the repo and press the **`.`** (period) key, or change the URL from `github.com/...` to
   [`github.dev/SahilFruitwala/visualizer`](https://github.dev/SahilFruitwala/visualizer).
2. This opens a full **VS Code in your browser** — create files, edit, search, everything.
3. Use the Source Control tab on the left to commit to a new branch and open a pull request.

> Heads-up: the browser editor can't run `npm run dev` to preview animations. For a new topic it's
> often easier to clone locally (below) so you can watch it play. But for content fixes, the browser is
> perfect.

### Option C — Clone locally (best for new topics, lets you preview)

```bash
git clone https://github.com/SahilFruitwala/visualizer.git
cd visualizer
npm install
npm run dev      # live preview at the printed localhost URL
npm run build    # type-check + production build (run this before opening a PR)
```

---

## Fixing content (captions, code, explanations, quizzes)

Each topic is a single file in [`src/topics/`](src/topics) named in `camelCase` (e.g. `binarySearch.tsx`).
Open it and edit in place:

- **Captions / insights** — the `caption` and `insight` strings on each step.
- **Code shown alongside** — the `CODE` template string.
- **Explanation & complexity** — the `explanation` field passed to `defineViz`.
- **Quiz** — the `quiz` array on the exported `Topic`.

Please double-check correctness — this app teaches people, so an off-by-one in a caption matters. See
[`CONTENT_AUDIT.md`](CONTENT_AUDIT.md) for the kinds of errors we watch for.

---

## Adding a new topic

A topic is one self-contained file. The model: an animation is a **precomputed list of immutable
"steps"** (snapshots). The player just walks an index `0 → steps.length - 1`, so playback is
deterministic, scrubbable, and reversible. You build the steps; you don't write any player logic.

### 1. Create `src/topics/yourTopic.tsx`

Use an existing, simple topic as a template — [`binarySearch.tsx`](src/topics/binarySearch.tsx) or
[`stack.tsx`](src/topics/stack.tsx) are good starting points. The shape:

```tsx
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";

// 1. Describe what changes per step (extend StepBase).
interface Step extends StepBase {
  // ...your per-step state, e.g. pointers, highlighted index, etc.
}

// 2. Build the list of snapshots.
function build(/* input */): Step[] {
  const steps: Step[] = [];
  steps.push({
    // ...state
    caption: "One line narrating this step.",   // required
    chapter: "Setup",                            // optional: starts a new chapter
    insight: "Extra context shown at this step.", // optional
  });
  // ...push one step per visible change
  return steps;
}

// 3. The code displayed beside the animation.
const CODE = `function example() {
  // ...
}`;

// 4. Export the Topic.
export const yourTopic: Topic = {
  id: "your-topic",          // kebab-case, unique — becomes part of the URL
  title: "Your Topic",
  category: "Sorting",       // must be one of the Category union in engine/types.ts
  blurb: "One-sentence summary shown in the sidebar / cards.",
  useWhen: "When you'd reach for this (optional).",
  badges: ["O(n log n)", "stable"],   // optional pinned badges
  prerequisites: ["binary-search"],   // optional: other topic ids
  shufflable: true,                   // true if create() randomizes its input
  quiz: [
    {
      question: "...?",
      options: ["a", "b", "c", "d"],
      correctIndex: 1,
      explanation: "Why b is right.",
    },
  ],
  create: () => {
    const steps = build(/* input */);
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation: "Plain-English explanation.\n\nTime: O(...) · Space: O(...)",
      renderStep: (s) => (
        <Row gap={8}>{/* draw this single snapshot */}</Row>
      ),
    });
  },
};
```

Reusable building blocks live in [`src/components/primitives.tsx`](src/components/primitives.tsx)
(`Cell`, `Row`, `PointerTag`, …) and there are richer views like `GraphView`, `Grid`, and `ApiFlow`
for graph/grid/backend topics — see how neighboring topics use them.

To highlight code lines per step, use `withCodeLines` from
[`src/engine/codeLines.ts`](src/engine/codeLines.ts) (see `binarySearch.tsx`).

### 2. Register it

In [`src/topics/index.ts`](src/topics/index.ts):

1. Add an `import { yourTopic } from "./yourTopic";` with the others.
2. Add `yourTopic,` to the `RAW_TOPICS` array under the right category comment.

The category you set on the topic decides which **section** (DS / Algo / BE / FE) it shows up in — that
mapping lives in [`src/sections.ts`](src/sections.ts). If you need a brand-new category, add it to the
`Category` union in [`src/engine/types.ts`](src/engine/types.ts) and to the relevant section in
`sections.ts`.

### 3. Verify

```bash
npm run build   # must pass (type-check + build) before you open a PR
npm run dev     # then click your topic, hit play, and scrub through it
```

---

## Opening the pull request

- Keep PRs focused — one topic or one fix per PR is easiest to review.
- Make sure `npm run build` passes.
- Briefly describe what you changed and why; for a new topic, a short note on the animation idea helps.

Questions or ideas for a topic you can't build yourself? Open an
[issue](https://github.com/SahilFruitwala/visualizer/issues) — suggestions are welcome too.

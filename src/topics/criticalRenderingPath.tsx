import { DomSnippet, PipelineRow } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS, mixProp } from "../theme";

const STAGES = [
  { id: "html", label: "HTML" },
  { id: "dom", label: "DOM" },
  { id: "css", label: "CSS" },
  { id: "cssom", label: "CSSOM" },
  { id: "render", label: "Render tree" },
  { id: "layout", label: "Layout" },
  { id: "paint", label: "Paint" },
  { id: "composite", label: "Composite" },
];

interface Step extends StepBase {
  stageIndex: number;
  phase: string;
  showDom: boolean;
  showCssom: boolean;
  showRender: boolean;
  layoutBox?: { w: number; h: number };
  paintLayers?: number;
}

function build(): Step[] {
  return [
    {
      stageIndex: 0,
      phase: "Parse HTML",
      showDom: false,
      showCssom: false,
      showRender: false,
      chapter: "HTML bytes",
      caption: "Browser receives HTML and the parser tokenizes tags into a DOM tree.",
    },
    {
      stageIndex: 1,
      phase: "Build DOM",
      showDom: true,
      showCssom: false,
      showRender: false,
      caption: "DOM: <html> → <body> → <h1>, <p> — structure only, no styles yet.",
    },
    {
      stageIndex: 2,
      phase: "Parse CSS",
      showDom: true,
      showCssom: false,
      showRender: false,
      chapter: "Stylesheets",
      caption: "Linked CSS is downloaded and parsed in parallel (does not block DOM parsing).",
    },
    {
      stageIndex: 3,
      phase: "Build CSSOM",
      showDom: true,
      showCssom: true,
      showRender: false,
      caption: "CSSOM maps selectors to computed rules — separate tree from the DOM.",
    },
    {
      stageIndex: 4,
      phase: "Render tree",
      showDom: true,
      showCssom: true,
      showRender: true,
      chapter: "Combine",
      caption: "Render tree = DOM nodes that will be painted + their computed styles (skips display:none).",
    },
    {
      stageIndex: 5,
      phase: "Layout",
      showDom: true,
      showCssom: true,
      showRender: true,
      layoutBox: { w: 280, h: 120 },
      chapter: "Geometry",
      caption: "Layout (reflow) computes x/y/width/height for every visible box.",
    },
    {
      stageIndex: 6,
      phase: "Paint",
      showDom: true,
      showCssom: true,
      showRender: true,
      layoutBox: { w: 280, h: 120 },
      paintLayers: 2,
      caption: "Paint fills pixels into layers — text, backgrounds, borders.",
    },
    {
      stageIndex: 7,
      phase: "Composite",
      showDom: true,
      showCssom: true,
      showRender: true,
      layoutBox: { w: 280, h: 120 },
      paintLayers: 3,
      caption: "Compositor merges layers to the screen. First paint complete. ✓",
      insight: "Changing width triggers layout; changing color often only repaints.",
    },
  ];
}

const CODE = `// Critical rendering path (simplified)
// 1. HTML  → DOM tree
// 2. CSS   → CSSOM
// 3. DOM + CSSOM → render tree
// 4. Layout  → box geometry (reflow)
// 5. Paint   → draw pixels into layers
// 6. Composite → merge layers to screen

// Blocking: <script> without defer/async blocks parsing.
// Non-blocking: <link rel="stylesheet"> loads in parallel.`;

const DOM_NODES = [
  { tag: "html", state: "default" as const },
  { tag: "body", state: "default" as const },
  { tag: "h1", text: "Hello", state: "active" as const },
  { tag: "p", text: "World", state: "default" as const },
];

const CSS_NODES = [
  { tag: "h1", text: "font-size: 2rem", state: "active" as const },
  { tag: "p", text: "color: #666", state: "default" as const },
];

export const criticalRenderingPath: Topic = {
  id: "critical-rendering-path",
  title: "Critical Rendering Path",
  category: "Runtime",
  blurb: "From HTML bytes to pixels on screen.",
  useWhen: "Optimizing first paint, layout thrashing, or render-blocking resources.",
  badges: ["DOM → paint"],
  prerequisites: ["http-lifecycle"],
  quiz: [
    {
      question: "What combines the DOM and CSSOM?",
      options: ["JavaScript engine", "Render tree", "Call stack", "HTTP cache"],
      correctIndex: 1,
      explanation: "The render tree links visible DOM nodes to their computed styles from the CSSOM.",
    },
    {
      question: "Which change typically forces layout (reflow)?",
      options: ["Changing text color", "Changing element width", "Adding a CSS class name only", "Composite layer promotion"],
      correctIndex: 1,
      explanation: "Geometry changes (size, position) require layout; many color-only changes can skip to paint.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "The critical rendering path is how the browser turns HTML and CSS into pixels. Parsing builds the DOM and CSSOM; the render tree keeps only what will be painted. Layout computes geometry, paint fills layers, and the compositor merges them to the display.\n\nUnderstanding this pipeline explains why render-blocking scripts delay first paint, why layout thrashing is expensive, and why transform/opacity animations can be GPU-friendly.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", maxWidth: "100%" }}>
          <PipelineRow stages={STAGES} activeIndex={s.stageIndex} phase={s.phase} />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%" }}>
            {s.showDom && <DomSnippet title="DOM" nodes={DOM_NODES} highlight={2} />}
            {s.showCssom && <DomSnippet title="CSSOM" nodes={CSS_NODES} highlight={0} />}
            {s.showRender && (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.surfaceBorder}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: C.textMuted,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Render preview
                </div>
                <div
                  style={{
                    width: s.layoutBox?.w ?? 200,
                    height: s.layoutBox?.h ?? 80,
                    borderRadius: 8,
                    border: `2px solid ${C.sortedBorder}`,
                    background: mixProp("sorted", 7),
                    padding: 12,
                    transition: "width 280ms, height 280ms",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: C.text }}>Hello</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>World</div>
                  {s.paintLayers != null &&
                    Array.from({ length: s.paintLayers }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          bottom: 6 + i * 4,
                          right: 8,
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: C.active,
                          opacity: 0.8,
                        }}
                      >
                        layer {i + 1}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    }),
};

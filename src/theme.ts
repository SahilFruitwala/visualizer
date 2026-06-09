// Shared visual language for all DSA explainer videos.

export const FONT_SANS =
  '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const FONT_MONO =
  '"SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace';

// Semantic palette. State colors are reused across every visualization so the
// viewer learns the language once: amber = looking, red = comparing,
// green = done/found, blue = pointer.
export const C = {
  bgTop: "#131c3a",
  bgBottom: "#070a14",
  surface: "#1b2440",
  surfaceBorder: "#2c3a63",
  text: "#eef2ff",
  textMuted: "#8a96c0",

  default: "#3b4a78",
  defaultBorder: "#5468a8",
  active: "#f5b94a", // currently being looked at
  activeBorder: "#ffd479",
  compare: "#ef6f6c", // pair being compared
  compareBorder: "#ff9a97",
  sorted: "#4ade80", // finalized / found
  sortedBorder: "#86efac",
  pointer: "#60a5fa", // index pointers
  pointerBorder: "#93c5fd",
  highlight: "#a78bfa",
  highlightBorder: "#c4b5fd",
} as const;

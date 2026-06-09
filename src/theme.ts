// Shared visual language for all DSA explainer videos.

export const FONT_SANS =
  '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const FONT_MONO =
  '"SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace';

export type Theme = "dark" | "light";

export type Palette = {
  bgTop: string;
  bgBottom: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  ink: string;
  cellMuted: string;
  cellMutedBorder: string;
  gridDefault: string;
  gridFilled: string;
  gridMuted: string;
  default: string;
  defaultBorder: string;
  active: string;
  activeBorder: string;
  compare: string;
  compareBorder: string;
  sorted: string;
  sortedBorder: string;
  pointer: string;
  pointerBorder: string;
  highlight: string;
  highlightBorder: string;
  rejected: string;
};

const DARK: Palette = {
  bgTop: "#131c3a",
  bgBottom: "#070a14",
  surface: "#1b2440",
  surfaceBorder: "#2c3a63",
  text: "#eef2ff",
  textMuted: "#8a96c0",
  ink: "#0e1424",
  cellMuted: "#222a45",
  cellMutedBorder: "#2c3a63",
  gridDefault: "#141c34",
  gridFilled: "#243056",
  gridMuted: "#11182e",
  default: "#3b4a78",
  defaultBorder: "#5468a8",
  active: "#f5b94a",
  activeBorder: "#ffd479",
  compare: "#ef6f6c",
  compareBorder: "#ff9a97",
  sorted: "#4ade80",
  sortedBorder: "#86efac",
  pointer: "#60a5fa",
  pointerBorder: "#93c5fd",
  highlight: "#a78bfa",
  highlightBorder: "#c4b5fd",
  rejected: "#5a2230",
};

const LIGHT: Palette = {
  bgTop: "#e8edf6",
  bgBottom: "#d8e0ed",
  surface: "#ffffff",
  surfaceBorder: "#b8c4d8",
  text: "#161d33",
  textMuted: "#6a7494",
  ink: "#0e1424",
  cellMuted: "#dce3f0",
  cellMutedBorder: "#b8c4d8",
  gridDefault: "#dce3f0",
  gridFilled: "#c5cfe0",
  gridMuted: "#eef1f8",
  default: "#9aabc4",
  defaultBorder: "#7a8fb0",
  active: "#f5b94a",
  activeBorder: "#d99a20",
  compare: "#ef6f6c",
  compareBorder: "#d94f4c",
  sorted: "#22c55e",
  sortedBorder: "#16a34a",
  pointer: "#3b82f6",
  pointerBorder: "#2563eb",
  highlight: "#8b5cf6",
  highlightBorder: "#7c3aed",
  rejected: "#fca5a5",
};

let activeTheme: Theme =
  (typeof localStorage !== "undefined" && (localStorage.getItem("dsa-theme") as Theme)) || "dark";

export function setActiveTheme(theme: Theme) {
  activeTheme = theme;
}

export function getPalette(theme: Theme = activeTheme): Palette {
  return theme === "light" ? LIGHT : DARK;
}

// Semantic palette. State colors are reused across every visualization so the
// viewer learns the language once: amber = looking, red = comparing,
// green = done/found, blue = pointer.
export const C: Palette = new Proxy(DARK, {
  get(_target, prop: string) {
    return getPalette()[prop as keyof Palette];
  },
}) as Palette;

export const SITE_NAME = "Dev Visualizer";

export const SITE_TAGLINE = "Learn DSA & APIs";

export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const DEFAULT_DESCRIPTION =
  "Interactive animations for learning data structures, algorithms, backend, and frontend concepts. Play, scrub, and step through 100+ topics with code and quizzes.";

export const DEFAULT_KEYWORDS =
  "data structures, algorithms, DSA, visualizer, interactive learning, sorting, graphs, dynamic programming, REST API, HTTP, frontend, backend, computer science";

export const OG_IMAGE_PATH = "/icon.svg";

export const TWITTER_HANDLE = "@SahilFruitwala";

export const SITE_URL = "https://dev-visualizer.sahilfruitwala.com";

/** Absolute origin for OG/sitemap. */
export function siteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return SITE_URL;
}

export function absoluteUrl(path: string): string {
  const origin = siteOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${normalized}` : normalized;
}

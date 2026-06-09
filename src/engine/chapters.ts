import type { StepBase } from "./types";

export interface Chapter {
  title: string;
  step: number;
}

/** Build chapter markers from explicit `chapter` tags on steps. */
export function deriveChapters(steps: StepBase[]): Chapter[] {
  const tagged = steps.flatMap((s, i) => (s.chapter ? [{ title: s.chapter, step: i }] : []));
  if (tagged.length > 0) return tagged;

  // One step = one chapter; short topics without tags still get usable nav.
  if (steps.length <= 8) {
    return steps.map((s, i) => ({
      title: shortenCaption(s.caption),
      step: i,
    }));
  }

  // Long untagged timelines: warn by using coarse caption milestones only.
  const milestones = steps.flatMap((s, i) => {
    const c = s.caption;
    if (i === 0) return [{ title: shortenCaption(c), step: i }];
    if (c.includes("✓") && (c.startsWith("Done") || c.includes("fully") || c.includes("Complete"))) {
      return [{ title: shortenCaption(c), step: i }];
    }
    return [];
  });
  return milestones.length > 1 ? milestones : [{ title: "Walkthrough", step: 0 }];
}

function shortenCaption(caption: string): string {
  const cap = caption.replace(/\s*✓\s*$/, "").trim();
  return cap.length > 40 ? `${cap.slice(0, 37)}…` : cap || "Step";
}

export function chapterAt(chapters: Chapter[], index: number): Chapter {
  let current = chapters[0];
  for (const ch of chapters) {
    if (ch.step <= index) current = ch;
    else break;
  }
  return current;
}

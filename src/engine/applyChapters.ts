import type { StepBase } from "./types";

export type ChapterRule<S extends StepBase = StepBase> = {
  when: (step: S, index: number) => boolean;
  title: string | ((step: S, index: number) => string);
};

/** Tag the first step matching each rule (in order) with a chapter title. */
export function applyChapters<S extends StepBase>(steps: S[], rules: ChapterRule<S>[]): S[] {
  const out = steps.map((s) => ({ ...s }));
  for (const rule of rules) {
    for (let i = 0; i < out.length; i++) {
      if (rule.when(out[i], i)) {
        const title = typeof rule.title === "function" ? rule.title(out[i], i) : rule.title;
        out[i] = { ...out[i], chapter: title };
        break;
      }
    }
  }
  return out;
}

/** Tag every step matching a predicate (e.g. each sorting pass). */
export function applyChaptersEach<S extends StepBase>(
  steps: S[],
  when: (step: S, index: number) => boolean,
  title: string | ((step: S, index: number) => string),
): S[] {
  return steps.map((step, i) => {
    if (!when(step, i)) return step;
    const ch = typeof title === "function" ? title(step, i) : title;
    return { ...step, chapter: ch };
  });
}

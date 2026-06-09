import type { StepBase } from "./types";

/** Attach code line highlights to steps from a mapper function. */
export function withCodeLines<S extends StepBase>(
  steps: S[],
  map: (step: S, index: number) => number[] | undefined,
): S[] {
  return steps.map((s, i) => {
    const lines = map(s, i);
    return lines && lines.length > 0 ? { ...s, codeLines: lines } : s;
  });
}

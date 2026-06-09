import type { ReactNode } from "react";

// Every animation is a precomputed list of immutable "steps" (snapshots).
// The player just walks an index from 0..steps.length-1, so playback is
// deterministic, scrubbable, and trivially reversible.
export interface StepBase {
  /** One line narrating what happens at this step. */
  caption: string;
  /** 0-based code line indices to highlight at this step. */
  codeLines?: number[];
  /** When set on a step, starts a new chapter at this index. */
  chapter?: string;
  /** Extra context shown only at this step (below the caption). */
  insight?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Viz<S extends StepBase = StepBase> {
  steps: S[];
  /** Draw a single step. Receives the step and its index. */
  renderStep: (step: S, index: number) => ReactNode;
  /** The algorithm in code, shown alongside the animation. */
  code: string;
  /** Plain-English explanation / complexity notes (markdown-ish plain text). */
  explanation: string;
  /** Optional 0-based line numbers to highlight per step (same length as steps). */
}

export type Category =
  | "Sorting"
  | "Searching"
  | "Data Structures"
  | "Trees & Graphs"
  | "Dynamic Programming"
  | "Backtracking"
  | "Techniques"
  | "Strings"
  | "API";

export interface Topic {
  id: string;
  title: string;
  category: Category;
  blurb: string;
  /** One-line "use when" hint for algorithm/API selection. */
  useWhen?: string;
  /** Pinned complexity / property badges (e.g. "O(n log n) · stable"). */
  badges?: string[];
  /** Topic ids that help to know first. */
  prerequisites?: string[];
  /** Optional end-of-topic quiz. */
  quiz?: QuizQuestion[];
  /** When true, create() varies its input — show the shuffle control. */
  shufflable?: boolean;
  /** Builds a fresh visualization (so "shuffle"/replay can regenerate input). */
  create: () => Viz<StepBase>;
}

// Small helper so topic files keep full type-safety on their own Step type
// while still satisfying the erased Topic.create signature.
export function defineViz<S extends StepBase>(viz: Viz<S>): Viz<StepBase> {
  return viz as unknown as Viz<StepBase>;
}

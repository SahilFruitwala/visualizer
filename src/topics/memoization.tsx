import { RerenderTree } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  phase: string;
  depsChanged: boolean;
  recomputed: boolean;
  result: string;
}

const build = (): Step[] => [
  { phase: "First render", depsChanged: true, recomputed: true, result: "sorted: [1,3,5]", chapter: "useMemo", caption: "useMemo(() => sort(data), [data]) — data new → run sort, cache result." },
  { phase: "Parent re-render", depsChanged: false, recomputed: false, result: "sorted: [1,3,5]", caption: "Parent re-renders, data ref same → return cached sort (skip O(n log n))." },
  { phase: "Data changes", depsChanged: true, recomputed: true, result: "sorted: [2,4,6]", caption: "data reference changes → deps changed → recompute." },
  { phase: "useCallback", depsChanged: false, recomputed: false, result: "stable onClick ref", chapter: "useCallback", caption: "useCallback(fn, [id]) keeps function identity → child memo not broken." },
  { phase: "Done", depsChanged: false, recomputed: false, result: "cache hit ✓", caption: "Memoization trades memory for CPU — only worth expensive pure work." },
];

const CODE = `const sorted = useMemo(() => expensiveSort(data), [data]);
const onClick = useCallback(() => save(id), [id]);
// React.memo + useCallback prevent child re-renders
// when parent passes stable props.`;

export const memoization: Topic = {
  id: "memoization",
  title: "Memoization",
  category: "Rendering",
  blurb: "useMemo and useCallback skip redundant work.",
  prerequisites: ["component-rerenders"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "useMemo caches a computed value between renders when dependencies are unchanged. useCallback caches a function reference. Pair with React.memo on children to prevent cascade re-renders.\n\nDon't memo everything — measure first.",
    renderStep: (s) => (
      <RerenderTree
        phase={s.phase}
        nodes={[
          { id: "1", label: s.recomputed ? "recompute()" : "cache hit", state: s.recomputed ? "render" : "skip" },
          { id: "2", label: s.result, state: s.depsChanged ? "changed" : "default" },
        ]}
      />
    ),
  }),
};

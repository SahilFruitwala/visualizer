import { applyChapters, applyChaptersEach } from "./applyChapters";
import type { StepBase } from "./types";

type Step = StepBase & Record<string, unknown>;

/** Add concept-based chapter tags; explicit per-step chapters are preserved. */
export function tagTopicChapters(topicId: string, steps: StepBase[]): StepBase[] {
  const tagger = TAGGERS[topicId];
  if (!tagger) return steps;
  return preserveChapters(steps, tagger(steps as Step[]));
}

function preserveChapters<T extends StepBase>(original: T[], updated: T[]): T[] {
  return updated.map((s, i) => ({
    ...s,
    chapter: original[i]?.chapter ?? s.chapter,
  }));
}

const TAGGERS: Record<string, (steps: Step[]) => Step[]> = {
  "bubble-sort": (steps) => {
    let pass = 0;
    return steps.map((s) => {
      if (s.chapter) return s;
      if (s.caption.startsWith("Compare a[0]")) {
        pass += 1;
        return { ...s, chapter: `Pass ${pass}` };
      }
      return s;
    });
  },

  "insertion-sort": (steps) =>
    applyChapters(
      applyChaptersEach(
        steps,
        (s) => s.caption.startsWith("Take a["),
        (s) => {
          const m = s.caption.match(/a\[(\d+)\]/);
          return m ? `Insert a[${m[1]}]` : "Insert";
        },
      ),
      [
        { when: (s) => s.caption.startsWith("Grow a sorted"), title: "Overview" },
        { when: (s) => s.caption.includes("fully sorted"), title: "Complete" },
      ],
    ),

  "selection-sort": (steps) =>
    applyChapters(
      applyChaptersEach(
        steps,
        (s) => /^Pass \d+:/.test(s.caption),
        (s) => {
          const m = s.caption.match(/^Pass (\d+):/);
          return m ? `Pass ${m[1]}` : "Pass";
        },
      ),
      [
        { when: (s) => s.caption.startsWith("Find the"), title: "Overview" },
        { when: (s) => s.caption.includes("fully sorted"), title: "Complete" },
      ],
    ),

  "merge-sort": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Merge Sort:"), title: "Overview" },
      { when: (s) => s.caption.startsWith("Split"), title: "Divide" },
      { when: (s) => s.caption.startsWith("Merge:"), title: "Merge runs" },
      { when: (s) => s.caption.includes("fully sorted"), title: "Complete" },
    ]),

  "quick-sort": (steps) =>
    applyChapters(
      applyChaptersEach(steps, (s) => s.caption.startsWith("Partition ["), (s) => {
        const m = s.caption.match(/Partition \[(\d+)\.\.(\d+)\]/);
        return m ? `Partition [${m[1]}..${m[2]}]` : "Partition";
      }),
      [
        { when: (s) => s.caption.startsWith("Quick Sort:"), title: "Overview" },
        { when: (s) => s.caption.includes("fully sorted"), title: "Complete" },
      ],
    ),

  "heap-sort": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Heap Sort:"), title: "Overview" },
      { when: (s) => s.caption.includes("Heapify"), title: "Build max-heap" },
      { when: (s) => s.caption.includes("Max-heap built"), title: "Heap ready" },
      { when: (s) => s.caption.startsWith("Move max"), title: "Extract max" },
      { when: (s) => s.caption.includes("fully sorted") || s.caption.includes("Sorted"), title: "Complete" },
    ]),

  "shell-sort": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.includes("gap ="), (s) => {
      const m = s.caption.match(/gap = (\d+)/);
      return m ? `Gap ${m[1]}` : "Gap pass";
    }),

  "counting-sort": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Count") || s.caption.includes("frequencies"), title: "Count" },
      { when: (s) => s.caption.includes("Emit") || s.caption.includes("output"), title: "Emit" },
      { when: (s) => s.caption.includes("Done") || s.caption.includes("sorted"), title: "Complete" },
    ]),

  "radix-sort": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.includes("digit") && s.caption.includes("place"), (s) => {
      const m = s.caption.match(/place (\d+)/i) ?? s.caption.match(/digit (\d+)/i);
      return m ? `Digit place ${m[1]}` : "Digit pass";
    }),

  "linear-search": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Look for"), title: "Setup" },
      { when: (s) => s.caption.includes("found!"), title: "Found" },
      { when: (s) => s.caption.includes("not found"), title: "Not found" },
    ]),

  "binary-search": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Search a sorted"), title: "Setup" },
      { when: (s) => s.caption.includes("found at"), title: "Found" },
      { when: (s) => s.caption.includes("not present"), title: "Not found" },
    ]),

  "two-pointers": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Sorted array"), title: "Setup" },
      { when: (s) => s.caption.includes("found"), title: "Found" },
      { when: (s) => s.caption.includes("No pair"), title: "No pair" },
    ]),

  "sliding-window": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.startsWith("Sum the first"), title: "Initial window" },
      { when: (s) => s.caption.startsWith("Slide:"), title: "Slide window" },
      { when: (s) => s.caption.startsWith("Max sum"), title: "Best result" },
    ]),

  "prefix-sum": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("prefix") && !s.caption.includes("query"), title: "Build prefix table" },
      { when: (s) => s.caption.includes("query") || s.caption.includes("sum("), title: "Range query" },
    ]),

  "kadane": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Initialize") || s.caption.startsWith("Kadane"), title: "Setup" },
      { when: (s) => s.caption.includes("extend") || s.caption.includes("restart"), title: "Scan array" },
      { when: (s) => s.caption.includes("Maximum"), title: "Result" },
    ]),

  "fibonacci": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("tabulation") || s.caption.startsWith("Bottom"), title: "Setup" },
      { when: (s) => s.caption.includes("base") || s.caption.includes("dp[0]"), title: "Base cases" },
      { when: (s) => s.caption.includes("dp["), title: "Fill table" },
      { when: (s) => s.caption.includes("F(") || s.caption.includes("Result"), title: "Answer" },
    ]),

  "climbing-stairs": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("stairs"), title: "Problem" },
      { when: (s) => s.caption.includes("base"), title: "Base cases" },
      { when: (s) => s.caption.includes("ways"), title: "Fill DP" },
    ]),

  "coin-change": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.startsWith("Use coin"), (s) => {
      const m = s.caption.match(/coin (\d+)/);
      return m ? `Coin ${m[1]}` : "Process coin";
    }),

  "knapsack": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("items") || s.caption.startsWith("0/1"), title: "Problem setup" },
      { when: (s) => s.caption.includes("dp["), title: "Fill table" },
      { when: (s) => s.caption.includes("optimal") || s.caption.includes("max value"), title: "Optimal value" },
    ]),

  lcs: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("LCS") || s.caption.includes("strings"), title: "Setup" },
      { when: (s) => s.caption.includes("Compare"), title: "Fill table" },
      { when: (s) => s.caption.includes("length"), title: "LCS length" },
    ]),

  "edit-distance": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("edit") || s.caption.includes("strings"), title: "Setup" },
      { when: (s) => s.caption.includes("cell"), title: "Fill table" },
      { when: (s) => s.caption.includes("distance"), title: "Edit distance" },
    ]),

  subsets: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("include") || s.caption.includes("exclude"), title: "Include / exclude" },
      { when: (s) => s.caption.includes("subsets"), title: "All subsets" },
    ]),

  permutations: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Arrange") || s.caption.includes("pick"), title: "Pick unused" },
      { when: (s) => s.caption.includes("permutations"), title: "All permutations" },
    ]),

  "n-queens": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("N-Queens") || s.caption.includes("place"), title: "Problem" },
      { when: (s) => s.caption.includes("row"), title: "Search rows" },
      { when: (s) => s.caption.includes("Solution"), title: "Solution" },
    ]),

  kmp: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.phase === "lps" && s.caption.includes("build"), title: "Build LPS" },
      { when: (s) => s.phase === "lps" && s.caption.includes("done"), title: "LPS complete" },
      { when: (s) => s.phase === "search" && s.caption.includes("without ever moving"), title: "Search text" },
      { when: (s) => s.status === "found", title: "Match found" },
    ]),

  "rabin-karp": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("hash") || s.caption.includes("Hash"), title: "Hash setup" },
      { when: (s) => s.caption.includes("window") || s.caption.includes("checking"), title: "Rolling scan" },
      { when: (s) => s.caption.includes("found") || s.caption.includes("Done"), title: "Result" },
    ]),

  stack: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("LIFO"), title: "Introduction" },
      { when: (s) => s.caption.startsWith("push"), title: "Push" },
      { when: (s) => s.caption.startsWith("pop"), title: "Pop" },
      { when: (s) => s.caption.startsWith("Done"), title: "Summary" },
    ]),

  queue: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("FIFO"), title: "Introduction" },
      { when: (s) => s.caption.startsWith("enqueue"), title: "Enqueue" },
      { when: (s) => s.caption.startsWith("dequeue"), title: "Dequeue" },
      { when: (s) => s.caption.startsWith("Done"), title: "Summary" },
    ]),

  deque: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("deque") || s.caption.includes("both ends"), title: "Overview" },
      { when: (s) => s.caption.includes("push") || s.caption.includes("pop"), title: "Operations" },
    ]),

  "linked-list": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("chain") || s.caption.includes("nodes"), title: "Structure" },
      { when: (s) => s.caption.includes("Append"), title: "Append" },
      { when: (s) => s.caption.includes("Insert at head"), title: "Insert at head" },
      { when: (s) => s.caption.includes("Traverse"), title: "Traverse" },
    ]),

  "hash-table": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.includes("insert") || s.caption.includes("Insert"), (s) => {
      const m = s.caption.match(/['"]?(\w+)['"]?/);
      return m ? `Insert ${m[1]}` : "Insert";
    }),

  heap: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("heap") || s.caption.includes("Min-heap"), title: "Heap intro" },
      { when: (s) => s.caption.includes("Insert") || s.caption.includes("sift up"), title: "Insert" },
      { when: (s) => s.caption.includes("extract") || s.caption.includes("pop"), title: "Extract min" },
    ]),

  bst: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("BST") || s.caption.includes("ordered"), title: "BST property" },
      { when: (s) => s.caption.includes("Insert"), title: "Insert" },
      { when: (s) => s.caption.includes("Search"), title: "Search" },
    ]),

  "avl-tree": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.includes("Insert"), (s) => {
      const m = s.caption.match(/Insert (\d+)/);
      return m ? `Insert ${m[1]}` : "Insert & balance";
    }),

  trie: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("prefix") || s.caption.includes("Trie"), title: "Trie intro" },
      { when: (s) => s.caption.includes("Insert"), title: "Insert words" },
      { when: (s) => s.caption.includes("Search"), title: "Search" },
    ]),

  "segment-tree": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("segment") || s.caption.includes("Overview"), title: "Overview" },
      { when: (s) => s.caption.includes("Build") || s.caption.includes("leaf"), title: "Build tree" },
      { when: (s) => s.caption.includes("query") || s.caption.includes("Query"), title: "Range query" },
    ]),

  "fenwick-tree": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Fenwick tree"), title: "BIT intro" },
      { when: (s) => s.caption.includes("add "), title: "Build tree" },
      { when: (s) => s.caption.includes("prefix("), title: "Prefix query" },
      { when: (s) => s.caption.includes("Sum of first"), title: "Result" },
    ]),

  "union-find": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Union-Find") || s.caption.includes("DSU"), title: "DSU intro" },
      { when: (s) => s.caption.includes("union"), title: "Union" },
      { when: (s) => s.caption.includes("connected") || s.caption.includes("same set"), title: "Find" },
    ]),

  bfs: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("level by level"), title: "Introduction" },
      { when: (s) => s.caption.includes("Enqueue start"), title: "Enqueue start" },
      { when: (s) => s.caption.includes("Dequeue"), title: "BFS loop" },
      { when: (s) => s.caption.includes("BFS order"), title: "BFS order" },
    ]),

  dfs: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Dive deep") || s.caption.includes("DFS"), title: "DFS intro" },
      { when: (s) => s.caption.includes("Visit"), title: "Visit & recurse" },
      { when: (s) => s.caption.includes("DFS order"), title: "DFS order" },
    ]),

  "tree-traversal": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("In-order"), title: "In-order intro" },
      { when: (s) => s.caption.includes("Visit"), title: "DFS walk" },
      { when: (s) => s.caption.includes("output"), title: "Sorted output" },
    ]),

  dijkstra: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Initialize") || s.caption.includes("distances"), title: "Initialize" },
      { when: (s) => s.caption.includes("Pick") || s.caption.includes("nearest"), title: "Main loop" },
      { when: (s) => s.caption.includes("Shortest"), title: "Shortest paths" },
    ]),

  "bellman-ford": (steps) =>
    applyChaptersEach(steps, (s) => s.caption.includes("Pass"), (s) => {
      const m = s.caption.match(/Pass (\d+)/);
      return m ? `Relaxation pass ${m[1]}` : "Relaxation pass";
    }),

  "a-star": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("f = g + h") || s.caption.includes("heuristic"), title: "A* intro" },
      { when: (s) => s.caption.includes("Expand") || s.caption.includes("open"), title: "Expand open set" },
      { when: (s) => s.caption.includes("Path"), title: "Path found" },
    ]),

  prim: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Prim") || s.caption.includes("MST"), title: "Prim intro" },
      { when: (s) => s.caption.includes("Add edge") || s.caption.includes("cheapest"), title: "Grow MST" },
      { when: (s) => s.caption.includes("complete"), title: "MST complete" },
    ]),

  kruskal: (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Kruskal"), title: "Kruskal intro" },
      { when: (s) => s.caption.includes("edge") || s.caption.includes("Consider"), title: "Consider edges" },
      { when: (s) => s.caption.includes("MST"), title: "MST complete" },
    ]),

  "topological-sort": (steps) =>
    applyChapters(steps, [
      { when: (s) => s.caption.includes("Kahn"), title: "Kahn intro" },
      { when: (s) => s.caption.includes("Output"), title: "Process queue" },
      { when: (s) => s.caption.includes("order"), title: "Topological order" },
    ]),
};

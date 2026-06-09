import type { Topic } from "../engine/types";

import { bubbleSort } from "./bubbleSort";
import { selectionSort } from "./selectionSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { heapSort } from "./heapSort";
import { shellSort } from "./shellSort";
import { countingSort } from "./countingSort";
import { radixSort } from "./radixSort";
import { linearSearch } from "./linearSearch";
import { binarySearch } from "./binarySearch";
import { stack } from "./stack";
import { queue } from "./queue";
import { deque } from "./deque";
import { linkedList } from "./linkedList";
import { heap } from "./heap";
import { hashTable } from "./hashTable";
import { bst } from "./bst";
import { avlTree } from "./avlTree";
import { trie } from "./trie";
import { segmentTree } from "./segmentTree";
import { fenwick } from "./fenwick";
import { unionFind } from "./unionFind";
import { treeTraversal } from "./treeTraversal";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { bellmanFord } from "./bellmanFord";
import { topologicalSort } from "./topologicalSort";
import { kruskal } from "./kruskal";
import { prim } from "./prim";
import { aStar } from "./aStar";
import { kmp } from "./kmp";
import { rabinKarp } from "./rabinKarp";
import { fibonacci } from "./fibonacci";
import { climbingStairs } from "./climbingStairs";
import { coinChange } from "./coinChange";
import { knapsack } from "./knapsack";
import { lcs } from "./lcs";
import { editDistance } from "./editDistance";
import { kadane } from "./kadane";
import { nQueens } from "./nQueens";
import { subsets } from "./subsets";
import { permutations } from "./permutations";
import { twoPointers } from "./twoPointers";
import { slidingWindow } from "./slidingWindow";
import { prefixSum } from "./prefixSum";
import { httpLifecycle } from "./httpLifecycle";
import { restCrud } from "./restCrud";
import { httpStatusCodes } from "./httpStatusCodes";
import { bearerAuth } from "./bearerAuth";
import { pagination } from "./pagination";
import { rateLimiting } from "./rateLimiting";

// The full catalogue. Add new topics here — order within a category is preserved.
export const TOPICS: Topic[] = [
  // Sorting
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  // Searching
  linearSearch,
  binarySearch,
  // Data Structures
  stack,
  queue,
  deque,
  linkedList,
  hashTable,
  heap,
  bst,
  avlTree,
  trie,
  segmentTree,
  fenwick,
  unionFind,
  // Trees & Graphs
  treeTraversal,
  bfs,
  dfs,
  dijkstra,
  bellmanFord,
  topologicalSort,
  kruskal,
  prim,
  aStar,
  // Dynamic Programming
  fibonacci,
  climbingStairs,
  kadane,
  coinChange,
  knapsack,
  lcs,
  editDistance,
  // Backtracking
  nQueens,
  subsets,
  permutations,
  // Techniques
  twoPointers,
  slidingWindow,
  prefixSum,
  // Strings
  kmp,
  rabinKarp,
  // API
  httpLifecycle,
  restCrud,
  httpStatusCodes,
  bearerAuth,
  pagination,
  rateLimiting,
];

export const CATEGORIES = [
  "Sorting",
  "Searching",
  "Data Structures",
  "Trees & Graphs",
  "Dynamic Programming",
  "Backtracking",
  "Techniques",
  "Strings",
  "API",
] as const;

export function topicsByCategory() {
  return CATEGORIES.map((cat) => ({
    category: cat,
    topics: TOPICS.filter((t) => t.category === cat),
  })).filter((g) => g.topics.length > 0);
}

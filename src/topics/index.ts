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
import { lruCache } from "./lruCache";
import { treeTraversal } from "./treeTraversal";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { bellmanFord } from "./bellmanFord";
import { topologicalSort } from "./topologicalSort";
import { kruskal } from "./kruskal";
import { prim } from "./prim";
import { aStar } from "./aStar";
import { floydWarshall } from "./floydWarshall";
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
import { monotonicStack } from "./monotonicStack";
import { binarySearchOnAnswer } from "./binarySearchOnAnswer";
import { httpLifecycle } from "./httpLifecycle";
import { restCrud } from "./restCrud";
import { httpStatusCodes } from "./httpStatusCodes";
import { bearerAuth } from "./bearerAuth";
import { oauth2 } from "./oauth2";
import { pagination } from "./pagination";
import { rateLimiting } from "./rateLimiting";
import { cors } from "./cors";
import { apiVersioning } from "./apiVersioning";
import { webhooks } from "./webhooks";
import { tlsHandshake } from "./tlsHandshake";
import { websocketsSse } from "./websocketsSse";
import { apiTypes } from "./apiTypes";

// The full catalogue. Order within a category is preserved in the sidebar.
export const TOPICS: Topic[] = [
  // Linear
  stack,
  queue,
  deque,
  linkedList,
  // Hashing
  hashTable,
  lruCache,
  // Trees
  bst,
  avlTree,
  trie,
  heap,
  // Advanced
  segmentTree,
  fenwick,
  unionFind,
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
  // Tree Algorithms
  treeTraversal,
  // Graph Algorithms
  bfs,
  dfs,
  dijkstra,
  bellmanFord,
  topologicalSort,
  kruskal,
  prim,
  aStar,
  floydWarshall,
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
  monotonicStack,
  binarySearchOnAnswer,
  // Strings
  kmp,
  rabinKarp,
  // Protocol
  httpLifecycle,
  tlsHandshake,
  // REST & Design
  restCrud,
  httpStatusCodes,
  apiTypes,
  apiVersioning,
  // Auth & Security
  cors,
  bearerAuth,
  oauth2,
  // Operations
  pagination,
  rateLimiting,
  webhooks,
  websocketsSse,
];

export const CATEGORIES = [
  "Linear",
  "Hashing",
  "Trees",
  "Advanced",
  "Sorting",
  "Searching",
  "Tree Algorithms",
  "Graph Algorithms",
  "Dynamic Programming",
  "Backtracking",
  "Techniques",
  "Strings",
  "Protocol",
  "REST & Design",
  "Auth & Security",
  "Operations",
] as const;

export function topicsByCategory() {
  return CATEGORIES.map((cat) => ({
    category: cat,
    topics: TOPICS.filter((t) => t.category === cat),
  })).filter((g) => g.topics.length > 0);
}

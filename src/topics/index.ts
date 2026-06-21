import type { Topic } from "../engine/types";
import { enrichTopic } from "../engine/enrichTopic";

import { bubbleSort } from "./bubbleSort";
import { selectionSort } from "./selectionSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { heapSort } from "./heapSort";
import { shellSort } from "./shellSort";
import { countingSort } from "./countingSort";
import { radixSort } from "./radixSort";
import { bucketSort } from "./bucketSort";
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
import { longestIncreasingSubsequence } from "./longestIncreasingSubsequence";
import { coinChange } from "./coinChange";
import { knapsack } from "./knapsack";
import { lcs } from "./lcs";
import { editDistance } from "./editDistance";
import { kadane } from "./kadane";
import { nQueens } from "./nQueens";
import { subsets } from "./subsets";
import { permutations } from "./permutations";
import { twoPointers } from "./twoPointers";
import { greedyActivity } from "./greedyActivity";
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
import { csrfProtection } from "./csrfProtection";
import { apiVersioning } from "./apiVersioning";
import { webhooks } from "./webhooks";
import { tlsHandshake } from "./tlsHandshake";
import { tcpHandshake } from "./tcpHandshake";
import { dnsResolution } from "./dnsResolution";
import { loadBalancing } from "./loadBalancing";
import { websocketsSse } from "./websocketsSse";
import { apiTypes } from "./apiTypes";
import { eventLoop } from "./eventLoop";
import { criticalRenderingPath } from "./criticalRenderingPath";
import { browserStorage } from "./browserStorage";
import { webWorkers } from "./webWorkers";
import { virtualDom } from "./virtualDom";
import { clientRouting } from "./clientRouting";
import { listVirtualization } from "./listVirtualization";
import { debounceThrottle } from "./debounceThrottle";
import { componentRerenders } from "./componentRerenders";
import { hydration } from "./hydration";
import { clientDataFetching } from "./clientDataFetching";
import { memoization } from "./memoization";
import { flexboxBoxModel } from "./flexboxBoxModel";
import { cssGrid } from "./cssGrid";
import { optimisticUI } from "./optimisticUI";
import { httpCaching } from "./httpCaching";
import { idempotencyRetries } from "./idempotencyRetries";
import { graphqlVsRest } from "./graphqlVsRest";
import { grpcProtobuf } from "./grpcProtobuf";
import { jwtStructure } from "./jwtStructure";
import { bloomFilter } from "./bloomFilter";
import { skipList } from "./skipList";
import { tarjanScc } from "./tarjanScc";
import { meetInMiddle } from "./meetInMiddle";
import { recursionCallStack } from "./recursionCallStack";
import { bitmaskDp } from "./bitmaskDp";
import { zAlgorithm } from "./zAlgorithm";
import { treeTraversalOrders } from "./treeTraversalOrders";
import { dbIndex } from "./dbIndex";
import { dbJoin } from "./dbJoin";
import { dbCursorOffset } from "./dbCursorOffset";

// The full catalogue. Order within a category is preserved in the sidebar.
const RAW_TOPICS: Topic[] = [
  // Linear
  stack,
  queue,
  deque,
  linkedList,
  // Hashing
  hashTable,
  bloomFilter,
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
  skipList,
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
  bucketSort,
  // Searching
  linearSearch,
  binarySearch,
  // Tree Algorithms
  treeTraversal,
  treeTraversalOrders,
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
  tarjanScc,
  // Dynamic Programming
  fibonacci,
  climbingStairs,
  longestIncreasingSubsequence,
  kadane,
  coinChange,
  knapsack,
  lcs,
  editDistance,
  bitmaskDp,
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
  meetInMiddle,
  recursionCallStack,
  // Greedy
  greedyActivity,
  // Strings
  kmp,
  rabinKarp,
  zAlgorithm,
  // Protocol
  httpLifecycle,
  dnsResolution,
  tcpHandshake,
  httpCaching,
  tlsHandshake,
  // REST & Design
  restCrud,
  httpStatusCodes,
  apiTypes,
  apiVersioning,
  graphqlVsRest,
  grpcProtobuf,
  // Auth & Security
  cors,
  csrfProtection,
  bearerAuth,
  oauth2,
  jwtStructure,
  // Operations
  pagination,
  rateLimiting,
  loadBalancing,
  webhooks,
  websocketsSse,
  idempotencyRetries,
  // Database
  dbIndex,
  dbJoin,
  dbCursorOffset,
  // Runtime
  criticalRenderingPath,
  browserStorage,
  eventLoop,
  webWorkers,
  hydration,
  // Rendering
  virtualDom,
  componentRerenders,
  memoization,
  // Navigation
  clientRouting,
  // Layout & CSS
  flexboxBoxModel,
  cssGrid,
  // Performance
  debounceThrottle,
  listVirtualization,
  clientDataFetching,
  optimisticUI,
];

export const TOPICS: Topic[] = RAW_TOPICS.map(enrichTopic);

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
  "Greedy",
  "Strings",
  "Protocol",
  "REST & Design",
  "Auth & Security",
  "Operations",
  "Database",
  "Runtime",
  "Rendering",
  "Navigation",
  "Layout & CSS",
  "Performance",
] as const;

export function topicsByCategory() {
  return CATEGORIES.map((cat) => ({
    category: cat,
    topics: TOPICS.filter((t) => t.category === cat),
  })).filter((g) => g.topics.length > 0);
}

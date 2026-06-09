export interface LearningPath {
  id: string;
  title: string;
  topicIds: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "sorting",
    title: "Sorting fundamentals",
    topicIds: ["bubble-sort", "insertion-sort", "merge-sort", "quick-sort"],
  },
  {
    id: "searching",
    title: "Searching",
    topicIds: ["linear-search", "binary-search"],
  },
  {
    id: "graphs",
    title: "Graph traversal",
    topicIds: ["bfs", "dfs", "dijkstra", "floyd-warshall"],
  },
  {
    id: "cache-patterns",
    title: "Cache & eviction",
    topicIds: ["hash-table", "linked-list", "lru-cache"],
  },
  {
    id: "technique-patterns",
    title: "Problem-solving patterns",
    topicIds: ["binary-search", "binary-search-on-answer", "monotonic-stack"],
  },
  {
    id: "backend-basics",
    title: "Backend essentials",
    topicIds: [
      "http-lifecycle",
      "http-caching",
      "tls-handshake",
      "rest-crud",
      "http-status-codes",
      "cors",
      "bearer-auth",
      "jwt-structure",
      "oauth2",
    ],
  },
  {
    id: "backend-realtime",
    title: "Real-time & events",
    topicIds: ["pagination", "rate-limiting", "webhooks", "websockets-sse", "idempotency-retries"],
  },
  {
    id: "frontend-runtime",
    title: "Browser runtime",
    topicIds: ["critical-rendering-path", "event-loop", "hydration"],
  },
  {
    id: "frontend-react",
    title: "React mental model",
    topicIds: ["virtual-dom", "component-rerenders", "memoization", "client-routing", "list-virtualization"],
  },
  {
    id: "full-stack-request",
    title: "Full-stack request journey",
    topicIds: ["http-lifecycle", "cors", "event-loop", "critical-rendering-path"],
  },
  {
    id: "cache-everywhere",
    title: "Cache everywhere",
    topicIds: ["hash-table", "lru-cache", "http-caching", "client-data-fetching", "pagination", "list-virtualization"],
  },
  {
    id: "async-mental-model",
    title: "Async mental model",
    topicIds: ["queue", "event-loop", "websockets-sse", "webhooks", "debounce-throttle"],
  },
];

export function pathForTopic(topicId: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.topicIds.includes(topicId));
}

export function nextInPath(topicId: string): { path: LearningPath; topicId: string } | undefined {
  for (const path of LEARNING_PATHS) {
    const i = path.topicIds.indexOf(topicId);
    if (i >= 0 && i < path.topicIds.length - 1) {
      return { path, topicId: path.topicIds[i + 1] };
    }
  }
  return undefined;
}

export function prevInPath(topicId: string): { path: LearningPath; topicId: string } | undefined {
  for (const path of LEARNING_PATHS) {
    const i = path.topicIds.indexOf(topicId);
    if (i > 0) return { path, topicId: path.topicIds[i - 1] };
  }
  return undefined;
}

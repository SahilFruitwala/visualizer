# Dev Visualizer — Learn DSA, Backend & Frontend

An interactive web app that **animates** classic data structures, algorithms, backend, and frontend concepts.
Pick a topic, hit play, scrub the timeline, step through each operation, change
speed, and reshuffle the input — with the algorithm's code and complexity shown
alongside.

Built with **React + Vite** (no video rendering — it's a live, interactive app).

## Run

```bash
npm install
npm run dev      # open the printed localhost URL
npm run build    # type-check + production build into dist/
```

## Topics (100)

Navigation is split into four sections — **DS**, **Algo**, **BE**, **FE** — each with its own subcategories.

| Section | Category | Topics |
| ------- | -------- | ------ |
| **DS** | Linear | Stack · Queue · Deque · Linked List |
| | Hashing | Hash Table · Bloom Filter · LRU Cache |
| | Trees | BST · AVL · Trie · Heap / Priority Queue |
| | Advanced | Segment Tree · Fenwick Tree · Union-Find · Skip List |
| **Algo** | Sorting | Bubble · Selection · Insertion · Shell · Merge · Quick · Heap · Counting · Radix · Bucket |
| | Searching | Linear · Binary |
| | Tree Algorithms | Tree Traversal (DFS) · Pre/In/Post-order |
| | Graph Algorithms | BFS · DFS · Dijkstra · Bellman-Ford · Topological Sort · Kruskal · Prim · A\* · Floyd-Warshall · Tarjan's SCC |
| | Dynamic Programming | Fibonacci · Climbing Stairs · LIS · Kadane · Coin Change · Knapsack · LCS · Edit Distance · Bitmask DP |
| | Backtracking | N-Queens · Subsets · Permutations |
| | Techniques | Two Pointers · Sliding Window · Prefix Sums · Monotonic Stack · Binary Search on Answer · Meet in the Middle · Recursion & Call Stack |
| | Greedy | Activity Selection |
| | Strings | KMP · Rabin-Karp · Z-Algorithm |
| **BE** | Protocol | HTTP Lifecycle · DNS Resolution · TCP Handshake · HTTP Caching · TLS Handshake |
| | REST & Design | REST & HTTP Verbs · Status Codes · API Types · Versioning · GraphQL vs REST · gRPC & Protobuf |
| | Auth & Security | CORS · CSRF Protection · Bearer Auth · JWT Structure · OAuth 2.0 (PKCE) |
| | Operations | Pagination · Rate Limiting · Load Balancing · Webhooks · WebSockets & SSE · Idempotency & Retries |
| **FE** | Runtime | Critical Rendering Path · Browser Storage · Event Loop · Web Workers · SSR Hydration |
| | Rendering | Virtual DOM · Component Re-renders · Memoization |
| | Navigation | Client-Side Routing |
| | Layout & CSS | Box Model & Flexbox · CSS Grid |
| | Performance | Debounce & Throttle · List Virtualization · Client Data Fetching · Optimistic UI |

Legacy `/api` URLs redirect to `/backend`.

## Learning features

- **Paths** (`/paths`) — curated sequences with progress tracking
- **Compare** (`/compare`) — side-by-side topic animations with presets
- **Quizzes** — 2+ questions per topic
- **Prerequisites & related topics** — cross-linked learning graph
- **Favorites** — star topics to study later
- **Resume** — picks up where you left off per topic
- **Share links** — `?step=N` deep links
- **Keyboard shortcuts** — press `?` for help
- **PWA** — installable with offline caching

## Shared visual language

The same colors mean the same thing everywhere, so you learn it once:

- **Amber** — element currently being looked at / processed
- **Red** — pair being compared / element leaving
- **Green** — finalized, found, or sorted
- **Blue** — pointers and frontier (in the queue/stack)
- **Purple** — already visited

## How it's built

Every animation is a **precomputed list of immutable steps** (snapshots). The
player just walks an index `0 → n-1`, which makes playback deterministic,
scrubbable, and reversible. CSS transitions smoothly morph between consecutive
steps.

```
src/
  theme.ts                 # colors + fonts (the visual language)
  engine/
    types.ts               # Step / Viz / Topic contracts + defineViz()
    topicMeta.ts           # quizzes, prerequisites, badges for all topics
    enrichTopic.ts         # merges metadata into topic catalogue
    usePlayer.ts           # play / pause / step / speed / scrub (rAF-driven)
    progress.ts            # path & topic completion tracking
    favorites.ts           # starred topics
    paths.ts               # learning path definitions
  components/
    ComparePage.tsx        # side-by-side topic comparison
    ComplexityPanel.tsx    # badges + animation progress
    ...
  topics/
    index.ts               # the catalogue (register new topics here)
  App.tsx                  # stage + code/explanation panels
```

### Add a new topic

1. Create `src/topics/myTopic.tsx` exporting a `Topic`.
2. In `create()`, precompute `steps` (each extends `StepBase` with a `caption`),
   then return `defineViz({ steps, renderStep, code, explanation })`.
3. Register it in `src/topics/index.ts`. Add metadata in `src/engine/topicMeta.ts`.
4. It slots into the sidebar under its `category` automatically.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for a full guide — including how to fix content or add a topic
**entirely from the browser** (no clone needed) via GitHub's web editor.

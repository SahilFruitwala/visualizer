# Dev Visualizer — Learn DSA & APIs

An interactive web app that **animates** classic data structures, algorithms, and API concepts.
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

## Topics (70)

Navigation is split into four sections — **DS**, **Algo**, **API**, **FE** — each with its own subcategories.

| Section | Category | Topics |
| ------- | -------- | ------ |
| **DS** | Linear | Stack · Queue · Deque · Linked List |
| | Hashing | Hash Table · LRU Cache |
| | Trees | BST · AVL · Trie · Heap / Priority Queue |
| | Advanced | Segment Tree · Fenwick Tree · Union-Find |
| **Algo** | Sorting | Bubble · Selection · Insertion · Shell · Merge · Quick · Heap · Counting · Radix |
| | Searching | Linear · Binary |
| | Tree Algorithms | Tree Traversal (DFS) |
| | Graph Algorithms | BFS · DFS · Dijkstra · Bellman-Ford · Topological Sort · Kruskal · Prim · A\* · Floyd-Warshall |
| | Dynamic Programming | Fibonacci · Climbing Stairs · Kadane · Coin Change · Knapsack · LCS · Edit Distance |
| | Backtracking | N-Queens · Subsets · Permutations |
| | Techniques | Two Pointers · Sliding Window · Prefix Sums · Monotonic Stack · Binary Search on Answer |
| | Strings | KMP · Rabin-Karp |
| **API** | Protocol | HTTP Lifecycle · TLS Handshake |
| | REST & Design | REST & HTTP Verbs · Status Codes · API Types · Versioning |
| | Auth & Security | CORS · Bearer Auth · OAuth 2.0 (PKCE) |
| | Operations | Pagination · Rate Limiting · Webhooks · WebSockets & SSE |
| **FE** | Runtime | Critical Rendering Path · JavaScript Event Loop |
| | Rendering | Virtual DOM Reconciliation |
| | Navigation | Client-Side Routing |
| | Performance | List Virtualization |

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
    usePlayer.ts           # play / pause / step / speed / scrub (rAF-driven)
    util.ts                # shuffle, randomArray
  components/
    primitives.tsx         # Cell, Bar, Arrow, PointerTag, Row
    Grid.tsx               # 2D table for DP visualizations
    GraphView.tsx          # unweighted graph renderer (BFS/DFS)
    WeightedGraphView.tsx  # weighted/directed graph (Dijkstra/MST/topo)
    ApiFlow.tsx            # HTTP message panels, status badges, client/server flow
    Controls.tsx           # transport bar
    Sidebar.tsx            # categorized topic nav
  topics/
    index.ts               # the catalogue (register new topics here)
    bubbleSort.tsx ... slidingWindow.tsx
  App.tsx                  # stage + code/explanation panels
```

### Add a new topic

1. Create `src/topics/myTopic.tsx` exporting a `Topic`.
2. In `create()`, precompute `steps` (each extends `StepBase` with a `caption`),
   then return `defineViz({ steps, renderStep, code, explanation })`.
3. Register it in `src/topics/index.ts`. It slots into the sidebar under its
   `category` automatically.

Because each topic owns its own `Step` type and `renderStep`, visualizations stay
fully type-safe while sharing one player, one control bar, and one layout.

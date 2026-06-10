import type { QuizQuestion } from "./types";

type TopicMetaEntry = {
  prerequisites?: string[];
  quiz?: QuizQuestion[];
  useWhen?: string;
  badges?: string[];
  shufflable?: boolean;
};

export const TOPIC_META: Record<string, TopicMetaEntry> = {
  "stack": {
      "prerequisites": [],
      "useWhen": "You need undo, parsing, or depth-first traversal.",
      "badges": [
          "O(1) push/pop"
      ],
      "quiz": [
          {
              "question": "Which element is removed by pop()?",
              "options": [
                  "Bottom",
                  "Top",
                  "Random",
                  "Middle"
              ],
              "correctIndex": 1,
              "explanation": "Stack is LIFO — last pushed is first popped."
          },
          {
              "question": "Which operation reads the top without removing it?",
              "options": [
                  "shift()",
                  "peek()",
                  "enqueue()",
                  "dequeue()"
              ],
              "correctIndex": 1,
              "explanation": "peek() (or top()) inspects the top element; pop() removes it."
          }
      ]
  },
  "queue": {
      "prerequisites": [
          "stack"
      ],
      "useWhen": "Fair ordering matters — BFS, task queues, buffers.",
      "badges": [
          "O(1) enqueue"
      ],
      "quiz": [
          {
              "question": "Queue ordering is:",
              "options": [
                  "LIFO",
                  "FIFO",
                  "Random",
                  "Sorted"
              ],
              "correctIndex": 1,
              "explanation": "First in, first out — enqueue at rear, dequeue from front."
          },
          {
              "question": "Which algorithm relies on a queue?",
              "options": [
                  "DFS",
                  "BFS",
                  "Quick sort",
                  "Binary search"
              ],
              "correctIndex": 1,
              "explanation": "BFS processes nodes in discovery order using a FIFO queue."
          }
      ]
  },
  "deque": {
      "prerequisites": [
          "stack",
          "queue"
      ],
      "useWhen": "You need O(1) push/pop at both ends.",
      "badges": [
          "O(1) both ends"
      ],
      "quiz": [
          {
              "question": "Deque allows push/pop at:",
              "options": [
                  "Front only",
                  "Rear only",
                  "Both ends",
                  "Middle"
              ],
              "correctIndex": 2,
              "explanation": "Double-ended queue supports operations at front and rear."
          },
          {
              "question": "A deque can simulate:",
              "options": [
                  "Only a stack",
                  "Only a queue",
                  "Stack or queue",
                  "Neither"
              ],
              "correctIndex": 2,
              "explanation": "Restrict operations to one end and it behaves like a stack or queue."
          }
      ]
  },
  "linked-list": {
      "prerequisites": [
          "stack"
      ],
      "useWhen": "Frequent insert/delete in the middle without shifting.",
      "badges": [
          "O(1) insert at head"
      ],
      "quiz": [
          {
              "question": "Finding the k-th node by index takes:",
              "options": [
                  "O(1)",
                  "O(log n)",
                  "O(n)",
                  "O(n²)"
              ],
              "correctIndex": 2,
              "explanation": "Singly linked lists require walking from the head — no random access."
          },
          {
              "question": "What does each node store?",
              "options": [
                  "Value only",
                  "Value + pointer(s)",
                  "Index only",
                  "Hash"
              ],
              "correctIndex": 1,
              "explanation": "Nodes hold data and a next (and optionally prev) pointer."
          }
      ]
  },
  "hash-table": {
      "prerequisites": [
          "linked-list"
      ],
      "useWhen": "Average O(1) lookup, insert, or delete by key.",
      "badges": [
          "O(1) average"
      ],
      "quiz": [
          {
              "question": "Worst-case hash table lookup is:",
              "options": [
                  "O(1)",
                  "O(log n)",
                  "O(n)",
                  "O(n log n)"
              ],
              "correctIndex": 2,
              "explanation": "Many keys in one bucket degrades to linear scan."
          },
          {
              "question": "Load factor controls:",
              "options": [
                  "Sort order",
                  "When to resize",
                  "Hash seed",
                  "Key type"
              ],
              "correctIndex": 1,
              "explanation": "High load factor triggers rehashing to keep chains short."
          }
      ]
  },
  "bloom-filter": {
      "prerequisites": [
          "hash-table"
      ],
      "useWhen": "Probabilistic membership test with tiny memory.",
      "badges": [
          "O(k) lookup"
      ],
      "quiz": [
          {
              "question": "A Bloom filter false positive means:",
              "options": [
                  "Present key reported absent",
                  "Absent key reported present",
                  "Both wrong",
                  "Never happens"
              ],
              "correctIndex": 1,
              "explanation": "No false negatives for inserted keys; absent keys may look present."
          },
          {
              "question": "You cannot:",
              "options": [
                  "Insert keys",
                  "Test membership",
                  "Delete a single key reliably",
                  "Use multiple hash functions"
              ],
              "correctIndex": 2,
              "explanation": "Standard Bloom filters lack per-key deletion without counting variants."
          }
      ]
  },
  "lru-cache": {
      "prerequisites": [
          "hash-table",
          "linked-list"
      ],
      "useWhen": "You need a fixed-size cache that drops the least recently used item.",
      "badges": [
          "O(1) get/put"
      ],
      "quiz": [
          {
              "question": "Which entry is evicted when the cache is full?",
              "options": [
                  "Most recently used",
                  "Least recently used",
                  "Random",
                  "Largest key"
              ],
              "correctIndex": 1,
              "explanation": "LRU evicts the tail — the entry that hasn't been accessed longest."
          },
          {
              "question": "LRU combines a hash map with:",
              "options": [
                  "A stack",
                  "A doubly linked list",
                  "A heap only",
                  "A trie"
              ],
              "correctIndex": 1,
              "explanation": "Map gives O(1) lookup; list gives O(1) reorder and eviction."
          }
      ]
  },
  "bst": {
      "prerequisites": [
          "linked-list"
      ],
      "useWhen": "Sorted dynamic set with O(log n) search/insert on average.",
      "badges": [
          "O(log n) avg"
      ],
      "quiz": [
          {
              "question": "In-order traversal of a BST yields:",
              "options": [
                  "Random order",
                  "Sorted ascending keys",
                  "Reverse sorted",
                  "Level order"
              ],
              "correctIndex": 1,
              "explanation": "Left subtree, node, right subtree visits keys in sorted order."
          },
          {
              "question": "BST worst-case height is:",
              "options": [
                  "O(log n)",
                  "O(n)",
                  "O(1)",
                  "O(n log n)"
              ],
              "correctIndex": 1,
              "explanation": "Inserting sorted input creates a skewed chain of height n."
          }
      ]
  },
  "avl-tree": {
      "prerequisites": [
          "bst"
      ],
      "useWhen": "Guaranteed O(log n) height after every insert/delete.",
      "badges": [
          "O(log n) strict"
      ],
      "quiz": [
          {
              "question": "AVL trees rebalance using:",
              "options": [
                  "Bubble sort",
                  "Rotations",
                  "Hashing",
                  "BFS"
              ],
              "correctIndex": 1,
              "explanation": "Single and double rotations restore balance when heights differ by >1."
          },
          {
              "question": "Balance factor is:",
              "options": [
                  "Left height − right height",
                  "Node count",
                  "Key sum",
                  "Depth of root"
              ],
              "correctIndex": 0,
              "explanation": "Each node tracks height difference between subtrees."
          }
      ]
  },
  "trie": {
      "prerequisites": [
          "bst",
          "hash-table"
      ],
      "useWhen": "Prefix search, autocomplete, or IP routing tables.",
      "badges": [
          "O(m) per key"
      ],
      "quiz": [
          {
              "question": "Trie search time depends on:",
              "options": [
                  "Number of keys only",
                  "Key length m",
                  "Tree height log n",
                  "Hash quality"
              ],
              "correctIndex": 1,
              "explanation": "Walk one character/edge per step — O(m)."
          },
          {
              "question": "Tries excel at:",
              "options": [
                  "Exact hash lookup only",
                  "Prefix matching",
                  "Sorted range only",
                  "Graph shortest path"
              ],
              "correctIndex": 1,
              "explanation": "Shared prefixes collapse into one path — ideal for autocomplete."
          }
      ]
  },
  "heap": {
      "prerequisites": [
          "bst",
          "queue"
      ],
      "useWhen": "Repeated min/max extraction or priority scheduling.",
      "badges": [
          "O(log n) push/pop"
      ],
      "quiz": [
          {
              "question": "A min-heap parent is always:",
              "options": [
                  "Larger than children",
                  "Smaller than or equal to children",
                  "Equal to left child",
                  "Unordered"
              ],
              "correctIndex": 1,
              "explanation": "Heap property: parent ≤ children (min-heap)."
          },
          {
              "question": "Heap sort and Dijkstra use heaps for:",
              "options": [
                  "O(1) search",
                  "Efficient extract-min",
                  "Stable sorting",
                  "String matching"
              ],
              "correctIndex": 1,
              "explanation": "Priority queues need fast minimum extraction."
          }
      ]
  },
  "segment-tree": {
      "prerequisites": [
          "bst",
          "prefix-sum"
      ],
      "useWhen": "Range queries (sum/min/max) with point updates.",
      "badges": [
          "O(log n) query/update"
      ],
      "quiz": [
          {
              "question": "Segment tree range query time:",
              "options": [
                  "O(1)",
                  "O(log n)",
                  "O(n)",
                  "O(n log n)"
              ],
              "correctIndex": 1,
              "explanation": "Tree height is O(log n); query visits O(log n) nodes."
          },
          {
              "question": "Each internal node stores:",
              "options": [
                  "One array element",
                  "Aggregate of a range",
                  "Hash code",
                  "Parent pointer only"
              ],
              "correctIndex": 1,
              "explanation": "Nodes hold summary (sum, min, etc.) of their interval."
          }
      ]
  },
  "fenwick-tree": {
      "prerequisites": [
          "prefix-sum",
          "binary-search"
      ],
      "useWhen": "Prefix sums with O(log n) point updates in less memory than segment tree.",
      "badges": [
          "O(log n) update/query"
      ],
      "quiz": [
          {
              "question": "Fenwick tree uses which trick?",
              "options": [
                  "Rotations",
                  "Lowest set bit (i & -i)",
                  "Modular inverse",
                  "Rolling hash"
              ],
              "correctIndex": 1,
              "explanation": "Index arithmetic via i & -i defines coverage ranges."
          },
          {
              "question": "Fenwick trees are also called:",
              "options": [
                  "AVL trees",
                  "Binary Indexed Trees",
                  "Skip lists",
                  "Bloom filters"
              ],
              "correctIndex": 1,
              "explanation": "BIT = Binary Indexed Tree."
          }
      ]
  },
  "union-find": {
      "prerequisites": [
          "hash-table",
          "dfs"
      ],
      "useWhen": "Dynamic connectivity, Kruskal's MST, or grouping.",
      "badges": [
          "O(α(n)) amortized"
      ],
      "quiz": [
          {
              "question": "Path compression speeds up:",
              "options": [
                  "Sorting",
                  "find() operations",
                  "Hashing",
                  "BFS layers"
              ],
              "correctIndex": 1,
              "explanation": "find() flattens trees so future lookups are faster."
          },
          {
              "question": "Union by rank/size avoids:",
              "options": [
                  "Cycles in undirected graphs",
                  "Deep skewed trees",
                  "Hash collisions",
                  "Negative edges"
              ],
              "correctIndex": 1,
              "explanation": "Attach smaller tree under larger to keep height small."
          }
      ]
  },
  "skip-list": {
      "prerequisites": [
          "linked-list",
          "binary-search"
      ],
      "useWhen": "Probabilistic sorted map with simpler code than balanced trees.",
      "badges": [
          "O(log n) expected"
      ],
      "quiz": [
          {
              "question": "Skip lists use:",
              "options": [
                  "Only one level",
                  "Multiple express lanes",
                  "Hash buckets only",
                  "Rotations"
              ],
              "correctIndex": 1,
              "explanation": "Higher levels skip forward faster — like express lanes on a highway."
          },
          {
              "question": "Expected search time is:",
              "options": [
                  "O(n)",
                  "O(log n)",
                  "O(1)",
                  "O(n²)"
              ],
              "correctIndex": 1,
              "explanation": "Geometric level distribution gives logarithmic expected hops."
          }
      ]
  },
  "bubble-sort": {
      "prerequisites": [],
      "useWhen": "Teaching sorting basics or data is nearly sorted.",
      "badges": [
          "O(n²)",
          "O(1) space",
          "stable"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "What color means an element is locked in its final position?",
              "options": [
                  "Amber",
                  "Red",
                  "Green",
                  "Blue"
              ],
              "correctIndex": 2,
              "explanation": "Green marks finalized / sorted elements in every visualization."
          },
          {
              "question": "Bubble sort's worst-case time complexity?",
              "options": [
                  "O(n)",
                  "O(n log n)",
                  "O(n²)",
                  "O(2ⁿ)"
              ],
              "correctIndex": 2,
              "explanation": "Nested passes over the array give quadratic time in the average and worst case."
          }
      ]
  },
  "selection-sort": {
      "prerequisites": [
          "bubble-sort"
      ],
      "useWhen": "Minimal swaps matter more than stability.",
      "badges": [
          "O(n²)",
          "O(n) swaps"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Selection sort makes at most:",
              "options": [
                  "O(n) swaps",
                  "O(n log n) swaps",
                  "O(n²) swaps",
                  "O(1) swaps"
              ],
              "correctIndex": 0,
              "explanation": "One swap per pass to place the minimum — at most n−1 swaps."
          },
          {
              "question": "Selection sort is:",
              "options": [
                  "Stable",
                  "Not stable",
                  "O(n log n)",
                  "Parallel only"
              ],
              "correctIndex": 1,
              "explanation": "Swapping distant elements can reorder equal keys."
          }
      ]
  },
  "insertion-sort": {
      "prerequisites": [
          "bubble-sort"
      ],
      "useWhen": "Small or nearly sorted arrays.",
      "badges": [
          "O(n²) worst",
          "stable",
          "adaptive"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Insertion sort is best on:",
              "options": [
                  "Reverse sorted data",
                  "Nearly sorted data",
                  "Random huge arrays",
                  "Linked lists only"
              ],
              "correctIndex": 1,
              "explanation": "Few inversions mean inner loop exits quickly — O(n) best case."
          },
          {
              "question": "Insertion sort is:",
              "options": [
                  "Stable",
                  "Unstable",
                  "O(1) always",
                  "Not in-place"
              ],
              "correctIndex": 0,
              "explanation": "Equal elements stay in relative order when inserting."
          }
      ]
  },
  "shell-sort": {
      "prerequisites": [
          "insertion-sort"
      ],
      "useWhen": "In-place sort better than O(n²) without extra memory.",
      "badges": [
          "O(n log² n) typical",
          "in-place"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Shell sort generalizes:",
              "options": [
                  "Merge sort",
                  "Insertion sort with gaps",
                  "Quick sort pivots",
                  "Counting sort"
              ],
              "correctIndex": 1,
              "explanation": "H-sort insertion with shrinking gap sequences."
          },
          {
              "question": "Final gap of 1 makes Shell sort:",
              "options": [
                  "Bubble sort",
                  "Plain insertion sort pass",
                  "Heap sort",
                  "Radix sort"
              ],
              "correctIndex": 1,
              "explanation": "Last pass with gap 1 is ordinary insertion sort on nearly sorted data."
          }
      ]
  },
  "merge-sort": {
      "prerequisites": [
          "bubble-sort",
          "insertion-sort"
      ],
      "useWhen": "You need guaranteed O(n log n) and stable sorting.",
      "badges": [
          "O(n log n)",
          "stable",
          "O(n) space"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Merge sort's extra space is mainly for:",
              "options": [
                  "Hash table",
                  "Temporary merge buffer",
                  "Recursion stack only",
                  "Counting array"
              ],
              "correctIndex": 1,
              "explanation": "Merging two halves needs auxiliary array (or careful in-place variants)."
          },
          {
              "question": "Merge sort time in all cases:",
              "options": [
                  "O(n²)",
                  "O(n log n)",
                  "O(n)",
                  "O(2ⁿ)"
              ],
              "correctIndex": 1,
              "explanation": "Divide-and-conquer always splits evenly — T(n)=2T(n/2)+O(n)."
          }
      ]
  },
  "quick-sort": {
      "prerequisites": [
          "merge-sort",
          "insertion-sort"
      ],
      "useWhen": "Fast in-place sort; good cache behavior on average.",
      "badges": [
          "O(n log n) avg",
          "O(n²) worst",
          "in-place"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Quick sort partitions around a:",
              "options": [
                  "Median of merged halves",
                  "Pivot",
                  "Heap root",
                  "Hash bucket"
              ],
              "correctIndex": 1,
              "explanation": "Partition places pivot in final position, then recurses on sides."
          },
          {
              "question": "Quick sort is typically:",
              "options": [
                  "Stable",
                  "Not stable",
                  "O(n) worst",
                  "External sort only"
              ],
              "correctIndex": 1,
              "explanation": "In-place swaps can reorder equal elements."
          }
      ]
  },
  "heap-sort": {
      "prerequisites": [
          "heap",
          "insertion-sort"
      ],
      "useWhen": "Guaranteed O(n log n) in-place without merge buffer.",
      "badges": [
          "O(n log n)",
          "O(1) extra",
          "not stable"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Heap sort builds a:",
              "options": [
                  "Min-heap for ascending",
                  "Max-heap then extracts",
                  "BST",
                  "Trie"
              ],
              "correctIndex": 1,
              "explanation": "Max-heap lets you swap root to end repeatedly for ascending order."
          },
          {
              "question": "Heap sort extra space beyond input:",
              "options": [
                  "O(n)",
                  "O(log n)",
                  "O(1)",
                  "O(n²)"
              ],
              "correctIndex": 2,
              "explanation": "In-place heapify uses only a few pointers."
          }
      ]
  },
  "counting-sort": {
      "prerequisites": [
          "insertion-sort"
      ],
      "useWhen": "Small integer key range k ≪ n.",
      "badges": [
          "O(n + k)",
          "stable"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Counting sort requires:",
              "options": [
                  "Floating keys",
                  "Bounded integer range",
                  "Sorted input",
                  "Hash function"
              ],
              "correctIndex": 1,
              "explanation": "Count array size depends on max key value k."
          },
          {
              "question": "Time complexity is:",
              "options": [
                  "O(n log n)",
                  "O(n + k)",
                  "O(n²)",
                  "O(2ⁿ)"
              ],
              "correctIndex": 1,
              "explanation": "Count, prefix-sum, and scatter each linear in n or k."
          }
      ]
  },
  "radix-sort": {
      "prerequisites": [
          "counting-sort"
      ],
      "useWhen": "Fixed-width integers or strings with stable digit passes.",
      "badges": [
          "O(d · (n + k))",
          "stable"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Radix sort processes:",
              "options": [
                  "One comparison at a time",
                  "Digits or bytes least/most significant",
                  "Graph edges",
                  "Heap levels"
              ],
              "correctIndex": 1,
              "explanation": "Stable counting sort per digit/byte pass."
          },
          {
              "question": "Radix sort needs stable:",
              "options": [
                  "Quick sort",
                  "Counting sort per pass",
                  "Selection sort",
                  "Bubble sort"
              ],
              "correctIndex": 1,
              "explanation": "Stability preserves order across digit passes."
          }
      ]
  },
  "linear-search": {
      "prerequisites": [],
      "useWhen": "The list is unsorted or very small.",
      "badges": [
          "O(n)",
          "works on unsorted data"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Linear search works on:",
              "options": [
                  "Sorted arrays only",
                  "Any sequence",
                  "Trees only",
                  "Hash tables only"
              ],
              "correctIndex": 1,
              "explanation": "Scan until match — no ordering required."
          },
          {
              "question": "Best case when target is first:",
              "options": [
                  "O(log n)",
                  "O(1)",
                  "O(n)",
                  "O(n²)"
              ],
              "correctIndex": 1,
              "explanation": "One comparison if the first element matches."
          }
      ]
  },
  "binary-search": {
      "prerequisites": [
          "linear-search"
      ],
      "useWhen": "The data is sorted and you need O(log n) lookup.",
      "badges": [
          "O(log n)",
          "requires sorted input"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Binary search requires:",
              "options": [
                  "Linked list",
                  "Sorted array",
                  "Hash map",
                  "Graph"
              ],
              "correctIndex": 1,
              "explanation": "Monotonic ordering lets you discard half each step."
          },
          {
              "question": "Each step eliminates:",
              "options": [
                  "One element",
                  "Half the remaining range",
                  "All elements",
                  "Nothing"
              ],
              "correctIndex": 1,
              "explanation": "Compare mid, go left or right — halve search space."
          }
      ]
  },
  "tree-traversal": {
      "prerequisites": [
          "bst",
          "stack"
      ],
      "useWhen": "Visit every node — in/pre/post order or level order.",
      "badges": [
          "O(n) nodes"
      ],
      "quiz": [
          {
              "question": "Recursive DFS uses the call:",
              "options": [
                  "Queue",
                  "Stack",
                  "Heap",
                  "Hash table"
              ],
              "correctIndex": 1,
              "explanation": "Implicit call stack drives depth-first visits."
          },
          {
              "question": "Level-order traversal uses a:",
              "options": [
                  "Stack",
                  "Queue",
                  "Priority queue",
                  "Union-find"
              ],
              "correctIndex": 1,
              "explanation": "BFS on trees processes nodes by depth."
          }
      ]
  },
  "tree-traversal-orders": {
      "prerequisites": [
          "tree-traversal",
          "bst"
      ],
      "useWhen": "Choosing in/pre/post order for serialization or expression trees.",
      "badges": [
          "in · pre · post"
      ],
      "quiz": [
          {
              "question": "In-order on a BST prints keys:",
              "options": [
                  "Descending",
                  "Ascending",
                  "By depth",
                  "Randomly"
              ],
              "correctIndex": 1,
              "explanation": "Left, node, right visits sorted order."
          },
          {
              "question": "Post-order is natural for:",
              "options": [
                  "Printing sorted keys",
                  "Deleting a tree bottom-up",
                  "BFS layers",
                  "Hash lookup"
              ],
              "correctIndex": 1,
              "explanation": "Children before parent — safe for freeing subtrees."
          }
      ]
  },
  "bfs": {
      "prerequisites": [
          "queue"
      ],
      "useWhen": "Shortest path in an unweighted graph or level-order traversal.",
      "badges": [
          "O(V + E)"
      ],
      "quiz": [
          {
              "question": "What data structure does BFS use?",
              "options": [
                  "Stack",
                  "Queue",
                  "Heap",
                  "Hash table"
              ],
              "correctIndex": 1,
              "explanation": "BFS is FIFO — first discovered nodes are processed first."
          },
          {
              "question": "BFS finds shortest paths in:",
              "options": [
                  "Weighted graphs with negatives",
                  "Unweighted graphs",
                  "DAGs only",
                  "Trees only"
              ],
              "correctIndex": 1,
              "explanation": "First time reaching a node is via fewest edges when weights are uniform."
          }
      ]
  },
  "dfs": {
      "prerequisites": [
          "stack",
          "bfs"
      ],
      "useWhen": "Explore deeply first — cycles, connected components, backtracking.",
      "badges": [
          "O(V + E)"
      ],
      "quiz": [
          {
              "question": "DFS typically uses:",
              "options": [
                  "Queue",
                  "Stack or recursion",
                  "Min-heap",
                  "Bloom filter"
              ],
              "correctIndex": 1,
              "explanation": "Explicit stack or recursive call stack."
          },
          {
              "question": "DFS is suited for:",
              "options": [
                  "Unweighted shortest path",
                  "Topological sort on DAGs",
                  "All-pairs shortest path",
                  "Stable sorting"
              ],
              "correctIndex": 1,
              "explanation": "Finish-time ordering supports topological sort."
          }
      ]
  },
  "dijkstra": {
      "prerequisites": [
          "bfs",
          "heap"
      ],
      "useWhen": "Shortest paths with non-negative edge weights.",
      "badges": [
          "O((V+E) log V)",
          "non-negative weights"
      ],
      "quiz": [
          {
              "question": "Dijkstra fails with:",
              "options": [
                  "Non-negative edges",
                  "Negative edge weights",
                  "Undirected graphs",
                  "Disconnected graphs"
              ],
              "correctIndex": 1,
              "explanation": "Negative edges break the greedy extract-min invariant."
          },
          {
              "question": "Dijkstra uses a:",
              "options": [
                  "Queue only",
                  "Priority queue (min-heap)",
                  "Stack",
                  "Counting array"
              ],
              "correctIndex": 1,
              "explanation": "Always relax from the closest unsettled node."
          }
      ]
  },
  "bellman-ford": {
      "prerequisites": [
          "dijkstra",
          "dfs"
      ],
      "useWhen": "Shortest paths with negative edges or detecting negative cycles.",
      "badges": [
          "O(V · E)",
          "handles negatives"
      ],
      "quiz": [
          {
              "question": "Bellman-Ford relaxes all edges:",
              "options": [
                  "Once",
                  "V−1 times",
                  "E times only",
                  "Log V times"
              ],
              "correctIndex": 1,
              "explanation": "V−1 passes propagate shortest paths in general graphs."
          },
          {
              "question": "An extra pass that improves distance means:",
              "options": [
                  "Graph is a tree",
                  "Negative cycle exists",
                  "Dijkstra would work",
                  "Graph is disconnected"
              ],
              "correctIndex": 1,
              "explanation": "If distances still decrease, a negative cycle is reachable."
          }
      ]
  },
  "topological-sort": {
      "prerequisites": [
          "dfs",
          "bfs"
      ],
      "useWhen": "Ordering tasks with dependencies in a DAG.",
      "badges": [
          "O(V + E)",
          "DAG only"
      ],
      "quiz": [
          {
              "question": "Topological sort exists only for:",
              "options": [
                  "Any graph",
                  "Directed acyclic graphs",
                  "Undirected graphs",
                  "Complete graphs"
              ],
              "correctIndex": 1,
              "explanation": "Cycles make a linear dependency order impossible."
          },
          {
              "question": "Kahn's algorithm starts with nodes of:",
              "options": [
                  "Maximum degree",
                  "In-degree zero",
                  "Negative weight",
                  "Even ID"
              ],
              "correctIndex": 1,
              "explanation": "Nodes with no prerequisites can be emitted first."
          }
      ]
  },
  "kruskal": {
      "prerequisites": [
          "union-find",
          "dfs"
      ],
      "useWhen": "Minimum spanning tree by sorting edges globally.",
      "badges": [
          "O(E log E)",
          "MST"
      ],
      "quiz": [
          {
              "question": "Kruskal sorts edges by:",
              "options": [
                  "Vertex name",
                  "Weight ascending",
                  "Degree",
                  "Random"
              ],
              "correctIndex": 1,
              "explanation": "Greedy: add lightest edge that doesn't form a cycle."
          },
          {
              "question": "Cycle detection in Kruskal uses:",
              "options": [
                  "BFS layers",
                  "Union-find",
                  "Dijkstra",
                  "Trie"
              ],
              "correctIndex": 1,
              "explanation": "Union-find tracks connected components as edges are added."
          }
      ]
  },
  "prim": {
      "prerequisites": [
          "dijkstra",
          "heap"
      ],
      "useWhen": "MST growing from a seed vertex — good for dense graphs.",
      "badges": [
          "O(E log V)",
          "MST"
      ],
      "quiz": [
          {
              "question": "Prim grows the MST from:",
              "options": [
                  "All edges at once",
                  "A starting vertex outward",
                  "Leaves inward",
                  "Random edges"
              ],
              "correctIndex": 1,
              "explanation": "Expand frontier with cheapest edge to an outside vertex."
          },
          {
              "question": "Prim resembles:",
              "options": [
                  "Kruskal + sorting",
                  "Dijkstra on edge weights",
                  "BFS on unweighted graph",
                  "Floyd-Warshall"
              ],
              "correctIndex": 1,
              "explanation": "Both use priority queue to pick next best frontier node/edge."
          }
      ]
  },
  "a-star": {
      "prerequisites": [
          "dijkstra",
          "bfs"
      ],
      "useWhen": "Shortest path on grids/maps when you have a heuristic to the goal.",
      "badges": [
          "heuristic search",
          "admissible h"
      ],
      "quiz": [
          {
              "question": "A* priority uses f(n) =",
              "options": [
                  "g(n) only",
                  "h(n) only",
                  "g(n) + h(n)",
                  "g(n) − h(n)"
              ],
              "correctIndex": 2,
              "explanation": "g = cost so far, h = estimated cost to goal."
          },
          {
              "question": "Admissible heuristic means:",
              "options": [
                  "h overestimates",
                  "h never overestimates true cost",
                  "h is zero",
                  "h is random"
              ],
              "correctIndex": 1,
              "explanation": "Never optimistic — guarantees optimal path if admissible."
          }
      ]
  },
  "floyd-warshall": {
      "prerequisites": [
          "dijkstra"
      ],
      "useWhen": "You need distances between every pair of nodes (dense graphs, n ≤ 400).",
      "badges": [
          "O(n³)",
          "handles negative edges"
      ],
      "quiz": [
          {
              "question": "Floyd-Warshall considers each vertex as:",
              "options": [
                  "Start only",
                  "Intermediate k in DP",
                  "Leaf only",
                  "Heap root"
              ],
              "correctIndex": 1,
              "explanation": "DP over allowed intermediate nodes 1..k."
          },
          {
              "question": "Space optimized Floyd uses:",
              "options": [
                  "O(n³)",
                  "O(n²) distance matrix",
                  "O(n) only",
                  "O(E) only"
              ],
              "correctIndex": 1,
              "explanation": "Single n×n matrix updated in place."
          }
      ]
  },
  "tarjan-scc": {
      "prerequisites": [
          "dfs",
          "topological-sort"
      ],
      "useWhen": "Find strongly connected components in a directed graph.",
      "badges": [
          "O(V + E)"
      ],
      "quiz": [
          {
              "question": "SCC means:",
              "options": [
                  "Weakly connected subgraph",
                  "Mutually reachable nodes",
                  "Tree component",
                  "Bipartite set"
              ],
              "correctIndex": 1,
              "explanation": "Every pair in the component can reach each other."
          },
          {
              "question": "Tarjan's uses DFS with:",
              "options": [
                  "Priority queue",
                  "Low-link values and stack",
                  "Counting sort",
                  "Union-find only"
              ],
              "correctIndex": 1,
              "explanation": "Low-link identifies when a SCC root closes on the stack."
          }
      ]
  },
  "fibonacci": {
      "prerequisites": [],
      "useWhen": "Intro to overlapping subproblems and memoization.",
      "badges": [
          "O(n) DP",
          "O(2ⁿ) naive"
      ],
      "quiz": [
          {
              "question": "Naive recursive Fibonacci is:",
              "options": [
                  "O(n)",
                  "O(n log n)",
                  "O(2ⁿ)",
                  "O(1)"
              ],
              "correctIndex": 2,
              "explanation": "Repeated subproblems cause exponential recursion tree."
          },
          {
              "question": "Bottom-up DP reduces time to:",
              "options": [
                  "O(2ⁿ)",
                  "O(n log n)",
                  "O(n)",
                  "O(1) with rolling vars"
              ],
              "correctIndex": 2,
              "explanation": "Each F(i) computed once from previous two."
          }
      ]
  },
  "climbing-stairs": {
      "prerequisites": [
          "fibonacci"
      ],
      "useWhen": "Count ways to take 1 or 2 steps — classic 1D DP.",
      "badges": [
          "O(n)",
          "O(1) space"
      ],
      "quiz": [
          {
              "question": "Climbing n stairs with steps 1 or 2 relates to:",
              "options": [
                  "Factorial",
                  "Fibonacci",
                  "Catalan",
                  "Knapsack"
              ],
              "correctIndex": 1,
              "explanation": "ways(n) = ways(n−1) + ways(n−2)."
          },
          {
              "question": "Base cases are usually:",
              "options": [
                  "ways(0)=0",
                  "ways(1)=1, ways(2)=2",
                  "ways(0)=1",
                  "Both B and C depending on definition"
              ],
              "correctIndex": 3,
              "explanation": "Define ways(0)=1 for empty path or start at n=1 — watch problem statement."
          }
      ]
  },
  "kadane": {
      "prerequisites": [
          "prefix-sum"
      ],
      "useWhen": "Maximum sum contiguous subarray in O(n).",
      "badges": [
          "O(n)",
          "O(1) space"
      ],
      "quiz": [
          {
              "question": "Kadane tracks running sum and:",
              "options": [
                  "Global minimum",
                  "Best ending here",
                  "Sorted order",
                  "Heap max"
              ],
              "correctIndex": 1,
              "explanation": "Either extend current subarray or start fresh at i."
          },
          {
              "question": "All-negative array answer is:",
              "options": [
                  "Zero",
                  "The least negative element",
                  "Undefined",
                  "Sum of all"
              ],
              "correctIndex": 1,
              "explanation": "Best subarray may be length 1 — the max element."
          }
      ]
  },
  "coin-change": {
      "prerequisites": [
          "fibonacci",
          "climbing-stairs"
      ],
      "useWhen": "Minimum coins or count combinations for an amount.",
      "badges": [
          "O(amount · coins)"
      ],
      "quiz": [
          {
              "question": "Unbounded coin change DP loops:",
              "options": [
                  "Coins outer, amount inner",
                  "Either order with care",
                  "Amount only once",
                  "Greedy always"
              ],
              "correctIndex": 1,
              "explanation": "Order of loops matters for counting vs minimization variants."
          },
          {
              "question": "Greedy by largest coin fails when:",
              "options": [
                  "Coins are powers of two",
                  "Coins aren't canonical (e.g. 1,3,4)",
                  "Amount is small",
                  "Coins are sorted"
              ],
              "correctIndex": 1,
              "explanation": "Non-canonical systems need full DP."
          }
      ]
  },
  "knapsack": {
      "prerequisites": [
          "coin-change"
      ],
      "useWhen": "Pick items with weight/value limits — 0/1 or unbounded.",
      "badges": [
          "O(n · W)"
      ],
      "quiz": [
          {
              "question": "0/1 knapsack inner loop goes:",
              "options": [
                  "Capacity high to low",
                  "Capacity low to high",
                  "Random",
                  "Items only"
              ],
              "correctIndex": 0,
              "explanation": "Reverse capacity prevents reusing same item in one row."
          },
          {
              "question": "Space optimization uses:",
              "options": [
                  "One DP row",
                  "Full matrix always",
                  "Trie",
                  "Graph BFS"
              ],
              "correctIndex": 0,
              "explanation": "Rolling array over capacity dimension suffices."
          }
      ]
  },
  "lcs": {
      "prerequisites": [
          "coin-change"
      ],
      "useWhen": "Longest common subsequence of two strings.",
      "badges": [
          "O(m · n)"
      ],
      "quiz": [
          {
              "question": "LCS subproblems compare:",
              "options": [
                  "Prefixes of both strings",
                  "Suffixes only",
                  "Sorted chars",
                  "Hashes only"
              ],
              "correctIndex": 0,
              "explanation": "dp[i][j] uses first i chars of A and j of B."
          },
          {
              "question": "Matching chars typically:",
              "options": [
                  "Reset to 0",
                  "Take diagonal + 1",
                  "Take max of left/top only",
                  "Skip DP"
              ],
              "correctIndex": 1,
              "explanation": "Match extends LCS of shorter prefixes by one."
          }
      ]
  },
  "edit-distance": {
      "prerequisites": [
          "lcs"
      ],
      "useWhen": "Minimum insert/delete/replace to transform one string to another.",
      "badges": [
          "O(m · n)",
          "Levenshtein"
      ],
      "quiz": [
          {
              "question": "Edit distance allows:",
              "options": [
                  "Insert, delete, replace",
                  "Swap only",
                  "Sort only",
                  "Rotate only"
              ],
              "correctIndex": 0,
              "explanation": "Classic Levenshtein includes three operations."
          },
          {
              "question": "Base case empty-to-string cost is:",
              "options": [
                  "0",
                  "Length of other string",
                  "Product of lengths",
                  "Always 1"
              ],
              "correctIndex": 1,
              "explanation": "Insert all characters — cost equals string length."
          }
      ]
  },
  "bitmask-dp": {
      "prerequisites": [
          "subsets",
          "coin-change"
      ],
      "useWhen": "DP over subsets of n items (n ≤ 20) — TSP, assignment.",
      "badges": [
          "O(n · 2^n)"
      ],
      "quiz": [
          {
              "question": "State often includes:",
              "options": [
                  "Subset bitmask + last item",
                  "Heap only",
                  "Graph color",
                  "Sorted array"
              ],
              "correctIndex": 0,
              "explanation": "mask encodes visited set; last node breaks symmetry in TSP."
          },
          {
              "question": "Feasible n for 2^n states is roughly:",
              "options": [
                  "n ≤ 5",
                  "n ≤ 20",
                  "n ≤ 1000",
                  "Any n"
              ],
              "correctIndex": 1,
              "explanation": "2^20 ≈ 1M — practical upper bound for competitive programming."
          }
      ]
  },
  "n-queens": {
      "prerequisites": [
          "subsets",
          "dfs"
      ],
      "useWhen": "Place n queens with no mutual attacks — classic backtracking.",
      "badges": [
          "backtracking",
          "O(n!)"
      ],
      "quiz": [
          {
              "question": "Pruning checks conflicts on:",
              "options": [
                  "Rows, columns, diagonals",
                  "Sorted order only",
                  "Hash buckets",
                  "Heap property"
              ],
              "correctIndex": 0,
              "explanation": "Each new queen must not attack prior queens."
          },
          {
              "question": "N-queens explores:",
              "options": [
                  "All permutations blindly",
                  "Row-by-row valid placements",
                  "BFS levels only",
                  "Greedy only"
              ],
              "correctIndex": 1,
              "explanation": "Place one queen per row; backtrack on conflict."
          }
      ]
  },
  "subsets": {
      "prerequisites": [
          "dfs"
      ],
      "useWhen": "Generate all subsets or power set — include/exclude pattern.",
      "badges": [
          "O(n · 2^n)"
      ],
      "quiz": [
          {
              "question": "Subset generation often uses:",
              "options": [
                  "Include or skip each element",
                  "Heap sort",
                  "Union-find",
                  "Dijkstra"
              ],
              "correctIndex": 0,
              "explanation": "Binary choice per element yields 2^n subsets."
          },
          {
              "question": "Iterative subset build doubles list when:",
              "options": [
                  "Adding each element to prior subsets",
                  "Sorting",
                  "Hashing",
                  "BFS"
              ],
              "correctIndex": 0,
              "explanation": "For each new element, append it to every existing subset."
          }
      ]
  },
  "permutations": {
      "prerequisites": [
          "subsets"
      ],
      "useWhen": "All orderings of elements — swap or used[] backtracking.",
      "badges": [
          "O(n · n!)"
      ],
      "quiz": [
          {
              "question": "Permutation count for n distinct items:",
              "options": [
                  "2^n",
                  "n!",
                  "n²",
                  "n log n"
              ],
              "correctIndex": 1,
              "explanation": "n choices for first, n−1 for second, etc."
          },
          {
              "question": "Backtracking permutations track:",
              "options": [
                  "Used flags or swap index",
                  "Only heap",
                  "Only queue",
                  "Edge weights"
              ],
              "correctIndex": 0,
              "explanation": "Avoid reusing same element in one ordering."
          }
      ]
  },
  "two-pointers": {
      "prerequisites": [
          "binary-search"
      ],
      "useWhen": "Sorted array pairs, palindromes, or merge two lists.",
      "badges": [
          "O(n)"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Two pointers on sorted array often finds:",
              "options": [
                  "Pairs with target sum",
                  "Shortest path in graph",
                  "MST",
                  "SCC"
              ],
              "correctIndex": 0,
              "explanation": "Move left/right based on sum vs target."
          },
          {
              "question": "Two pointers reduce from:",
              "options": [
                  "O(n²) nested loops",
                  "O(log n)",
                  "O(2ⁿ)",
                  "O(1)"
              ],
              "correctIndex": 0,
              "explanation": "Monotonic movement gives linear scan instead of all pairs."
          }
      ]
  },
  "sliding-window": {
      "prerequisites": [
          "two-pointers",
          "prefix-sum"
      ],
      "useWhen": "Contiguous subarray/substring with a constraint.",
      "badges": [
          "O(n)"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Fixed-size window moves by:",
              "options": [
                  "Resetting both pointers to 0",
                  "Shrink left when right advances",
                  "Binary search",
                  "Heap pop"
              ],
              "correctIndex": 1,
              "explanation": "Expand right, contract left to maintain size or validity."
          },
          {
              "question": "Sliding window max often uses:",
              "options": [
                  "Monotonic deque",
                  "Bubble sort",
                  "Union-find",
                  "Radix sort"
              ],
              "correctIndex": 0,
              "explanation": "Deque of candidates drops useless indices in O(n)."
          }
      ]
  },
  "prefix-sum": {
      "prerequisites": [
          "linear-search"
      ],
      "useWhen": "O(1) range sums after O(n) preprocessing.",
      "badges": [
          "O(1) range query"
      ],
      "quiz": [
          {
              "question": "Sum from index L to R using prefix P:",
              "options": [
                  "P[R] − P[L]",
                  "P[R] − P[L−1]",
                  "P[R−1] − P[L]",
                  "P[R] + P[L]"
              ],
              "correctIndex": 1,
              "explanation": "Exclude prefix before L with P[L−1] (or define P[0]=0)."
          },
          {
              "question": "Prefix sums enable:",
              "options": [
                  "O(1) subarray sum queries",
                  "O(1) sorting",
                  "O(1) graph MST",
                  "O(1) string match"
              ],
              "correctIndex": 0,
              "explanation": "After O(n) build, each range sum is constant time."
          }
      ]
  },
  "monotonic-stack": {
      "prerequisites": [
          "stack"
      ],
      "useWhen": "You need the next greater/smaller element or span distances.",
      "badges": [
          "O(n)"
      ],
      "quiz": [
          {
              "question": "Why do we store indices instead of values on the stack?",
              "options": [
                  "Indices are smaller",
                  "We need positions to write results",
                  "Values can't be compared",
                  "It's arbitrary"
              ],
              "correctIndex": 1,
              "explanation": "Results are indexed by position — we need the original index to fill res[idx]."
          },
          {
              "question": "Each index is pushed and popped at most:",
              "options": [
                  "Once",
                  "Twice",
                  "log n times",
                  "n times"
              ],
              "correctIndex": 0,
              "explanation": "Amortized O(1) per index — total O(n)."
          }
      ]
  },
  "binary-search-on-answer": {
      "prerequisites": [
          "binary-search"
      ],
      "useWhen": "You need the minimum/maximum X such that a check(X) passes.",
      "badges": [
          "O(n log S)"
      ],
      "quiz": [
          {
              "question": "You binary search on:",
              "options": [
                  "Array index only",
                  "Answer space (the value X)",
                  "Graph nodes",
                  "String length only"
              ],
              "correctIndex": 1,
              "explanation": "Monotonic predicate over X — check(mid) true/false."
          },
          {
              "question": "check(X) must be:",
              "options": [
                  "Random",
                  "Monotonic in X",
                  "Always true",
                  "O(2ⁿ)"
              ],
              "correctIndex": 1,
              "explanation": "If check(x) true then check(x+1) true (for min search variant)."
          }
      ]
  },
  "meet-in-middle": {
      "prerequisites": [
          "two-pointers",
          "binary-search"
      ],
      "useWhen": "Split n into two halves — subset sum, 4-sum (n ≈ 40).",
      "badges": [
          "O(2^(n/2))"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Meet-in-the-middle splits:",
              "options": [
                  "Graph in half",
                  "Input into two halves",
                  "Array sorted",
                  "String reversed"
              ],
              "correctIndex": 1,
              "explanation": "Enumerate subsets of each half, combine via hash or sort."
          },
          {
              "question": "Complexity improves from 2^n to:",
              "options": [
                  "2^(n/2)",
                  "n²",
                  "n log n",
                  "n!"
              ],
              "correctIndex": 0,
              "explanation": "Two halves of size n/2 each — 2 · 2^(n/2)."
          }
      ]
  },
  "kmp": {
      "prerequisites": [
          "prefix-sum"
      ],
      "useWhen": "Linear-time pattern search with failure (LPS) array.",
      "badges": [
          "O(n + m)"
      ],
      "quiz": [
          {
              "question": "KMP LPS array gives:",
              "options": [
                  "Longest proper prefix that is suffix",
                  "Hash of pattern",
                  "Sorted suffixes",
                  "Graph distances"
              ],
              "correctIndex": 0,
              "explanation": "On mismatch, shift pattern by LPS[j] without re-scanning text."
          },
          {
              "question": "KMP avoids backtracking in:",
              "options": [
                  "Pattern",
                  "Text index",
                  "Both",
                  "Neither"
              ],
              "correctIndex": 1,
              "explanation": "Text pointer never moves backward — only pattern index adjusts."
          }
      ]
  },
  "rabin-karp": {
      "prerequisites": [
          "hash-table",
          "kmp"
      ],
      "useWhen": "Multi-pattern or rolling hash substring search.",
      "badges": [
          "O(n + m) avg",
          "rolling hash"
      ],
      "quiz": [
          {
              "question": "Rabin-Karp uses:",
              "options": [
                  "Rolling hash",
                  "AVL tree",
                  "Dijkstra",
                  "Counting sort"
              ],
              "correctIndex": 0,
              "explanation": "Update hash in O(1) when window slides."
          },
          {
              "question": "Hash collision requires:",
              "options": [
                  "Immediate match",
                  "Verify characters",
                  "Skip verification",
                  "Restart from 0"
              ],
              "correctIndex": 1,
              "explanation": "Equal hash may be false positive — confirm char-by-char."
          }
      ]
  },
  "z-algorithm": {
      "prerequisites": [
          "kmp"
      ],
      "useWhen": "Z-array for pattern matching and string analysis in O(n).",
      "badges": [
          "O(n)"
      ],
      "quiz": [
          {
              "question": "Z[i] is length of longest substring starting at i that:",
              "options": [
                  "Equals prefix of s",
                  "Equals suffix only",
                  "Is palindrome",
                  "Is sorted"
              ],
              "correctIndex": 0,
              "explanation": "Z-box matches prefix — used for pattern search and repeats."
          },
          {
              "question": "Z-algorithm runs in:",
              "options": [
                  "O(n²)",
                  "O(n log n)",
                  "O(n)",
                  "O(n·m)"
              ],
              "correctIndex": 2,
              "explanation": "Amortized pointer never moves backward past n."
          }
      ]
  },
  "http-lifecycle": {
      "prerequisites": [],
      "useWhen": "Debugging slow requests, timeouts, or connection errors.",
      "badges": [
          "client ↔ server"
      ],
      "quiz": [
          {
              "question": "What happens before the HTTP request is sent?",
              "options": [
                  "JSON parse",
                  "DNS + TCP",
                  "CORS preflight only",
                  "Webhook delivery"
              ],
              "correctIndex": 1,
              "explanation": "The client resolves the host and opens a TCP connection before bytes hit the wire."
          },
          {
              "question": "HTTP/1.1 default connection reuse is via:",
              "options": [
                  "UDP",
                  "Keep-Alive / persistent TCP",
                  "New DNS each request",
                  "WebSocket only"
              ],
              "correctIndex": 1,
              "explanation": "Persistent connections amortize TCP/TLS handshakes across requests."
          }
      ]
  },
  "http-caching": {
      "prerequisites": [
          "http-lifecycle"
      ],
      "useWhen": "Reducing bandwidth with Cache-Control, ETag, and 304.",
      "badges": [
          "Cache-Control · ETag"
      ],
      "quiz": [
          {
              "question": "304 Not Modified means:",
              "options": [
                  "Body re-downloaded",
                  "Reuse cached body",
                  "Server error",
                  "CORS blocked"
              ],
              "correctIndex": 1,
              "explanation": "Conditional request valid — client uses stored representation."
          },
          {
              "question": "ETag enables:",
              "options": [
                  "Encryption",
                  "Conditional validation",
                  "OAuth",
                  "GraphQL"
              ],
              "correctIndex": 1,
              "explanation": "If-None-Match sends prior ETag; server responds 304 if unchanged."
          }
      ]
  },
  "tls-handshake": {
      "prerequisites": [
          "http-lifecycle"
      ],
      "useWhen": "Understanding HTTPS latency and certificate validation.",
      "badges": [
          "TLS 1.2/1.3",
          "encrypted"
      ],
      "quiz": [
          {
              "question": "TLS provides:",
              "options": [
                  "Only compression",
                  "Encryption + authentication",
                  "DNS lookup",
                  "Load balancing"
              ],
              "correctIndex": 1,
              "explanation": "Handshake establishes keys and verifies server identity."
          },
          {
              "question": "TLS 1.3 reduces round trips by:",
              "options": [
                  "Removing encryption",
                  "Fewer handshake messages",
                  "Using HTTP/1.0",
                  "Skipping certificates"
              ],
              "correctIndex": 1,
              "explanation": "1-RTT handshake in common case vs more in 1.2."
          }
      ]
  },
  "rest-crud": {
      "prerequisites": [
          "http-lifecycle"
      ],
      "useWhen": "Designing resource-oriented HTTP APIs.",
      "badges": [
          "GET POST PUT DELETE"
      ],
      "quiz": [
          {
              "question": "REST maps resources to:",
              "options": [
                  "RPC method names only",
                  "URLs + HTTP verbs",
                  "WebSocket frames",
                  "SQL tables only"
              ],
              "correctIndex": 1,
              "explanation": "Nouns in paths; verbs express action via HTTP methods."
          },
          {
              "question": "PUT is typically:",
              "options": [
                  "Partial patch always",
                  "Idempotent full replace",
                  "Read-only",
                  "Subscribe"
              ],
              "correctIndex": 1,
              "explanation": "Repeated identical PUT has same effect — idempotent."
          }
      ]
  },
  "http-status-codes": {
      "prerequisites": [
          "http-lifecycle",
          "rest-crud"
      ],
      "useWhen": "Correct client/server behavior on success and errors.",
      "badges": [
          "2xx · 4xx · 5xx"
      ],
      "quiz": [
          {
              "question": "404 means:",
              "options": [
                  "Server crashed",
                  "Resource not found",
                  "Success",
                  "Rate limited"
              ],
              "correctIndex": 1,
              "explanation": "Client requested URI the server doesn't have."
          },
          {
              "question": "429 usually indicates:",
              "options": [
                  "OK",
                  "Too many requests",
                  "Created",
                  "Bad gateway"
              ],
              "correctIndex": 1,
              "explanation": "Rate limiting — client should back off or retry with care."
          }
      ]
  },
  "api-types": {
      "prerequisites": [
          "rest-crud",
          "http-status-codes"
      ],
      "useWhen": "Choosing REST, GraphQL, gRPC, or WebSockets.",
      "badges": [
          "REST · GraphQL · gRPC"
      ],
      "quiz": [
          {
              "question": "GraphQL main advantage:",
              "options": [
                  "Always faster than REST",
                  "Client specifies shape of response",
                  "No server needed",
                  "Binary only"
              ],
              "correctIndex": 1,
              "explanation": "Single endpoint; query selects fields needed."
          },
          {
              "question": "gRPC typically uses:",
              "options": [
                  "XML over HTTP/1.0",
                  "Protobuf over HTTP/2",
                  "HTML forms",
                  "FTP"
              ],
              "correctIndex": 1,
              "explanation": "Strongly typed contracts and efficient binary framing."
          }
      ]
  },
  "api-versioning": {
      "prerequisites": [
          "rest-crud",
          "api-types"
      ],
      "useWhen": "Shipping breaking API changes without breaking clients.",
      "badges": [
          "URL · header · media type"
      ],
      "quiz": [
          {
              "question": "URL versioning looks like:",
              "options": [
                  "/v2/users",
                  "X-Version: 2 only",
                  "No versioning ever",
                  "TCP port change"
              ],
              "correctIndex": 0,
              "explanation": "Explicit path prefix is common and visible."
          },
          {
              "question": "Breaking change example:",
              "options": [
                  "Adding optional field",
                  "Removing a field clients use",
                  "Adding endpoint",
                  "Fixing typo in docs"
              ],
              "correctIndex": 1,
              "explanation": "Removing or renaming used fields breaks existing clients."
          }
      ]
  },
  "graphql-vs-rest": {
      "prerequisites": [
          "rest-crud",
          "api-types"
      ],
      "useWhen": "Deciding between over-fetching REST and flexible GraphQL.",
      "badges": [
          "over-fetch · N+1"
      ],
      "quiz": [
          {
              "question": "REST over-fetching means:",
              "options": [
                  "Too many endpoints",
                  "Response includes unneeded fields",
                  "Too few status codes",
                  "No caching"
              ],
              "correctIndex": 1,
              "explanation": "Fixed resource representations may include extra data."
          },
          {
              "question": "GraphQL N+1 problem relates to:",
              "options": [
                  "Resolver per field hitting DB",
                  "HTTP/2 only",
                  "CORS",
                  "JWT size"
              ],
              "correctIndex": 0,
              "explanation": "Naive resolvers can trigger one query per nested field."
          }
      ]
  },
  "grpc-protobuf": {
      "prerequisites": [
          "api-types",
          "http-lifecycle"
      ],
      "useWhen": "Low-latency internal microservice RPC.",
      "badges": [
          "HTTP/2 · binary"
      ],
      "quiz": [
          {
              "question": ".proto files define:",
              "options": [
                  "CSS styles",
                  "Service contracts and messages",
                  "SQL schema only",
                  "DNS records"
              ],
              "correctIndex": 1,
              "explanation": "Schema-first code generation for clients and servers."
          },
          {
              "question": "gRPC streaming supports:",
              "options": [
                  "Unary only",
                  "Unary and streaming RPCs",
                  "Email only",
                  "Browser CORS by default"
              ],
              "correctIndex": 1,
              "explanation": "Client/server/bidirectional streams over HTTP/2."
          }
      ]
  },
  "cors": {
      "prerequisites": [
          "http-lifecycle",
          "rest-crud"
      ],
      "useWhen": "A browser app calls an API on a different domain.",
      "badges": [
          "browser security"
      ],
      "quiz": [
          {
              "question": "Who enforces CORS?",
              "options": [
                  "The API server",
                  "The browser",
                  "DNS",
                  "TLS"
              ],
              "correctIndex": 1,
              "explanation": "Servers respond with headers; the browser blocks JS from reading disallowed cross-origin responses."
          },
          {
              "question": "Preflight OPTIONS is triggered by:",
              "options": [
                  "Simple GET",
                  "Custom headers or non-simple methods",
                  "Same-origin requests",
                  "curl"
              ],
              "correctIndex": 1,
              "explanation": "Browser checks permission before sending non-simple cross-origin requests."
          }
      ]
  },
  "bearer-auth": {
      "prerequisites": [
          "http-lifecycle",
          "rest-crud"
      ],
      "useWhen": "Stateless API auth via Authorization header token.",
      "badges": [
          "Authorization header"
      ],
      "quiz": [
          {
              "question": "Bearer token is sent in:",
              "options": [
                  "Cookie only",
                  "Authorization: Bearer <token>",
                  "URL query always",
                  "HTML body"
              ],
              "correctIndex": 1,
              "explanation": "Standard header scheme for access tokens."
          },
          {
              "question": "Bearer implies:",
              "options": [
                  "Token is password — guard it",
                  "No HTTPS needed",
                  "Public cache OK",
                  "Automatic refresh"
              ],
              "correctIndex": 0,
              "explanation": "Anyone with the token can act as the user — treat as secret."
          }
      ]
  },
  "oauth2": {
      "prerequisites": [
          "bearer-auth",
          "http-lifecycle"
      ],
      "useWhen": "A third-party app needs limited access to a user's resources.",
      "badges": [
          "authorization code",
          "delegated access"
      ],
      "quiz": [
          {
              "question": "OAuth2 is for:",
              "options": [
                  "Password storage",
                  "Delegated authorization",
                  "HTML parsing",
                  "Sorting arrays"
              ],
              "correctIndex": 1,
              "explanation": "User grants scoped access without sharing password with client."
          },
          {
              "question": "Authorization code flow exchanges code for tokens at:",
              "options": [
                  "Browser JS only",
                  "Backend token endpoint",
                  "DNS server",
                  "CDN edge"
              ],
              "correctIndex": 1,
              "explanation": "Client secret stays on server — code swapped server-side."
          }
      ]
  },
  "jwt-structure": {
      "prerequisites": [
          "bearer-auth"
      ],
      "useWhen": "Self-contained signed tokens for stateless sessions.",
      "badges": [
          "stateless"
      ],
      "quiz": [
          {
              "question": "Is JWT payload encrypted?",
              "options": [
                  "Yes, always",
                  "No, only signed/encoded",
                  "Only with HTTPS",
                  "Only RS256"
              ],
              "correctIndex": 1,
              "explanation": "JWT payload is base64url-encoded JSON — readable by anyone. Signature prevents tampering."
          },
          {
              "question": "JWT has three parts separated by:",
              "options": [
                  "Commas",
                  "Dots (header.payload.signature)",
                  "Semicolons",
                  "Spaces"
              ],
              "correctIndex": 1,
              "explanation": "Base64url segments joined by periods."
          }
      ]
  },
  "pagination": {
      "prerequisites": [
          "rest-crud",
          "http-status-codes"
      ],
      "useWhen": "Listing large collections without huge responses.",
      "badges": [
          "offset · cursor"
      ],
      "quiz": [
          {
              "question": "Cursor pagination avoids:",
              "options": [
                  "Large offsets skipping rows",
                  "Consistent ordering",
                  "Any indexing",
                  "HTTP"
              ],
              "correctIndex": 0,
              "explanation": "OFFSET 1000000 still scans skipped rows — cursors use stable keys."
          },
          {
              "question": "Page/size params are:",
              "options": [
                  "Offset style",
                  "Cursor style",
                  "Both common patterns",
                  "GraphQL only"
              ],
              "correctIndex": 2,
              "explanation": "Offset/limit simple; cursor better for live feeds."
          }
      ]
  },
  "rate-limiting": {
      "prerequisites": [
          "http-status-codes",
          "pagination"
      ],
      "useWhen": "Protecting APIs from abuse and ensuring fair usage.",
      "badges": [
          "429 · token bucket"
      ],
      "quiz": [
          {
              "question": "Token bucket allows:",
              "options": [
                  "Strict zero burst",
                  "Controlled bursts",
                  "Unlimited traffic",
                  "Only daily caps"
              ],
              "correctIndex": 1,
              "explanation": "Tokens accumulate — short bursts OK if bucket has capacity."
          },
          {
              "question": "Clients should handle 429 with:",
              "options": [
                  "Infinite immediate retry",
                  "Backoff + Retry-After",
                  "Ignore",
                  "New OAuth scope"
              ],
              "correctIndex": 1,
              "explanation": "Respect Retry-After header or exponential backoff."
          }
      ]
  },
  "webhooks": {
      "prerequisites": [
          "rest-crud",
          "http-lifecycle"
      ],
      "useWhen": "Server pushes events to your URL instead of polling.",
      "badges": [
          "server → client POST"
      ],
      "quiz": [
          {
              "question": "Webhooks are:",
              "options": [
                  "Client polling loop",
                  "Server-initiated HTTP callbacks",
                  "DNS updates",
                  "WebSocket only"
              ],
              "correctIndex": 1,
              "explanation": "Provider POSTs event payload to your registered endpoint."
          },
          {
              "question": "Verify webhook authenticity with:",
              "options": [
                  "Ignore signatures",
                  "Shared secret or signature header",
                  "Public HTTP",
                  "CORS"
              ],
              "correctIndex": 1,
              "explanation": "HMAC signature (e.g. Stripe-Signature) prevents spoofing."
          }
      ]
  },
  "websockets-sse": {
      "prerequisites": [
          "http-lifecycle",
          "event-loop"
      ],
      "useWhen": "Real-time push — bidirectional WS or one-way SSE.",
      "badges": [
          "WS · SSE"
      ],
      "quiz": [
          {
              "question": "WebSockets provide:",
              "options": [
                  "Request/response only",
                  "Full-duplex persistent channel",
                  "Email delivery",
                  "File system access"
              ],
              "correctIndex": 1,
              "explanation": "Single TCP connection — both sides send frames anytime."
          },
          {
              "question": "SSE is:",
              "options": [
                  "Binary duplex",
                  "Server → client text stream over HTTP",
                  "UDP multicast",
                  "GraphQL only"
              ],
              "correctIndex": 1,
              "explanation": "EventSource receives text/event-stream from server."
          }
      ]
  },
  "idempotency-retries": {
      "prerequisites": [
          "rest-crud",
          "http-status-codes"
      ],
      "useWhen": "Safe retries on POST with Idempotency-Key or idempotent verbs.",
      "badges": [
          "Idempotency-Key",
          "PUT safe retry"
      ],
      "quiz": [
          {
              "question": "Idempotent request means:",
              "options": [
                  "Never fails",
                  "Repeating has same effect as once",
                  "No network",
                  "Cached forever"
              ],
              "correctIndex": 1,
              "explanation": "Retry after timeout won't double-charge or duplicate side effects."
          },
          {
              "question": "POST payments should use:",
              "options": [
                  "Random retries",
                  "Idempotency-Key header",
                  "GET instead",
                  "No logging"
              ],
              "correctIndex": 1,
              "explanation": "Server dedupes by key — safe client retries."
          }
      ]
  },
  "critical-rendering-path": {
      "prerequisites": [
          "http-lifecycle"
      ],
      "useWhen": "Optimizing first paint, layout thrashing, or render-blocking resources.",
      "badges": [
          "DOM → paint"
      ],
      "quiz": [
          {
              "question": "What combines the DOM and CSSOM?",
              "options": [
                  "JavaScript engine",
                  "Render tree",
                  "Call stack",
                  "HTTP cache"
              ],
              "correctIndex": 1,
              "explanation": "The render tree links visible DOM nodes to their computed styles from the CSSOM."
          },
          {
              "question": "Which change typically forces layout (reflow)?",
              "options": [
                  "Changing text color",
                  "Changing element width",
                  "Adding a CSS class name only",
                  "Composite layer promotion"
              ],
              "correctIndex": 1,
              "explanation": "Geometry changes (size, position) require layout; many color-only changes can skip to paint."
          }
      ]
  },
  "event-loop": {
      "prerequisites": [
          "queue",
          "stack"
      ],
      "useWhen": "Debugging async order, Promise timing, or 'why setTimeout(0) runs last'.",
      "badges": [
          "microtasks first"
      ],
      "quiz": [
          {
              "question": "Microtasks (Promises) run:",
              "options": [
                  "After next macrotask",
                  "Before next macrotask",
                  "Never",
                  "Only on load"
              ],
              "correctIndex": 1,
              "explanation": "Microtask queue drained after current sync code, before timer/I/O tasks."
          },
          {
              "question": "setTimeout(0) runs:",
              "options": [
                  "Immediately",
                  "After current stack and microtasks",
                  "Before sync code",
                  "Never in browser"
              ],
              "correctIndex": 1,
              "explanation": "Minimum delay — queued as macrotask after microtasks."
          }
      ]
  },
  "hydration": {
      "prerequisites": [
          "critical-rendering-path",
          "virtual-dom"
      ],
      "useWhen": "SSR HTML matched with client JavaScript on first load.",
      "badges": [
          "SSR"
      ],
      "quiz": [
          {
              "question": "Hydration attaches:",
              "options": [
                  "New DOM from scratch",
                  "Event listeners and state to server HTML",
                  "CSS only",
                  "Service worker"
              ],
              "correctIndex": 1,
              "explanation": "Client JS reuses server-rendered markup instead of replacing it."
          },
          {
              "question": "Hydration mismatch causes:",
              "options": [
                  "Faster paint",
                  "React warnings / re-render",
                  "CORS error",
                  "TLS failure"
              ],
              "correctIndex": 1,
              "explanation": "Server HTML ≠ client render — framework may discard and rebuild."
          }
      ]
  },
  "virtual-dom": {
      "prerequisites": [
          "tree-traversal"
      ],
      "useWhen": "Understanding React re-renders, keys, or why the DOM isn't rebuilt every time.",
      "badges": [
          "diff + patch"
      ],
      "quiz": [
          {
              "question": "Virtual DOM diff minimizes:",
              "options": [
                  "Network requests",
                  "Real DOM mutations",
                  "CPU sorting",
                  "Memory to zero"
              ],
              "correctIndex": 1,
              "explanation": "Batch and apply only necessary DOM updates."
          },
          {
              "question": "Keys in lists help:",
              "options": [
                  "Sort arrays",
                  "Identify stable identity across reorders",
                  "Hash passwords",
                  "Enable CORS"
              ],
              "correctIndex": 1,
              "explanation": "Correct keys preserve component state when items move."
          }
      ]
  },
  "component-rerenders": {
      "prerequisites": [
          "virtual-dom"
      ],
      "useWhen": "Tracing why React components update and how to reduce work.",
      "badges": [
          "React.memo"
      ],
      "quiz": [
          {
              "question": "What causes a child to skip re-render?",
              "options": [
                  "Parent rendered",
                  "Same props (with memo)",
                  "New key",
                  "useEffect"
              ],
              "correctIndex": 1,
              "explanation": "React.memo compares props; unchanged props bail out before reconciling children."
          },
          {
              "question": "Context change re-renders:",
              "options": [
                  "Only the provider",
                  "All consumers of that context",
                  "No components",
                  "Server only"
              ],
              "correctIndex": 1,
              "explanation": "Subscribers to updated context value re-render."
          }
      ]
  },
  "memoization": {
      "prerequisites": [
          "component-rerenders"
      ],
      "useWhen": "Caching expensive computations or stable callback references.",
      "badges": [
          "useMemo · useCallback"
      ],
      "quiz": [
          {
              "question": "useMemo caches:",
              "options": [
                  "DOM nodes",
                  "Computed values between renders",
                  "Network responses forever",
                  "CSS files"
              ],
              "correctIndex": 1,
              "explanation": "Recompute only when dependencies change."
          },
          {
              "question": "useCallback stabilizes:",
              "options": [
                  "State values",
                  "Function reference identity",
                  "Context provider",
                  "Router path"
              ],
              "correctIndex": 1,
              "explanation": "Same function reference prevents child memo breaking on every render."
          }
      ]
  },
  "client-routing": {
      "prerequisites": [
          "http-lifecycle"
      ],
      "useWhen": "Building SPAs, deep links, or debugging back-button behavior.",
      "badges": [
          "SPA · pushState"
      ],
      "quiz": [
          {
              "question": "history.pushState:",
              "options": [
                  "Reloads page",
                  "Updates URL without navigation request",
                  "Opens TCP socket",
                  "Sets cookie"
              ],
              "correctIndex": 1,
              "explanation": "Client router handles URL change — no full document load."
          },
          {
              "question": "Deep linking in SPA requires:",
              "options": [
                  "Server route fallback to index.html",
                  "No server",
                  "WebSocket only",
                  "GraphQL"
              ],
              "correctIndex": 0,
              "explanation": "Server must serve app shell for unknown paths client handles."
          }
      ]
  },
  "flexbox-box-model": {
      "prerequisites": [
          "critical-rendering-path"
      ],
      "useWhen": "Layout debugging — margin collapse, flex alignment, box sizing.",
      "badges": [
          "flex · box-model"
      ],
      "quiz": [
          {
              "question": "box-sizing: border-box includes:",
              "options": [
                  "Only content",
                  "Padding and border in width",
                  "Margin only",
                  "Outline only"
              ],
              "correctIndex": 1,
              "explanation": "Width/height include padding and border — easier layout math."
          },
          {
              "question": "justify-content aligns along:",
              "options": [
                  "Cross axis",
                  "Main axis",
                  "Z axis",
                  "Viewport diagonal"
              ],
              "correctIndex": 1,
              "explanation": "Main axis is flex-direction; justify-content distributes on it."
          }
      ]
  },
  "debounce-throttle": {
      "prerequisites": [
          "sliding-window",
          "event-loop"
      ],
      "useWhen": "Search inputs (debounce) or scroll/resize listeners (throttle).",
      "badges": [
          "rate limit UI"
      ],
      "shufflable": true,
      "quiz": [
          {
              "question": "Which waits for the user to stop typing?",
              "options": [
                  "Throttle",
                  "Debounce",
                  "Memo",
                  "Prefetch"
              ],
              "correctIndex": 1,
              "explanation": "Debounce resets a timer on each event and fires after a quiet period."
          },
          {
              "question": "Throttle guarantees at most:",
              "options": [
                  "One call ever",
                  "One call per time window",
                  "Zero calls",
                  "Infinite calls"
              ],
              "correctIndex": 1,
              "explanation": "Execute at most once per interval during continuous events."
          }
      ]
  },
  "list-virtualization": {
      "prerequisites": [
          "sliding-window"
      ],
      "useWhen": "Tables or feeds with thousands of items stutter on scroll.",
      "badges": [
          "O(viewport) DOM"
      ],
      "quiz": [
          {
              "question": "Virtualization renders:",
              "options": [
                  "All rows always",
                  "Only visible rows + buffer",
                  "No DOM",
                  "Server HTML only"
              ],
              "correctIndex": 1,
              "explanation": "Recycle DOM nodes for items entering/leaving viewport."
          },
          {
              "question": "Main benefit:",
              "options": [
                  "Smaller bundle",
                  "Constant DOM size vs list length",
                  "No JavaScript",
                  "Automatic SEO"
              ],
              "correctIndex": 1,
              "explanation": "10k items don't mean 10k DOM nodes."
          }
      ]
  },
  "client-data-fetching": {
      "prerequisites": [
          "lru-cache",
          "http-lifecycle"
      ],
      "useWhen": "Caching, stale-while-revalidate, and deduped API calls in UI.",
      "badges": [
          "SWR · React Query"
      ],
      "quiz": [
          {
              "question": "Stale-while-revalidate shows:",
              "options": [
                  "Loading forever",
                  "Cached data then refreshes",
                  "Error only",
                  "Empty screen"
              ],
              "correctIndex": 1,
              "explanation": "Instant stale UI while fetching fresh data in background."
          },
          {
              "question": "Request deduplication prevents:",
              "options": [
                  "Caching",
                  "Multiple identical in-flight requests",
                  "HTTP/2",
                  "CORS"
              ],
              "correctIndex": 1,
              "explanation": "Same key in flight — share one network call."
          }
      ]
  },
  "optimistic-ui": {
      "prerequisites": [
          "rest-crud",
          "client-data-fetching"
      ],
      "useWhen": "Instant UI feedback before server confirms mutation.",
      "badges": [
          "rollback on error"
      ],
      "quiz": [
          {
              "question": "Optimistic update:",
              "options": [
                  "Waits for server always",
                  "Updates UI immediately, rolls back on failure",
                  "Skips network",
                  "Disables cache"
              ],
              "correctIndex": 1,
              "explanation": "Assume success for responsiveness; revert if mutation fails."
          },
          {
              "question": "Needs careful handling of:",
              "options": [
                  "CSS colors",
                  "Conflict and error rollback",
                  "DNS",
                  "TLS ciphers"
              ],
              "correctIndex": 1,
              "explanation": "Failed requests must restore prior state and inform user."
          }
      ]
  },
  "longest-increasing-subsequence": {
      prerequisites: ["fibonacci", "binary-search"],
      useWhen: "Longest increasing subsequence in O(n log n) with patience sorting.",
      badges: ["O(n log n)", "patience sorting"],
      quiz: [
          {
              question: "LIS length with patience sorting uses:",
              options: ["A stack only", "Binary search on pile tops", "Radix sort", "Union-find"],
              correctIndex: 1,
              explanation: "Each card goes on the leftmost pile whose top is ≥ current value — binary search on pile tops.",
          },
          {
              question: "Naive LIS DP is:",
              options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
              correctIndex: 2,
              explanation: "dp[i] = best length ending at i — O(n²) without the log n optimization.",
          },
      ],
  },
  "greedy-activity": {
      prerequisites: ["two-pointers"],
      useWhen: "Scheduling rooms, CPU jobs, or any interval packing problem.",
      badges: ["O(n log n)", "greedy optimal"],
      quiz: [
          {
              question: "Activity selection sorts by:",
              options: ["Start time only", "Finish time ascending", "Duration", "Random"],
              correctIndex: 1,
              explanation: "Pick earliest-finishing compatible activity — classic greedy proof.",
          },
          {
              question: "Greedy activity selection is optimal for:",
              options: ["Weighted intervals", "Unweighted maximum count", "All NP-hard scheduling", "Graph coloring"],
              correctIndex: 1,
              explanation: "Maximize count of non-overlapping intervals when weights are uniform.",
          },
      ],
  },
  "dns-resolution": {
      prerequisites: ["http-lifecycle"],
      useWhen: "Debugging hostname lookup failures or slow first requests.",
      badges: ["TTL · recursive resolver"],
      quiz: [
          {
              question: "DNS resolves:",
              options: ["IP to hostname", "Hostname to IP address", "HTTP status codes", "JWT claims"],
              correctIndex: 1,
              explanation: "Clients need an IP before opening a TCP connection to the host.",
          },
          {
              question: "TTL controls:",
              options: ["TLS cipher", "How long answers are cached", "TCP window size", "OAuth scope"],
              correctIndex: 1,
              explanation: "Time-to-live tells resolvers how long to reuse a cached record.",
          },
      ],
  },
  "tcp-handshake": {
      prerequisites: ["http-lifecycle", "dns-resolution"],
      useWhen: "Understanding connection setup before HTTP or TLS.",
      badges: ["SYN · SYN-ACK · ACK"],
      quiz: [
          {
              question: "TCP three-way handshake order:",
              options: ["ACK, SYN, SYN-ACK", "SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "TLS, HTTP, TCP"],
              correctIndex: 1,
              explanation: "Client SYN → server SYN-ACK → client ACK establishes the connection.",
          },
          {
              question: "After handshake, connection state is:",
              options: ["CLOSED", "ESTABLISHED", "LISTEN only", "TIME_WAIT on client only"],
              correctIndex: 1,
              explanation: "Both sides synchronized sequence numbers and ready for data transfer.",
          },
      ],
  },
  "csrf-protection": {
      prerequisites: ["cors", "bearer-auth"],
      useWhen: "Preventing cross-site form posts that abuse logged-in cookies.",
      badges: ["SameSite · CSRF token"],
      quiz: [
          {
              question: "CSRF attacks trick the browser into:",
              options: ["Reading response headers", "Sending authenticated requests the user didn't intend", "Changing DNS", "Breaking TLS"],
              correctIndex: 1,
              explanation: "A malicious site can trigger requests that include the victim's session cookies.",
          },
          {
              question: "SameSite=Lax cookies help by:",
              options: ["Encrypting payload", "Limiting cross-site cookie inclusion on navigations", "Disabling HTTPS", "Replacing OAuth"],
              correctIndex: 1,
              explanation: "Cross-site POST/subresource requests won't attach Strict/Lax cookies in many cases.",
          },
      ],
  },
  "css-grid": {
      prerequisites: ["flexbox-box-model"],
      useWhen: "Two-dimensional page layouts — rows, columns, and spanning cells.",
      badges: ["2D layout · fr tracks"],
      quiz: [
          {
              question: "CSS Grid is primarily:",
              options: ["One-dimensional like flex", "Two-dimensional rows and columns", "Only for typography", "JavaScript-only"],
              correctIndex: 1,
              explanation: "Grid defines explicit row and column tracks; items can span both axes.",
          },
          {
              question: "fr unit means:",
              options: ["Fixed pixels", "Fraction of free space", "Font relative", "Frame rate"],
              correctIndex: 1,
              explanation: "1fr takes one share of remaining space after fixed tracks are allocated.",
          },
      ],
  },
  "bucket-sort": {
      prerequisites: ["counting-sort", "insertion-sort"],
      useWhen: "Values are uniformly distributed over a known range.",
      badges: ["O(n) avg · O(n²) worst", "distribution-based"],
      shufflable: true,
      quiz: [
          {
              question: "Bucket sort works best when input is:",
              options: ["Reverse sorted", "Uniformly distributed", "All identical", "Random strings"],
              correctIndex: 1,
              explanation: "Even distribution keeps buckets balanced; skewed data degrades to O(n²).",
          },
          {
              question: "Each bucket is typically sorted with:",
              options: ["Merge sort", "Insertion sort", "Heap sort", "Radix sort"],
              correctIndex: 1,
              explanation: "Small buckets make insertion sort efficient.",
          },
      ],
  },
  "recursion-call-stack": {
      prerequisites: ["stack", "fibonacci"],
      useWhen: "Understanding recursive algorithms and stack overflow risk.",
      badges: ["O(n) stack depth", "call frames"],
      quiz: [
          {
              question: "Each recursive call:",
              options: ["Shares one global frame", "Pushes a new stack frame", "Uses the heap only", "Skips the call stack"],
              correctIndex: 1,
              explanation: "Every call gets its own frame with locals and return address.",
          },
          {
              question: "Stack overflow happens when:",
              options: ["Too many return values", "Recursion depth exceeds stack limit", "Base case is reached", "Using iteration"],
              correctIndex: 1,
              explanation: "Deep or infinite recursion exhausts the call stack.",
          },
      ],
  },
  "browser-storage": {
      prerequisites: ["critical-rendering-path", "http-caching"],
      useWhen: "Choosing where to persist client-side data.",
      badges: ["cookies · localStorage · IndexedDB"],
      quiz: [
          {
              question: "Which storage is automatically sent with HTTP requests?",
              options: ["localStorage", "sessionStorage", "Cookies", "IndexedDB"],
              correctIndex: 2,
              explanation: "Browsers attach matching cookies to every request for the domain.",
          },
          {
              question: "Why avoid JWTs in localStorage?",
              options: ["Too slow", "XSS can read it", "Expires immediately", "Not JSON-safe"],
              correctIndex: 1,
              explanation: "Any script on the page can access localStorage — use HttpOnly cookies for tokens.",
          },
      ],
  },
  "web-workers": {
      prerequisites: ["event-loop"],
      useWhen: "Heavy computation would block the main thread.",
      badges: ["parallel thread · postMessage"],
      quiz: [
          {
              question: "Web Workers can access:",
              options: ["The DOM directly", "window.alert", "Their own global scope", "Parent's variables"],
              correctIndex: 2,
              explanation: "Workers have a separate global (self) with no DOM access.",
          },
          {
              question: "Main ↔ worker communication uses:",
              options: ["Shared DOM", "postMessage", "Global variables", "Cookies"],
              correctIndex: 1,
              explanation: "Structured cloning via postMessage is the standard channel.",
          },
      ],
  },
  "load-balancing": {
      prerequisites: ["http-lifecycle", "rate-limiting"],
      useWhen: "Traffic exceeds one server's capacity or you need failover.",
      badges: ["round-robin · health checks"],
      quiz: [
          {
              question: "Least-connections routing picks:",
              options: ["Random server", "Server with fewest active connections", "Highest CPU", "First alphabetically"],
              correctIndex: 1,
              explanation: "Routes to the least busy backend for better load distribution.",
          },
          {
              question: "Health checks remove servers that:",
              options: ["Are too fast", "Fail probes or time out", "Use HTTPS", "Have low memory"],
              correctIndex: 1,
              explanation: "Unhealthy nodes are taken out of rotation until they recover.",
          },
      ],
  },
};

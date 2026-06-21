# Content Audit

Verification pass over all ~100 topic files (algorithms, data structures, backend, and frontend concepts). Checked: algorithm correctness, complexity badges, quiz answers, caption/explanation accuracy, and whether the visualization tracks the underlying state.

**Overall:** content is overwhelmingly correct after a second verification pass. Most algorithm implementations, complexity claims, quiz answers, and backend/frontend explanations are accurate. This pass found additional visualization/caption mismatches plus two security wording issues, all fixed.

Date: 2026-06-09

---

## Issues found & fixed in second pass

### 1. 🔴 Meet-in-the-middle — visualization did not implement the technique
**File:** `src/topics/meetInMiddle.tsx`

The walkthrough split the input but only compared single elements from each half. It did not enumerate subset sums, sort a half, or find the target even though the explanation described subset-sum meet-in-the-middle.

**Fix:** Reworked the steps to enumerate sorted subset sums for both halves and show a complementary pair summing to the target.

### 2. 🔴 Recursion call stack — displayed incorrect ancestor frames
**File:** `src/topics/recursionCallStack.tsx`

The stack frames were reconstructed from `k` and depth, which produced impossible ancestor chains such as showing `fib(3) → fib(2)` when the real chain was `fib(4) → fib(3)`.

**Fix:** Pass the actual call stack through recursion and render frames from that chain.

### 3. 🔴 Browser Storage — HttpOnly cookie shown as JavaScript-settable
**File:** `src/topics/browserStorage.tsx`

The code snippet used `document.cookie = "... HttpOnly ..."`. Browsers ignore `HttpOnly` from JavaScript; only a server can set it via `Set-Cookie`.

**Fix:** Split the example into a JavaScript-set non-auth cookie and a server `Set-Cookie` HttpOnly session cookie.

### 4. 🔴 CSRF — CORS listed as a CSRF defense
**File:** `src/topics/csrfProtection.tsx`

CORS controls cross-origin response access, not whether a browser can send a forged cookie-backed request. Listing it as a CSRF defense was misleading.

**Fix:** Replaced the CORS note with HTTPS plus custom CSRF headers for SPAs or bearer tokens instead of cookie sessions.

### 5. 🟡 OAuth 2.0 — authorize parameters displayed as headers
**File:** `src/topics/oauth2.tsx`

The visualization rendered `client_id`, `code_challenge`, and `redirect_uri` as request headers. In Authorization Code + PKCE, they are query parameters on the authorize URL.

**Fix:** Moved those values into the displayed `GET /authorize?...` request line.

### 6. 🟡 DNS Resolution — hierarchy steps and labels were inconsistent
**File:** `src/topics/dnsResolution.tsx`

The walkthrough described root → TLD → authoritative resolution but skipped the root step, labeled a resolver-to-browser answer as a TLD reply, and duplicated the final browser response.

**Fix:** Added the root-server step, made the TLD reply return authoritative NS information, and collapsed the final resolver/browser answer into one step.

### 7. 🟡 HTTP Lifecycle — HTTPS example skipped TLS
**File:** `src/topics/httpLifecycle.tsx`

The code used an `https://` URL, but the lifecycle went directly from TCP to HTTP request.

**Fix:** Added a TLS handshake phase between TCP connect and request sending, and updated the explanation.

### 8. 🟡 Virtual DOM — new tree count did not match rendered items
**File:** `src/topics/virtualDom.tsx`

The "New tree" step showed `count: 5` but still rendered only three `<Item>` nodes until the diff step.

**Fix:** Render five new-tree items whenever the new count is shown as changed.

### 9. 🟡 Floyd-Warshall — misleading "row locked" caption
**File:** `src/topics/floydWarshall.tsx`

Floyd-Warshall does not lock a row after each `k` pass; later intermediate nodes can still improve distances.

**Fix:** Reworded the caption to "Finished allowing X as an intermediate node."

### 10. 🟡 Bubble Sort — swap caption used post-swap values
**File:** `src/topics/bubbleSort.tsx`

The swap caption interpolated array values after the swap, reversing the comparison that caused the swap.

**Fix:** Captured pre-swap values for the caption.

### 11. 🟡 GraphQL vs REST — "N+1" used for client round trips
**File:** `src/topics/graphqlVsRest.tsx`

The REST caption used "N+1" to describe multiple client requests. N+1 more commonly means a server-side query pattern.

**Fix:** Reworded to "chatty API / overfetch risk."

### 12. 🟢 Deque — O(1) claim conflicted with Array snippet
**File:** `src/topics/deque.tsx`

The simplified snippet used `Array.unshift` / `Array.shift`, which are not O(1), while the explanation claimed O(1) at both ends.

**Fix:** Qualified the O(1) claim as applying to linked-list or circular-buffer backed deques and noted the snippet is simplified.

### 13. 🟢 Load Balancing — least-connection state continuity
**File:** `src/topics/loadBalancing.tsx`

The displayed S2 load drained before least-connections mode, but the underlying selection state did not reflect that drain.

**Fix:** Updated the internal load state to match the displayed transition.

---

## Issues found & fixed in first pass

### 1. 🔴 Coin Change — incorrect "greedy fails" example
**File:** `src/topics/coinChange.tsx`

The explanation claimed greedy fails on the demo input: *"The greedy approach fails here (9 = 3+3+3 beats 4+4+1)."* With coins `[1,3,4]` and amount `9`, both `3+3+3` and `4+4+1` use **3 coins** — they tie, so greedy does **not** fail at 9.

**Fix:** Reworded to use a correct counterexample — amount `6`, where greedy picks `4+1+1` (3 coins) but `3+3` (2 coins) is optimal. The DP code itself was always correct.

### 2. 🟡 JWT — signature algorithm inconsistent with header
**File:** `src/topics/jwtStructure.tsx`

Header declared `"alg":"RS256"` (RSA) and the verify code used `PUBLIC_KEY`, but the `SIG` display string showed `HMACSHA256(..., secret)` (HMAC). RS256 is RSA signing, not HMAC.

**Fix:** Changed `SIG` to `RSASHA256(base64(header)+'.'+base64(payload), privateKey)` to match the declared RS256 algorithm.

### 3. 🟡 Bloom filter — caption referenced wrong bit index
**File:** `src/topics/bloomFilter.tsx`

`query("carol")` caption said *"bit 0 is 0 → DEFINITELY absent."* carol actually hashes to bit `1` (both hash functions → 1), and bit `0` is set by "alice." The conclusion (absent) was correct but the cited index was wrong.

**Fix:** Reworded to the index-agnostic *"a hashed bit is still 0 → DEFINITELY absent."*

### 4. 🟡 Tarjan's SCC — non-canonical lowlink update in code snippet
**File:** `src/topics/tarjanScc.tsx`

The `CODE` snippet used `low[u] = min(low[u], low[v])` for on-stack neighbours. Canonical Tarjan uses `low[v]` only for tree edges (after recursing) and `index[v]` for back edges to on-stack nodes.

**Fix:** Split into the correct two branches — tree edge uses `low[v]`, back edge uses `index[v]`.

> Note: the on-screen animation is a hardcoded 5-step walkthrough of one specific graph rather than a live algorithm run. Left as-is (acceptable for an illustrative demo), but it will not generalize to other inputs.

### 5. 🟢 KMP — LPS fallback caption used stale index
**File:** `src/topics/kmp.tsx`

In the fallback branch the caption interpolated `lps[${len - 1}]` **after** `len` had already been reassigned, so the displayed index was off. Display-only; the LPS computation was correct.

**Fix:** Captured the previous index (`prev = len - 1`) before reassigning `len`, and referenced `prev` in the caption.

### 6. 🟢 Flexbox/Box model — "Margin collapses" step didn't show collapsing
**File:** `src/topics/flexboxBoxModel.tsx`

The phase was titled "Margin collapses" but only showed a larger margin, not actual vertical margin-collapse behavior.

**Fix:** Renamed the phase to "Margin spacing" and noted in the caption that vertical margins can collapse.

---

## Verified correct (no changes)

- **Sorting:** bubble, insertion, selection, merge, quick, heap, shell, counting, radix, bucket — implementations, stability claims, and complexity badges all accurate.
- **Searching / graphs:** linear, binary, binary-search-on-answer, Dijkstra, Bellman-Ford, Floyd-Warshall, A*, BFS, DFS, topological sort, Kruskal, Prim, union-find.
- **DP:** Fibonacci, climbing stairs, coin change (logic), knapsack, LCS, edit distance, LIS, Kadane, bitmask DP, meet-in-middle.
- **Strings:** KMP (logic), Rabin-Karp, Z-algorithm.
- **Data structures / trees:** stack, queue, deque, linked list, hash table, heap, BST, AVL, trie, segment tree, Fenwick, skip list, tree traversals.
- **Techniques:** two pointers, sliding window, prefix sums, monotonic stack, greedy activity selection, N-Queens, permutations, subsets, LRU cache.
- **Backend:** HTTP status codes, HTTP lifecycle, REST/CRUD, API versioning, API types, GraphQL vs REST, gRPC/Protobuf, TCP handshake, TLS handshake, DNS resolution, CORS, CSRF, bearer auth, OAuth 2.0 + PKCE, HTTP caching, idempotency/retries, load balancing, pagination, rate limiting, webhooks, WebSockets/SSE.
- **Frontend:** event loop, debounce/throttle, virtual DOM, hydration, critical rendering path, component re-renders, client routing, client data fetching, browser storage, web workers, list virtualization, optimistic UI, CSS grid, box model/flexbox.

## Notes

- Structural inventory is clean: 99 topic files, 99 registered topics, and 99 metadata entries. No missing IDs, duplicate IDs, unregistered topics, extra metadata entries, missing `create()` functions, or missing explanations were found.
- Quiz coverage was checked for valid answer indices, and reviewed topic quiz answers matched the explanations.
- Some visualizations are intentionally scripted walkthroughs rather than general-purpose live simulations. They are acceptable where captions and explanations frame them as illustrative and the displayed states remain internally consistent.
- Security-sensitive topics were rechecked for common misconceptions. The CSRF, browser storage, OAuth/JWT, bearer auth, CORS, and TLS content now uses accurate terminology for the examples shown.

`npx tsc --noEmit` passes after all fixes.

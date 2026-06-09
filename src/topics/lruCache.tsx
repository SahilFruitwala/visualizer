import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { Arrow } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Entry {
  key: number;
  val: string;
}

interface Step extends StepBase {
  list: Entry[];
  op: "put" | "get" | "evict" | null;
  targetKey: number | null;
  evictedKey: number | null;
  hit: boolean | null;
}

const CAPACITY = 3;

const OPS: { kind: "put" | "get"; key: number; val?: string }[] = [
  { kind: "put", key: 1, val: "A" },
  { kind: "put", key: 2, val: "B" },
  { kind: "put", key: 3, val: "C" },
  { kind: "get", key: 2 },
  { kind: "put", key: 4, val: "D" },
  { kind: "get", key: 1 },
  { kind: "put", key: 5, val: "E" },
  { kind: "get", key: 3 },
];

function build() {
  const map = new Map<number, Entry>();
  const list: Entry[] = [];
  const steps: Step[] = [];

  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({
      list: list.map((x) => ({ ...x })),
      op: null,
      targetKey: null,
      evictedKey: null,
      hit: null,
      ...e,
    });

  snap({
    chapter: "Introduction",
    caption: `LRU cache (capacity ${CAPACITY}): hash map + doubly linked list. MRU at head, LRU at tail.`,
    insight: "get/put both move the entry to the front. Evict the tail when over capacity.",
  });

  const moveToFront = (entry: Entry) => {
    const i = list.indexOf(entry);
    if (i > 0) {
      list.splice(i, 1);
      list.unshift(entry);
    }
  };

  for (const op of OPS) {
    if (op.kind === "get") {
      snap({ op: "get", targetKey: op.key, caption: `get(${op.key}) — look up in hash map.` });
      const entry = map.get(op.key);
      if (entry) {
        moveToFront(entry);
        snap({ op: "get", targetKey: op.key, hit: true, caption: `Hit! Move key ${op.key} to MRU (head).` });
      } else {
        snap({ op: "get", targetKey: op.key, hit: false, caption: `Miss — key ${op.key} not in cache.` });
      }
    } else {
      snap({ op: "put", targetKey: op.key, caption: `put(${op.key}, "${op.val}") — insert or update.` });
      let entry = map.get(op.key);
      if (entry) {
        entry.val = op.val!;
        moveToFront(entry);
        snap({ op: "put", targetKey: op.key, hit: true, caption: `Key ${op.key} exists → update value, move to MRU.` });
      } else {
        entry = { key: op.key, val: op.val! };
        map.set(op.key, entry);
        list.unshift(entry);
        snap({ op: "put", targetKey: op.key, hit: false, caption: `New key → add at head (MRU).` });
        if (list.length > CAPACITY) {
          const evicted = list.pop()!;
          map.delete(evicted.key);
          snap({
            op: "evict",
            targetKey: op.key,
            evictedKey: evicted.key,
            caption: `Over capacity → evict LRU key ${evicted.key} from tail.`,
          });
        }
      }
    }
  }

  snap({ chapter: "Summary", caption: "All ops O(1): map lookup + list splice at known nodes." });
  return withCodeLines(steps, (s) => {
    if (s.caption.startsWith("LRU cache")) return [0, 1, 2];
    if (s.op === "get" && s.hit === null) return [4, 5];
    if (s.op === "get" && s.hit) return [6, 7, 8];
    if (s.op === "get" && s.hit === false) return [4, 5, 9];
    if (s.op === "put" && s.caption.includes("insert or update")) return [10, 11];
    if (s.op === "put" && s.hit) return [12, 13, 14];
    if (s.op === "put" && s.caption.includes("New key")) return [15, 16, 17];
    if (s.op === "evict") return [18, 19, 20];
    return [0];
  });
}

const CODE = `class LRUCache {
  cap; map = new Map(); // key → node
  head; tail;          // doubly linked list

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this.moveToFront(node);  // O(1)
    return node.val;
  }

  put(key, val) {
    if (this.map.has(key)) { this.map.get(key).val = val; this.moveToFront(...); return; }
    const node = { key, val, prev: null, next: null };
    this.addToFront(node);
    this.map.set(key, node);
    if (this.size > this.cap) { this.removeTail(); this.map.delete(evicted.key); }
  }
}`;

export const lruCache: Topic = {
  id: "lru-cache",
  title: "LRU Cache",
  category: "Hashing",
  blurb: "Hash map + doubly linked list for O(1) get/put with eviction.",
  useWhen: "You need a fixed-size cache that drops the least recently used item.",
  badges: ["O(1) get/put"],
  prerequisites: ["hash-table", "linked-list"],
  quiz: [
    {
      question: "Which entry is evicted when the cache is full?",
      options: ["Most recently used", "Least recently used", "Random", "Largest key"],
      correctIndex: 1,
      explanation: "LRU evicts the tail — the entry that hasn't been accessed longest.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "An LRU cache combines a hash map (O(1) lookup) with a doubly linked list (O(1) reorder). Every get or put moves the entry to the head (most recently used). When capacity is exceeded, the tail (least recently used) is removed.\n\nget / put: O(1) each",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {s.list.map((e) => (
              <div
                key={e.key}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: C.surface,
                  border: `2px solid ${C.surfaceBorder}`,
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  color: C.textMuted,
                }}
              >
                {e.key} → <span style={{ color: C.text, fontWeight: 700 }}>"{e.val}"</span>
              </div>
            ))}
            {s.list.length === 0 && (
              <span style={{ fontFamily: FONT_MONO, color: C.textMuted }}>map: ∅</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center" }}>
            <Label text="MRU" color={C.sorted} />
            <Arrow active />
            {s.list.length === 0 ? (
              <div style={{ fontFamily: FONT_MONO, color: C.textMuted, padding: "20px 30px", border: `2px dashed ${C.surfaceBorder}`, borderRadius: 10 }}>
                empty
              </div>
            ) : (
              s.list.map((e, i) => {
                const isTarget = e.key === s.targetKey && s.op !== "evict";
                const isEvicted = e.key === s.evictedKey;
                const isHead = i === 0;
                const isTail = i === s.list.length - 1;
                const bg = isEvicted ? C.compare : isTarget ? C.active : isHead ? C.sorted : isTail ? C.pointer : C.default;
                const dark = !isTarget && !isEvicted && !isHead;
                return (
                  <div key={`${e.key}-${i}`} style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "transform 200ms",
                      }}
                    >
                      <div
                        style={{
                          padding: "14px 18px",
                          borderRadius: 10,
                          background: bg,
                          border: `2px solid ${C.surfaceBorder}`,
                          fontFamily: FONT_MONO,
                          fontWeight: 700,
                          fontSize: 18,
                          color: dark ? C.text : C.ink,
                          transition: "background 200ms",
                        }}
                      >
                        {e.key}:{e.val}
                      </div>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>
                        {isHead ? "head" : isTail ? "tail" : ""}
                      </span>
                    </div>
                    {i < s.list.length - 1 && <Arrow active={isTarget || isEvicted} />}
                  </div>
                );
              })
            )}
            <Arrow active />
            <Label text="LRU" color={C.pointer} />
          </div>
          {s.hit === false && s.op === "get" && (
            <div style={{ fontFamily: FONT_MONO, color: C.compare, fontWeight: 700 }}>cache miss</div>
          )}
        </div>
      ),
    }),
};

function Label({ text, color }: { text: string; color: string }) {
  return <div style={{ fontFamily: FONT_MONO, fontSize: 14, color, fontWeight: 700, margin: "0 4px" }}>{text}</div>;
}

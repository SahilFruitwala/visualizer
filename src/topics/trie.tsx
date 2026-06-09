import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface TrieNode {
  ch: string;
  end: boolean;
  children: Map<string, TrieNode>;
}
interface Placed {
  id: number;
  ch: string;
  end: boolean;
  x: number;
  y: number;
  parent: number | null;
}

interface Step extends StepBase {
  nodes: Placed[];
  path: number[]; // node ids on the active path
  status: "insert" | "hit" | "miss" | null;
}

const newNode = (ch: string): TrieNode => ({ ch, end: false, children: new Map() });

function layout(root: TrieNode): { placed: Placed[]; idOf: Map<TrieNode, number> } {
  const placed: Placed[] = [];
  const idOf = new Map<TrieNode, number>();
  let leaf = 0;
  let id = 0;
  const assignX = (n: TrieNode): number => {
    if (n.children.size === 0) return leaf++;
    const xs = [...n.children.values()].map(assignX);
    return (Math.min(...xs) + Math.max(...xs)) / 2;
  };
  const emit = (n: TrieNode, depth: number, parent: number | null, x: number) => {
    const myId = id++;
    idOf.set(n, myId);
    placed.push({ id: myId, ch: n.ch, end: n.end, x, y: depth, parent });
    const kids = [...n.children.values()];
    const xs = kids.map(assignXCached);
    kids.forEach((k, i) => emit(k, depth + 1, myId, xs[i]));
  };
  const xcache = new Map<TrieNode, number>();
  function assignXCached(n: TrieNode): number {
    if (xcache.has(n)) return xcache.get(n)!;
    const v = n.children.size === 0 ? leaf++ : (() => {
      const xs = [...n.children.values()].map(assignXCached);
      return (Math.min(...xs) + Math.max(...xs)) / 2;
    })();
    xcache.set(n, v);
    return v;
  }
  void assignX;
  emit(root, 0, null, assignXCached(root));
  return { placed, idOf };
}

function build() {
  const root = newNode("•");
  const steps: Step[] = [];
  const snap = (path: number[], status: Step["status"], caption: string) => {
    const { placed } = layout(root);
    steps.push({ nodes: placed, path, status, caption });
  };

  snap([], null, "A trie stores words by shared prefixes, one character per edge.");

  const insert = (word: string) => {
    let cur = root;
    let prefix = "";
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, newNode(c));
      cur = cur.children.get(c)!;
      prefix += c;
      snap(pathIds(root, prefix), "insert", `Insert "${word}": add/reuse '${c}'.`);
    }
    cur.end = true;
    snap(pathIds(root, word), "insert", `Mark end of "${word}". ✓`);
  };
  for (const w of ["cat", "car", "card", "dog"]) insert(w);

  const search = (word: string, expect: boolean) => {
    let cur: TrieNode | undefined = root;
    for (let i = 0; i < word.length; i++) {
      cur = cur?.children.get(word[i]);
      if (!cur) {
        snap(pathIds(root, word.slice(0, i)), "miss", `Search "${word}": no '${word[i]}' edge → not found.`);
        return;
      }
      snap(pathIds(root, word.slice(0, i + 1)), null, `Search "${word}": follow '${word[i]}'.`);
    }
    snap(pathIds(root, word), cur!.end === expect && expect ? "hit" : "miss", cur!.end ? `"${word}" is a complete word. ✓` : `"${word}" is only a prefix.`);
  };
  search("car", true);
  search("ca", false);

  return steps;

  function pathIds(r: TrieNode, prefix: string): number[] {
    const { idOf } = layout(r);
    const ids = [idOf.get(r)!];
    let cur: TrieNode | undefined = r;
    for (const c of prefix) {
      cur = cur?.children.get(c);
      if (!cur) break;
      ids.push(idOf.get(cur)!);
    }
    return ids;
  }
}

const CODE = `class Trie {
  root = { children: {}, end: false };
  insert(word) {
    let node = this.root;
    for (const c of word)
      node = node.children[c] ??= { children: {}, end: false };
    node.end = true;
  }
  has(word) {
    let node = this.root;
    for (const c of word) { node = node.children[c]; if (!node) return false; }
    return node.end;
  }
}`;

const W = 520, H = 320, PAD = 36;

export const trie: Topic = {
  id: "trie",
  title: "Trie (Prefix Tree)",
  category: "Data Structures",
  blurb: "Store strings by shared character prefixes.",
  create: () => {
    const steps = build();
    const maxX = Math.max(1, ...steps.flatMap((s) => s.nodes.map((n) => n.x)));
    return defineViz<Step>({
      steps,
      code: CODE,
      explanation:
        "A trie branches one character at a time, so words sharing a prefix share a path (cat / car / card). Nodes marked as word-ends are highlighted green. Great for autocomplete and dictionaries.\n\ninsert / search: O(L) where L = word length",
      renderStep: (s) => {
        const x = (xi: number) => PAD + (maxX === 0 ? 0.5 : xi / maxX) * (W - 2 * PAD);
        const y = (d: number) => PAD + d * 62;
        const byId = new Map(s.nodes.map((n) => [n.id, n]));
        return (
          <svg width={W} height={H} style={{ overflow: "visible" }}>
            {s.nodes.map((n) =>
              n.parent != null ? (
                <line key={`e${n.id}`} x1={x(n.x)} y1={y(n.y)} x2={x(byId.get(n.parent)!.x)} y2={y(byId.get(n.parent)!.y)} stroke={s.path.includes(n.id) ? C.active : C.surfaceBorder} strokeWidth={2} style={{ transition: "stroke 200ms" }} />
              ) : null,
            )}
            {s.nodes.map((n) => {
              const on = s.path.includes(n.id);
              const fill = n.end ? C.sorted : on ? C.active : C.default;
              return (
                <g key={n.id}>
                  <circle cx={x(n.x)} cy={y(n.y)} r={17} fill={fill} stroke={C.surfaceBorder} strokeWidth={2} style={{ transition: "fill 200ms" }} />
                  <text x={x(n.x)} y={y(n.y) + 5} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={15} fill={n.end || on ? "#0e1424" : C.text}>{n.ch}</text>
                </g>
              );
            })}
          </svg>
        );
      },
    });
  },
};

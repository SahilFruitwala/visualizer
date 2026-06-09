import { BloomFilterView } from "../components/BackendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

const SIZE = 16;
interface Step extends StepBase {
  bits: boolean[];
  queries: { key: string; hashes: number[]; maybe: boolean }[];
  phase: string;
}

function h1(s: string) { let x = 0; for (const c of s) x = (x + c.charCodeAt(0)) % SIZE; return x; }
function h2(s: string) { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) % SIZE; return x; }

function build(): Step[] {
  const bits = Array(SIZE).fill(false);
  const steps: Step[] = [];
  const snap = (caption: string, extra?: Partial<Step>) => steps.push({ bits: [...bits], queries: [], phase: "Insert", caption, ...extra });

  snap("Bloom filter: k hash functions map into a bit array — space-efficient set membership.", { chapter: "Overview" });
  for (const key of ["alice", "bob"]) {
    const hashes = [h1(key), h2(key)];
    for (const i of hashes) bits[i] = true;
    snap(`insert("${key}") → set bits ${hashes.join(", ")}.`, { queries: [{ key, hashes, maybe: true }] });
  }
  snap('query("alice") → both bits 1 → MAYBE present (no false negatives).', { phase: "Query", queries: [{ key: "alice", hashes: [h1("alice"), h2("alice")], maybe: true }] });
  snap('query("carol") → bit 0 is 0 → DEFINITELY absent. ✓', { queries: [{ key: "carol", hashes: [h1("carol"), h2("carol")], maybe: false }], insight: "False positives possible; false negatives never." });
  return steps;
}

const CODE = `class BloomFilter {
  bits = new Uint8Array(m);
  insert(x) { for (const h of hashes) bits[h(x) % m] = 1; }
  maybeHas(x) { return hashes.every(h => bits[h(x) % m]); }
}`;

export const bloomFilter: Topic = {
  id: "bloom-filter",
  title: "Bloom Filter",
  category: "Hashing",
  blurb: "Probabilistic set — maybe present, definitely absent.",
  prerequisites: ["hash-table"],
  badges: ["O(k) lookup"],
  create: () => defineViz<Step>({ steps: build(), code: CODE, explanation: "A Bloom filter uses k hash functions into a bit array. Insert sets bits; query checks all k bits. No false negatives, but false positives possible.\n\nUsed in databases, CDNs, and spell-checkers.", renderStep: (s) => <BloomFilterView bits={s.bits} size={SIZE} queries={s.queries} phase={s.phase} /> }),
};

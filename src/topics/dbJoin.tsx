import type { ReactNode } from "react";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

// users ⋈ orders ON users.id = orders.userId
const USERS = [
  { id: 1, name: "Amy" },
  { id: 2, name: "Ben" },
  { id: 3, name: "Cara" },
];
const ORDERS = [
  { id: 101, userId: 2 },
  { id: 102, userId: 1 },
  { id: 103, userId: 2 },
  { id: 104, userId: 3 },
];

interface Step extends StepBase {
  mode: "nested" | "hash";
  // nested loop: current outer user index + inner order index
  uIdx?: number;
  oIdx?: number;
  // hash join: which user ids are in the hash table so far
  hashed?: number[];
  probingOrder?: number; // order index being probed
  comparisons: number;
  result: string[]; // accumulated "Amy-102" style matches
}

function build(): Step[] {
  const steps: Step[] = [];
  const fmt = (uName: string, oId: number) => `${uName} · #${oId}`;

  // ---- Nested loop join: for each user, scan every order ----
  let result: string[] = [];
  let cmp = 0;
  steps.push({
    mode: "nested",
    comparisons: 0,
    result: [],
    chapter: "Nested loop join",
    caption: "Nested loop: for every user, scan every order. O(n × m) comparisons.",
    codeLines: [0, 1, 2],
  });
  for (let u = 0; u < USERS.length; u++) {
    for (let o = 0; o < ORDERS.length; o++) {
      cmp++;
      const match = USERS[u].id === ORDERS[o].userId;
      if (match) result = [...result, fmt(USERS[u].name, ORDERS[o].id)];
      steps.push({
        mode: "nested",
        uIdx: u,
        oIdx: o,
        comparisons: cmp,
        result,
        caption: match
          ? `users.id ${USERS[u].id} = orders.userId ${ORDERS[o].userId} → emit ${fmt(USERS[u].name, ORDERS[o].id)}.`
          : `users.id ${USERS[u].id} ≠ orders.userId ${ORDERS[o].userId} — skip.`,
        codeLines: match ? [3] : [2],
      });
    }
  }

  // ---- Hash join: build a hash of users, then probe once per order ----
  result = [];
  cmp = 0;
  const hashed: number[] = [];
  steps.push({
    mode: "hash",
    hashed: [],
    comparisons: 0,
    result: [],
    chapter: "Hash join",
    caption: "Hash join, phase 1 — build: load the smaller table (users) into a hash map by join key.",
    codeLines: [6, 7],
  });
  for (let u = 0; u < USERS.length; u++) {
    hashed.push(USERS[u].id);
    steps.push({
      mode: "hash",
      uIdx: u,
      hashed: [...hashed],
      comparisons: 0,
      result: [],
      caption: `Build: hash[${USERS[u].id}] = ${USERS[u].name}.`,
      codeLines: [7],
    });
  }
  for (let o = 0; o < ORDERS.length; o++) {
    cmp++; // one hash probe ≈ O(1)
    const user = USERS.find((x) => x.id === ORDERS[o].userId);
    if (user) result = [...result, fmt(user.name, ORDERS[o].id)];
    steps.push({
      mode: "hash",
      hashed: [...hashed],
      probingOrder: o,
      comparisons: cmp,
      result,
      caption: user
        ? `Probe: hash[${ORDERS[o].userId}] hits ${user.name} → emit ${fmt(user.name, ORDERS[o].id)}. One lookup, not a scan.`
        : `Probe: hash[${ORDERS[o].userId}] is empty — no match.`,
      codeLines: [9, 10],
    });
  }

  return steps;
}

const CODE = `-- SELECT u.name, o.id FROM users u JOIN orders o ON u.id = o.userId;

// Nested loop join — O(n × m)
for (const u of users)
  for (const o of orders)
    if (u.id === o.userId) emit(u.name, o.id);

// Hash join — O(n + m)
const h = new Map();
for (const u of users) h.set(u.id, u);   // build
for (const o of orders) {                 // probe
  const u = h.get(o.userId);
  if (u) emit(u.name, o.id);
}`;

export const dbJoin: Topic = {
  id: "db-join",
  title: "Database Join",
  category: "Database",
  blurb: "Nested loop join vs hash join.",
  useWhen: "You combine rows from two tables on a matching key.",
  badges: ["Nested: O(n×m)", "Hash: O(n+m)"],
  quiz: [
    {
      question: "Why is a hash join usually faster than a nested loop join on large tables?",
      options: [
        "It skips the join condition",
        "Each row probes a hash map in O(1) instead of scanning the other table",
        "It only returns the first match",
        "It sorts both tables first",
      ],
      correctIndex: 1,
      explanation:
        "Hash join builds a hash of one table, then each row of the other does a single O(1) lookup — O(n+m) instead of O(n×m).",
    },
    {
      question: "When is a nested loop join actually a good choice?",
      options: [
        "When both tables are huge",
        "When one side is tiny or the join key is already indexed",
        "Never",
        "Only for OUTER joins",
      ],
      correctIndex: 1,
      explanation:
        "For small inputs or an indexed inner side, nested loop joins are cheap and avoid building a hash table.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "A join combines rows from two tables on a matching key. A nested loop join compares every row of one table against every row of the other — O(n × m). A hash join first builds a hash map of the smaller table keyed by the join column, then probes it once per row of the other table — O(n + m).\n\nReal query planners pick a strategy from table sizes and available indexes: nested loop for tiny/indexed inputs, hash join for large unsorted inputs, and merge join when both sides are already sorted.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: s.mode === "nested" ? C.compare : C.sorted,
              fontWeight: 700,
            }}
          >
            {s.mode === "nested" ? "Nested loop join" : "Hash join"}
          </div>

          <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
            {/* users table */}
            <Table label="users">
              {USERS.map((u, i) => {
                let state: "default" | "active" | "sorted" | "muted" = "default";
                if (s.mode === "nested") {
                  if (i === s.uIdx) state = "active";
                } else if (s.hashed?.includes(u.id)) {
                  state = i === s.uIdx ? "active" : "sorted";
                } else {
                  state = "muted";
                }
                return (
                  <RowCell key={u.id} state={state} text={`${u.id}  ${u.name}`} />
                );
              })}
            </Table>

            {/* orders table */}
            <Table label="orders">
              {ORDERS.map((o, i) => {
                let state: "default" | "active" | "compare" | "muted" = "default";
                if (s.mode === "nested") {
                  if (i === s.oIdx) state = s.uIdx != null && USERS[s.uIdx].id === o.userId ? "active" : "compare";
                } else {
                  if (i === s.probingOrder) state = "active";
                  else if (s.probingOrder != null && i < s.probingOrder) state = "muted";
                }
                return (
                  <RowCell key={o.id} state={state} text={`#${o.id} → u${o.userId}`} />
                );
              })}
            </Table>
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.textMuted }}>
            {s.mode === "nested" ? "comparisons: " : "probes: "}
            <span style={{ color: s.mode === "nested" ? C.compare : C.sorted, fontWeight: 700 }}>
              {s.comparisons}
            </span>
            {"  ·  result: ["}
            {s.result.join(", ")}
            {"]"}
          </div>
        </div>
      ),
    }),
};

function Table({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

const ROW_COLOR: Record<string, string> = {
  default: C.default,
  active: C.active,
  compare: C.compare,
  sorted: C.sorted,
  muted: C.cellMuted,
};

function RowCell({ state, text }: { state: "default" | "active" | "compare" | "sorted" | "muted"; text: string }) {
  const accent = ROW_COLOR[state];
  const lit = state === "active" || state === "compare" || state === "sorted";
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 13,
        padding: "8px 14px",
        minWidth: 96,
        textAlign: "center",
        borderRadius: 8,
        background: lit ? accent : "transparent",
        border: `2px solid ${accent}`,
        color: lit ? C.ink : C.text,
        opacity: state === "muted" ? 0.45 : 1,
        transition: "all 200ms ease",
      }}
    >
      {text}
    </div>
  );
}

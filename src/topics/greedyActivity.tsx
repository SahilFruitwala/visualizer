import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO } from "../theme";

interface Activity {
  id: string;
  start: number;
  end: number;
}

interface Step extends StepBase {
  activities: Activity[];
  sorted: Activity[];
  selected: string[];
  current: string | null;
  rejected: string[];
  maxTime: number;
}

const ACTIVITIES: Activity[] = [
  { id: "a1", start: 1, end: 4 },
  { id: "a2", start: 3, end: 5 },
  { id: "a3", start: 0, end: 6 },
  { id: "a4", start: 5, end: 7 },
  { id: "a5", start: 8, end: 9 },
  { id: "a6", start: 5, end: 9 },
];

function build(acts: Activity[]): Step[] {
  const sorted = [...acts].sort((a, b) => a.end - b.end);
  const maxTime = Math.max(...acts.map((a) => a.end));
  const steps: Step[] = [];
  const selected: string[] = [];
  const rejected: string[] = [];
  let lastEnd = -1;

  const snap = (current: string | null, caption: string, chapter?: string) =>
    steps.push({
      activities: acts,
      sorted,
      selected: [...selected],
      current,
      rejected: [...rejected],
      maxTime,
      caption,
      chapter,
    });

  snap(null, "Activity selection: pick max non-overlapping intervals.", "Setup");
  snap(null, "Sort activities by finish time (earliest end first).", "Greedy choice");

  for (const act of sorted) {
    snap(act.id, `Consider ${act.id} [${act.start}, ${act.end}].`);
    if (act.start >= lastEnd) {
      snap(act.id, `${act.id} starts at ${act.start} ≥ last end ${lastEnd} → select.`);
      selected.push(act.id);
      lastEnd = act.end;
      snap(act.id, `${act.id} selected — next must start ≥ ${lastEnd}. ✓`);
    } else {
      rejected.push(act.id);
      snap(act.id, `${act.id} overlaps last selected (ends at ${lastEnd}) → skip.`);
    }
  }

  snap(null, `Maximum activities = ${selected.length}: ${selected.join(", ")}. ✓`, "Complete");
  return withCodeLines(steps, (s) => {
    if (s.chapter === "Setup") return [0, 1];
    if (s.caption.includes("Sort")) return [2, 3];
    if (s.caption.includes("Consider")) return [4, 5, 6];
    if (s.caption.includes("select")) return [7, 8];
    if (s.caption.includes("skip")) return [5, 6];
    if (s.chapter === "Complete") return [9, 10];
    return [4, 5];
  });
}

const CODE = `function activitySelection(acts) {
  acts.sort((a, b) => a.end - b.end); // earliest finish first
  const picked = [];
  let lastEnd = -1;
  for (const a of acts) {
    if (a.start >= lastEnd) {
      picked.push(a);
      lastEnd = a.end;
    }
  }
  return picked;
}`;

function Timeline({ s }: { s: Step }) {
  const scale = (t: number) => (t / s.maxTime) * 280;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_MONO, fontSize: 11, color: C.textMuted }}>
        {Array.from({ length: s.maxTime + 1 }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
      {s.sorted.map((act) => {
        const isSelected = s.selected.includes(act.id);
        const isCurrent = s.current === act.id;
        const isRejected = s.rejected.includes(act.id);
        const bg = isSelected ? C.sorted : isCurrent ? C.active : isRejected ? C.cellMuted : C.default;
        const border = isSelected ? C.sortedBorder : isCurrent ? C.activeBorder : isRejected ? C.cellMutedBorder : C.defaultBorder;
        return (
          <div key={act.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, width: 24, color: C.textMuted }}>{act.id}</span>
            <div style={{ position: "relative", width: 280, height: 28, background: C.cellMuted, borderRadius: 4 }}>
              <div
                style={{
                  position: "absolute",
                  left: scale(act.start),
                  width: Math.max(scale(act.end) - scale(act.start), 4),
                  height: "100%",
                  background: bg,
                  border: `2px solid ${border}`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.ink,
                  transition: "background 200ms, border-color 200ms",
                }}
              >
                [{act.start},{act.end}]
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const greedyActivity: Topic = {
  id: "greedy-activity",
  title: "Activity Selection (Greedy)",
  category: "Greedy",
  blurb: "Maximize non-overlapping intervals — sort by finish time.",
  useWhen: "Scheduling rooms, CPU jobs, or any interval packing problem.",
  badges: ["O(n log n)", "greedy optimal"],
  prerequisites: ["two-pointers"],
  create: () =>
    defineViz<Step>({
      steps: build(ACTIVITIES),
      code: CODE,
      explanation:
        "Classic interval scheduling: sort activities by finish time, then greedily pick each activity that doesn't overlap the last chosen one. The earliest-finishing compatible activity leaves the most room for future picks — this greedy choice is provably optimal.\n\nTime: O(n log n) for sort · O(n) scan · Space: O(1) extra",
      renderStep: (s) => <Timeline s={s} />,
    }),
};

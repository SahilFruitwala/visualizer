import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const N = 6;

interface Step extends StepBase {
  queens: number[]; // queens[row] = col, or -1
  tryRow: number;
  tryCol: number;
  status: "try" | "place" | "conflict" | "backtrack" | "solved";
}

function build() {
  const queens = Array(N).fill(-1);
  const steps: Step[] = [];
  const snap = (tryRow: number, tryCol: number, status: Step["status"], caption: string) =>
    steps.push({ queens: [...queens], tryRow, tryCol, status, caption });

  const safe = (row: number, col: number) => {
    for (let r = 0; r < row; r++) {
      const c = queens[r];
      if (c === col || Math.abs(c - col) === row - r) return false;
    }
    return true;
  };

  let solved = false;
  const place = (row: number): boolean => {
    if (row === N) { solved = true; return true; }
    for (let col = 0; col < N; col++) {
      snap(row, col, "try", `Row ${row}: try column ${col}.`);
      if (safe(row, col)) {
        queens[row] = col;
        snap(row, col, "place", `Column ${col} is safe → place queen.`);
        if (place(row + 1)) return true;
        queens[row] = -1;
        snap(row, col, "backtrack", `Dead end below → backtrack, remove queen.`);
      } else {
        snap(row, col, "conflict", `Column ${col} attacked → skip.`);
      }
    }
    return false;
  };
  snap(0, -1, "try", `Place ${N} queens so none attack each other. Backtrack on conflicts.`);
  place(0);
  if (solved) snap(-1, -1, "solved", "A valid arrangement found! ✓");
  return steps;
}

const CODE = `function solve(row, queens) {
  if (row === N) return true;          // all placed
  for (let col = 0; col < N; col++) {
    if (safe(row, col, queens)) {
      queens[row] = col;
      if (solve(row + 1, queens)) return true;
      queens[row] = -1;                // backtrack
    }
  }
  return false;
}`;

export const nQueens: Topic = {
  id: "n-queens",
  title: "N-Queens",
  category: "Backtracking",
  blurb: "Place N queens with no two attacking.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        `Place a queen in each row so none share a column or diagonal. We try columns left to right; on a conflict we skip, and if a row has no valid column we backtrack and move the previous queen. Amber = trying, red = attacked, green = placed.\n\nN = ${N} · Time: exponential, pruned heavily by the safety check`,
      renderStep: (s) => {
        const cell = 46;
        return (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, ${cell}px)`, gap: 0, border: `2px solid ${C.surfaceBorder}`, borderRadius: 8, overflow: "hidden" }}>
            {Array.from({ length: N * N }, (_, idx) => {
              const r = Math.floor(idx / N), c = idx % N;
              const hasQueen = s.queens[r] === c;
              const trying = r === s.tryRow && c === s.tryCol;
              const light = (r + c) % 2 === 0;
              let bg = light ? "#1b2440" : "#141c34";
              if (hasQueen) bg = C.sorted;
              else if (trying && s.status === "conflict") bg = C.compare;
              else if (trying) bg = C.active;
              return (
                <div key={idx} style={{ width: cell, height: cell, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, transition: "background 160ms" }}>
                  {hasQueen ? "♛" : trying && s.status !== "place" ? <span style={{ color: "#0e1424", fontFamily: FONT_MONO, fontSize: 14 }}>?</span> : ""}
                </div>
              );
            })}
          </div>
        );
      },
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Grid, type CellMark } from "../components/Grid";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  dp: number[][];
  r: number;
  c: number;
  match: boolean;
  refs: [number, number][];
}

function build(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  const steps: Step[] = [];
  const snap = (r: number, c: number, match: boolean, refs: [number, number][], caption: string) =>
    steps.push({ dp: dp.map((row) => [...row]), r, c, match, refs, caption });

  snap(-1, -1, false, [], `Min edits to turn "${a}" into "${b}". Row/col 0 = inserting/deleting from empty.`);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        snap(i, j, true, [[i - 1, j - 1]], `'${a[i - 1]}' = '${b[j - 1]}' → free, copy diagonal.`);
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const best = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        snap(i, j, false, [[i - 1, j - 1], [i - 1, j], [i, j - 1]], `'${a[i - 1]}' ≠ '${b[j - 1]}' → 1 + min(replace, delete, insert) = ${best}.`);
        dp[i][j] = best;
      }
    }
  }
  snap(m, n, false, [], `Edit distance = ${dp[m][n]}. ✓`);
  return steps;
}

const CODE = `function editDistance(a, b) {
  const dp = Array.from({length: a.length+1}, (_, i) =>
    Array.from({length: b.length+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
  return dp[a.length][b.length];
}`;

const A = "kitten";
const B = "sitting";

export const editDistance: Topic = {
  id: "edit-distance",
  title: "Edit Distance",
  category: "Dynamic Programming",
  blurb: "Min insert/delete/replace to match two strings.",
  create: () =>
    defineViz<Step>({
      steps: build(A, B),
      code: CODE,
      explanation:
        `dp[i][j] = minimum edits (insert, delete, replace) to convert the first i chars of "${A}" into the first j of "${B}". Matching characters cost nothing; otherwise take 1 + the cheapest of the three neighbouring subproblems.\n\nTime: O(m·n) · Space: O(m·n)`,
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Grid
            rows={A.length + 1}
            cols={B.length + 1}
            size={40}
            rowLabels={(r) => (r === 0 ? "ε" : A[r - 1])}
            colLabels={(c) => (c === 0 ? "ε" : B[c - 1])}
            cell={(r, c) => s.dp[r][c]}
            mark={(r, c): CellMark => {
              if (r === s.r && c === s.c) return s.match ? "result" : "active";
              if (s.refs.some(([rr, cc]) => rr === r && cc === c)) return "compare";
              if (r === 0 || c === 0) return "muted";
              return "filled";
            }}
          />
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>green = match (free) · blue = the 3 options compared</div>
        </div>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Grid, type CellMark } from "../components/Grid";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  dp: number[][];
  r: number;
  c: number;
  refs: [number, number][];
  match: boolean;
}

function build(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const steps: Step[] = [];
  const snap = (r: number, c: number, refs: [number, number][], match: boolean, caption: string) =>
    steps.push({ dp: dp.map((row) => [...row]), r, c, refs, match, caption });

  snap(-1, -1, [], false, `LCS of "${a}" and "${b}". Row/col 0 are empty-string bases (all 0).`);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      if (match) {
        snap(i, j, [[i - 1, j - 1]], true, `'${a[i - 1]}' = '${b[j - 1]}' → dp = diagonal + 1.`);
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        snap(i, j, [[i - 1, j], [i, j - 1]], false, `'${a[i - 1]}' ≠ '${b[j - 1]}' → dp = max(up, left).`);
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  snap(m, n, [], false, `Longest common subsequence length = ${dp[m][n]}. ✓`);
  return steps;
}

const CODE = `function lcs(a, b) {
  const dp = Array.from({length: a.length+1}, () => Array(b.length+1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[a.length][b.length];
}`;

const A = "ABCBDAB";
const B = "BDCAB";

export const lcs: Topic = {
  id: "lcs",
  title: "Longest Common Subsequence",
  category: "Dynamic Programming",
  blurb: "Fill a 2D table comparing two strings.",
  create: () =>
    defineViz<Step>({
      steps: build(A, B),
      code: CODE,
      explanation:
        `dp[i][j] = LCS length of the first i chars of "${A}" and first j of "${B}". On a character match it extends the diagonal; otherwise it takes the better of dropping one character from either string.\n\nTime: O(m·n) · Space: O(m·n)`,
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Grid
            rows={A.length + 1}
            cols={B.length + 1}
            size={42}
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
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>
            green = match (diagonal+1) · blue = max(up, left)
          </div>
        </div>
      ),
    }),
};

import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, mixProp } from "../theme";

const S = "aabcaabxaaz";
interface Step extends StepBase {
  z: number[];
  highlight: number;
  phase: string;
}

function buildZ(s: string): number[] {
  const n = s.length;
  const z = Array(n).fill(0);
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}

function build(): Step[] {
  const z = buildZ(S);
  const steps: Step[] = [];
  steps.push({ z: [...z], highlight: 0, phase: "Z-array", chapter: "Overview", caption: "Z[i] = length of longest substring starting at i that matches a prefix." });
  for (let i = 1; i < S.length; i++) {
    if (z[i] > 0) steps.push({ z: [...z], highlight: i, phase: `i=${i}`, caption: `Z[${i}]=${z[i]} — "${S.slice(i, i + z[i])}" matches prefix.` });
  }
  steps.push({ z: [...z], highlight: 6, phase: "Done", caption: "Z-algorithm builds in O(n) — used for pattern search. ✓" });
  return steps;
}

const CODE = `// Z[i] = LCP of s and s[i..]
function zAlgorithm(s) {
  const z = Array(s.length).fill(0);
  let [l, r] = [0, 0];
  for (let i = 1; i < s.length; i++) { /* expand with Z-box */ }
  return z;
}`;

export const zAlgorithm: Topic = {
  id: "z-algorithm",
  title: "Z-Algorithm",
  category: "Strings",
  blurb: "Linear-time prefix matching via Z-array.",
  prerequisites: ["kmp"],
  badges: ["O(n)"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "The Z-array records how much each suffix matches the string prefix. A Z-box [l,r] bounds reuse like KMP's LPS.\n\nUsed for pattern matching and string compression.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 2, color: C.text }}>{S.split("").map((c, i) => <span key={i} style={{ color: i === s.highlight ? C.active : C.text }}>{c}</span>)}</div>
        <div style={{ display: "flex", gap: 4 }}>
          {s.z.map((v, i) => (
            <div key={i} style={{ width: 28, textAlign: "center", padding: "4px 0", borderRadius: 4, background: i === s.highlight ? mixProp("active", 20) : "transparent", fontFamily: FONT_MONO, fontSize: 12, color: i === s.highlight ? C.active : C.textMuted }}>{v}</div>
          ))}
        </div>
      </div>
    ),
  }),
};

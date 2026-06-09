import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const TEXT = "ABCCDABCEABCDF";
const PAT = "ABCD";
const BASE = 256;
const MOD = 101;

interface Step extends StepBase {
  offset: number;
  windowHash: number;
  match: "hash-miss" | "checking" | "found" | null;
}

function build() {
  const m = PAT.length;
  const steps: Step[] = [];
  const snap = (offset: number, windowHash: number, match: Step["match"], caption: string) =>
    steps.push({ offset, windowHash, match, caption });

  let patHash = 0, winHash = 0, h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * BASE) % MOD;
  for (let i = 0; i < m; i++) {
    patHash = (BASE * patHash + PAT.charCodeAt(i)) % MOD;
    winHash = (BASE * winHash + TEXT.charCodeAt(i)) % MOD;
  }
  snap(0, winHash, null, `Hash the pattern (=${patHash}) and the first window. Compare hashes, not chars.`);

  for (let i = 0; i <= TEXT.length - m; i++) {
    if (winHash === patHash) {
      const slice = TEXT.slice(i, i + m);
      if (slice === PAT) snap(i, winHash, "found", `Hashes match AND chars match → found at ${i}! ✓`);
      else snap(i, winHash, "checking", `Hash collision at ${i} — verify chars (false alarm).`);
    } else {
      snap(i, winHash, "hash-miss", `Window hash ${winHash} ≠ pattern ${patHash} → skip.`);
    }
    if (i < TEXT.length - m) {
      // roll the hash
      winHash = (BASE * (winHash - TEXT.charCodeAt(i) * h) + TEXT.charCodeAt(i + m)) % MOD;
      if (winHash < 0) winHash += MOD;
    }
  }
  snap(0, patHash, null, `Done. Rolling hash updates each window in O(1). ✓`);
  return steps;
}

const CODE = `function rabinKarp(text, pat) {
  let patHash = hash(pat), winHash = hash(text.slice(0, pat.length));
  for (let i = 0; i + pat.length <= text.length; i++) {
    if (winHash === patHash && text.substr(i, pat.length) === pat) report(i);
    winHash = roll(winHash, text[i], text[i + pat.length]); // O(1) update
  }
}`;

export const rabinKarp: Topic = {
  id: "rabin-karp",
  title: "Rabin-Karp",
  category: "Strings",
  blurb: "Find patterns with a rolling hash.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Rabin-Karp hashes the pattern and each text window. A rolling hash updates in O(1) as the window slides. Only when hashes match does it verify the actual characters (to rule out collisions).\n\nAverage: O(n + m) · Worst: O(n·m) with many collisions",
      renderStep: (s) => {
        const color = s.match === "found" ? C.sorted : s.match === "hash-miss" ? C.compare : s.match === "checking" ? C.highlight : C.active;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {TEXT.split("").map((ch, i) => {
                const inWin = i >= s.offset && i < s.offset + PAT.length;
                return (
                  <div key={i} style={{ width: 32, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 16, background: inWin ? color : "#1b2440", color: inWin ? "#0e1424" : C.text, border: `1px solid ${C.surfaceBorder}`, transition: "background 160ms" }}>{ch}</div>
                );
              })}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: C.textMuted }}>
              window hash = <span style={{ color }}>{s.windowHash}</span>
            </div>
          </div>
        );
      },
    }),
};

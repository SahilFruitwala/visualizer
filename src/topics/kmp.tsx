import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

const TEXT = "ABABDABACDABABCABAB";
const PAT = "ABABCABAB";

interface Step extends StepBase {
  phase: "lps" | "search";
  lps: number[];
  offset: number; // where pattern is aligned in text
  ti: number; // text index compared
  pj: number; // pattern index compared
  status: "match" | "mismatch" | "found" | null;
}

function build() {
  const m = PAT.length;
  const lps = Array(m).fill(0);
  const steps: Step[] = [];
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ phase: "search", lps: [...lps], offset: 0, ti: -1, pj: -1, status: null, ...e });

  // build LPS
  snap({ phase: "lps", caption: "First build the LPS table: longest proper prefix that is also a suffix." });
  let len = 0, i = 1;
  while (i < m) {
    if (PAT[i] === PAT[len]) {
      len++; lps[i] = len;
      snap({ phase: "lps", pj: i, status: "match", caption: `pat[${i}]='${PAT[i]}' matches prefix → lps[${i}] = ${len}.` });
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
      snap({ phase: "lps", pj: i, status: "mismatch", caption: `Fall back using lps[${i > 0 ? "len-1" : 0}] → len = ${len}.` });
    } else {
      lps[i] = 0;
      snap({ phase: "lps", pj: i, status: "mismatch", caption: `No match → lps[${i}] = 0.` });
      i++;
    }
  }
  snap({ phase: "lps", caption: "LPS table done. Now scan the text without ever moving backwards." });

  // search
  let t = 0, j = 0;
  while (t < TEXT.length) {
    if (TEXT[t] === PAT[j]) {
      snap({ offset: t - j, ti: t, pj: j, status: "match", caption: `text[${t}]='${TEXT[t]}' = pat[${j}] → advance both.` });
      t++; j++;
      if (j === m) {
        snap({ offset: t - j, ti: t - 1, pj: j - 1, status: "found", caption: `Full match at index ${t - j}! ✓` });
        j = lps[j - 1];
      }
    } else if (j > 0) {
      snap({ offset: t - j, ti: t, pj: j, status: "mismatch", caption: `Mismatch → shift pattern by lps[${j - 1}]=${lps[j - 1]} (no text rewind).` });
      j = lps[j - 1];
    } else {
      snap({ offset: t, ti: t, pj: 0, status: "mismatch", caption: `Mismatch at start → move to next text char.` });
      t++;
    }
  }
  snap({ caption: "Scan complete. KMP never re-examines a text character. ✓" });
  return steps;
}

const CODE = `function kmp(text, pat) {
  const lps = buildLPS(pat);
  let t = 0, j = 0;
  while (t < text.length) {
    if (text[t] === pat[j]) { t++; j++; if (j === pat.length) { /*hit*/ j = lps[j-1]; } }
    else if (j > 0) j = lps[j - 1];   // reuse known prefix
    else t++;
  }
}`;

function StrRow({ str, hi, color }: { str: string; hi: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {str.split("").map((ch, i) => (
        <div key={i} style={{ width: 30, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 16, background: i === hi ? color : "#1b2440", color: i === hi ? "#0e1424" : C.text, border: `1px solid ${C.surfaceBorder}` }}>{ch}</div>
      ))}
    </div>
  );
}

export const kmp: Topic = {
  id: "kmp",
  title: "KMP String Matching",
  category: "Strings",
  blurb: "Match patterns without backtracking the text.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Knuth–Morris–Pratt precomputes an LPS table (longest proper prefix that's also a suffix). On a mismatch it shifts the pattern by what it already knows instead of rewinding the text, so each text character is read once.\n\nPreprocess: O(m) · Search: O(n) · Space: O(m)",
      renderStep: (s) => {
        const statusColor = s.status === "found" ? C.sorted : s.status === "mismatch" ? C.compare : C.active;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
            <StrRow str={TEXT} hi={s.phase === "search" ? s.ti : -1} color={statusColor} />
            <div style={{ marginLeft: (s.phase === "search" ? s.offset : 0) * 33 }}>
              <StrRow str={PAT} hi={s.pj} color={statusColor} />
            </div>
            <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted, alignSelf: "center", marginRight: 6 }}>lps:</span>
              {s.lps.map((v, i) => (
                <div key={i} style={{ width: 30, height: 24, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontSize: 13, background: "#141c34", color: C.pointer, border: `1px solid ${C.surfaceBorder}` }}>{v}</div>
              ))}
            </div>
          </div>
        );
      },
    }),
};

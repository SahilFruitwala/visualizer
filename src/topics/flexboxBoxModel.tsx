import { BoxModelDiagram } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: string;
  mode: "box" | "flex";
  padding: number;
  border: number;
  margin: number;
  justify?: string;
  items?: { label: string; grow?: boolean }[];
}

const build = (): Step[] => [
  { phase: "Content box", mode: "box", padding: 8, border: 4, margin: 12, chapter: "Box model", caption: "Every element is a box: content → padding → border → margin (outside-in)." },
  { phase: "Padding grows", mode: "box", padding: 20, border: 4, margin: 12, caption: "padding adds space inside the border — background fills padding area." },
  { phase: "Margin collapses", mode: "box", padding: 8, border: 4, margin: 24, caption: "margin is outside the border — creates gap between siblings." },
  { phase: "Flex container", mode: "flex", padding: 8, border: 4, margin: 0, justify: "space-between", items: [{ label: "A" }, { label: "B" }, { label: "C" }], chapter: "Flexbox", caption: "display:flex — children laid out on main axis (row by default)." },
  { phase: "flex-grow", mode: "flex", padding: 8, border: 4, margin: 0, justify: "flex-start", items: [{ label: "A" }, { label: "B", grow: true }, { label: "C" }], caption: "flex-grow:1 on B — B absorbs leftover space. ✓" },
];

const CODE = `.card {
  margin: 24px;          /* outside */
  border: 4px solid #333;
  padding: 20px;         /* inside */
}
.row { display: flex; justify-content: space-between; }
.item { flex: 1; }      /* grow to fill */`;

export const flexboxBoxModel: Topic = {
  id: "flexbox-box-model",
  title: "Box Model & Flexbox",
  category: "Layout & CSS",
  blurb: "How CSS sizes boxes and distributes space.",
  prerequisites: ["critical-rendering-path"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "The box model defines how width/height compute with padding and border (box-sizing:border-box simplifies this). Flexbox distributes free space along one axis with justify-content and flex-grow.\n\nLayout changes trigger reflow in the critical rendering path.",
    renderStep: (s) => s.mode === "box" ? (
      <BoxModelDiagram content="content" padding={s.padding} border={s.border} margin={s.margin} phase={s.phase} />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.active, fontWeight: 700 }}>{s.phase}</div>
        <div style={{ display: "flex", justifyContent: s.justify as "space-between", gap: 8, padding: 12, border: `2px solid ${C.surfaceBorder}`, borderRadius: 10, width: 280 }}>
          {s.items?.map((it) => (
            <div key={it.label} style={{ flex: it.grow ? 1 : undefined, padding: "10px 16px", background: it.grow ? C.active : C.default, borderRadius: 6, fontFamily: FONT_MONO, fontWeight: 700, color: C.ink, textAlign: "center" }}>{it.label}</div>
          ))}
        </div>
      </div>
    ),
  }),
};

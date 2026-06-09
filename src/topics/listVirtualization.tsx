import { VirtualListView } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

const TOTAL = 1000;
const ITEM_H = 40;
const VIEWPORT_H = 200;
const VISIBLE_COUNT = Math.floor(VIEWPORT_H / ITEM_H);

interface Step extends StepBase {
  scrollTop: number;
  visibleStart: number;
  visibleEnd: number;
  phase: string;
}

function rangeForScroll(scrollTop: number) {
  const visibleStart = Math.floor(scrollTop / ITEM_H);
  const visibleEnd = Math.min(TOTAL - 1, visibleStart + VISIBLE_COUNT - 1);
  return { visibleStart, visibleEnd };
}

function build(): Step[] {
  const scrolls = [0, ITEM_H * 4, ITEM_H * 12, ITEM_H * 48, ITEM_H * 120];
  const steps: Step[] = [
    {
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: VISIBLE_COUNT - 1,
      phase: "Problem",
      chapter: "Naive list",
      caption: `Rendering ${TOTAL} rows creates ${TOTAL} DOM nodes — slow mount, layout, and scroll.`,
    },
    {
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: VISIBLE_COUNT - 1,
      phase: "Window",
      chapter: "Viewport",
      caption: `Viewport shows ~${VISIBLE_COUNT} rows. Only those need to exist in the DOM at once.`,
    },
    {
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: VISIBLE_COUNT - 1,
      phase: "Virtualize",
      caption: `Virtual list: total height = ${TOTAL}×${ITEM_H}px spacer; render only visible slice + small buffer.`,
    },
  ];

  for (const scrollTop of scrolls) {
    const { visibleStart, visibleEnd } = rangeForScroll(scrollTop);
    steps.push({
      scrollTop,
      visibleStart,
      visibleEnd,
      phase: scrollTop === 0 ? "Scroll" : `scrollTop ${scrollTop}px`,
      caption:
        scrollTop === 0
          ? "scrollTop = 0 → render rows [0…4] (amber = in viewport)."
          : `User scrolls → scrollTop ${scrollTop}px → window shifts to [${visibleStart}…${visibleEnd}].`,
    });
  }

  steps.push({
    scrollTop: ITEM_H * 120,
    visibleStart: rangeForScroll(ITEM_H * 120).visibleStart,
    visibleEnd: rangeForScroll(ITEM_H * 120).visibleEnd,
    phase: "Result",
    chapter: "Performance",
    caption: `~${VISIBLE_COUNT + 2} DOM nodes instead of ${TOTAL} — smooth scroll on large datasets. ✓`,
    insight: "Trade memory (full data in JS) for constant DOM size.",
  });

  return steps;
}

const CODE = `function VirtualList({ items, rowHeight, height }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / rowHeight);
  const visible = Math.ceil(height / rowHeight);
  const slice = items.slice(start, start + visible + 1); // +buffer

  return (
    <div style={{ height, overflow: 'auto' }} onScroll={e => setScrollTop(e.target.scrollTop)}>
      <div style={{ height: items.length * rowHeight }}>
        <div style={{ transform: \`translateY(\${start * rowHeight}px)\` }}>
          {slice.map((item, i) => <Row key={start + i} data={item} />)}
        </div>
      </div>
    </div>
  );
}`;

export const listVirtualization: Topic = {
  id: "list-virtualization",
  title: "List Virtualization",
  category: "Performance",
  blurb: "Render only visible rows, not the whole list.",
  useWhen: "Tables or feeds with thousands of items stutter on scroll.",
  badges: ["O(viewport) DOM"],
  prerequisites: ["sliding-window"],
  quiz: [
    {
      question: "What stays constant as list size grows?",
      options: ["Total DOM node count", "Nodes in the viewport slice", "Memory for all row data", "Layout of off-screen rows"],
      correctIndex: 1,
      explanation: "Virtualization caps DOM nodes at roughly viewport size (+ buffer); data for all items may still live in memory.",
    },
    {
      question: "scrollTop is used to compute…",
      options: ["HTTP cache key", "First visible row index", "CSS specificity", "WebSocket frame"],
      correctIndex: 1,
      explanation: "startIndex = floor(scrollTop / rowHeight) determines which slice of data to render.",
    },
  ],
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Long lists choke the browser when every row is a DOM node. Virtualization keeps a tall scroll container (total height preserved) but only mounts rows in the visible window plus a small buffer. On scroll, you recompute the start index and translate a small inner block — the same sliding-window idea as algorithm techniques, applied to the DOM.\n\nLibraries like react-window and TanStack Virtual handle variable heights and horizontal grids; the core idea is identical.",
      renderStep: (s) => (
        <VirtualListView
          totalItems={TOTAL}
          itemHeight={ITEM_H}
          viewportHeight={VIEWPORT_H}
          scrollTop={s.scrollTop}
          visibleStart={s.visibleStart}
          visibleEnd={s.visibleEnd}
          phase={s.phase}
        />
      ),
    }),
};

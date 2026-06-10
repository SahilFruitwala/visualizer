import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Arrow } from "../components/primitives";
import { C, FONT_MONO, mixColor } from "../theme";

interface Step extends StepBase {
  nodes: number[];
  curr: number; // index of curr pointer, nodes.length == at null
  newAt: number; // freshly inserted index (-1 none)
  visited: number; // indices < visited are done
}

function build() {
  const steps: Step[] = [];
  let nodes: number[] = [];
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ nodes: [...nodes], curr: -1, newAt: -1, visited: -1, ...e });

  snap({ caption: "A linked list chains nodes; each holds a value + a pointer to the next." });
  for (const v of [4, 8, 15, 16]) {
    nodes = [...nodes, v];
    snap({ newAt: nodes.length - 1, caption: `Append node(${v}) — link previous tail's next to it.` });
  }
  // insert at head
  nodes = [99, ...nodes];
  snap({ newAt: 0, caption: `Insert 99 at head — O(1), just repoint head.` });
  // traverse
  for (let i = 0; i < nodes.length; i++) {
    snap({ curr: i, visited: i, caption: `Traverse: visit node ${nodes[i]} (curr = node ${i}).` });
  }
  snap({ curr: nodes.length, visited: nodes.length, caption: "curr = null → reached the end. ✓" });
  return steps;
}

const CODE = `class Node { constructor(v){ this.val = v; this.next = null; } }

function traverse(head) {
  let curr = head;
  while (curr !== null) {
    visit(curr.val);
    curr = curr.next;   // follow the pointer
  }
}`;

export const linkedList: Topic = {
  id: "linked-list",
  title: "Linked List",
  category: "Linear",
  blurb: "Nodes chained by next-pointers.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Each node stores a value and a pointer to the next node. Inserting at the head is O(1), but reaching index i means walking i pointers. No random access.\n\naccess: O(n) · insert/delete at known node: O(1)",
      renderStep: (s) => (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
          <Label text="head" color={C.pointer} />
          <Arrow active />
          {s.nodes.map((v, i) => {
            const visited = i < s.visited;
            const current = i === s.curr;
            const fresh = i === s.newAt;
            const fill = current ? C.active : fresh ? C.sorted : visited ? C.highlight : C.default;
            const dark = !current && !fresh && !visited;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                {current && (
                  <div style={{ position: "absolute", top: -34, left: 18, fontFamily: FONT_MONO, color: C.active, fontWeight: 700, fontSize: 15 }}>
                    curr ▾
                  </div>
                )}
                <div style={{ display: "flex", transition: "transform 200ms" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "10px 0 0 10px", background: fill, border: `2px solid ${C.surfaceBorder}`, borderRight: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: dark ? C.text : C.ink, transition: "background 200ms" }}>
                    {v}
                  </div>
                  <div style={{ width: 26, height: 60, borderRadius: "0 10px 10px 0", background: mixColor(fill, 67), border: `2px solid ${C.surfaceBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: dark ? C.textMuted : C.ink }}>
                    •
                  </div>
                </div>
                <Arrow active={i < s.visited} />
              </div>
            );
          })}
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: s.curr >= s.nodes.length ? C.sorted : C.textMuted, fontWeight: 700, border: `2px dashed ${C.surfaceBorder}`, borderRadius: 10, padding: "18px 14px" }}>
            null
          </div>
        </div>
      ),
    }),
};

function Label({ text, color }: { text: string; color: string }) {
  return <div style={{ fontFamily: FONT_MONO, fontSize: 16, color, fontWeight: 700, marginRight: 4 }}>{text}</div>;
}

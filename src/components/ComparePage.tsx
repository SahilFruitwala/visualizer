import { useMemo, useState } from "react";
import { TOPICS } from "../topics";
import type { Topic } from "../engine/types";
import { deriveChapters } from "../engine/chapters";
import { tagTopicChapters } from "../engine/topicChapters";
import { usePlayer } from "../engine/usePlayer";
import { usePlayerKeyboard } from "../engine/useKeyboard";
import { prefersReducedMotion } from "../engine/reducedMotion";
import { Stage } from "./Stage";
import { Controls } from "./Controls";
import { ColorLegend } from "./ColorLegend";
import { ThemeToggle } from "./ThemeToggle";

export const COMPARE_PRESETS: { id: string; title: string; a: string; b: string }[] = [
  { id: "sorts", title: "Bubble vs Merge Sort", a: "bubble-sort", b: "merge-sort" },
  { id: "search", title: "Linear vs Binary Search", a: "linear-search", b: "binary-search" },
  { id: "graphs", title: "BFS vs DFS", a: "bfs", b: "dfs" },
  { id: "api", title: "REST vs GraphQL", a: "rest-crud", b: "graphql-vs-rest" },
  { id: "cache", title: "HTTP Cache vs Client Fetch", a: "http-caching", b: "client-data-fetching" },
];

function ComparePane({ topic }: { topic: Topic }) {
  const [nonce, setNonce] = useState(0);
  const reducedMotion = prefersReducedMotion();

  const viz = useMemo(() => {
    const v = topic.create();
    return { ...v, steps: tagTopicChapters(topic.id, v.steps) };
  }, [topic, nonce]);

  const chapters = useMemo(() => deriveChapters(viz.steps), [viz.steps]);

  const player = usePlayer(viz.steps.length, {
    initialSpeed: 1,
    learnMode: reducedMotion ? true : undefined,
  });

  usePlayerKeyboard(player, true);

  const step = viz.steps[player.index];

  return (
    <div className="compare-pane">
      <header className="compare-pane-head">
        <h2 className="compare-pane-title">{topic.title}</h2>
        <span className="compare-pane-cat">{topic.category}</span>
      </header>
      <Stage
        steps={viz.steps}
        renderStep={viz.renderStep}
        index={player.index}
        caption={step.caption}
        insight={step.insight}
      />
      <Controls
        player={player}
        chapters={chapters}
        onShuffle={topic.shufflable ? () => setNonce((n) => n + 1) : undefined}
      />
    </div>
  );
}

export function ComparePage({
  initialA,
  initialB,
  onSelectTopic,
}: {
  initialA?: string;
  initialB?: string;
  onSelectTopic: (id: string) => void;
}) {
  const [aId, setAId] = useState(initialA ?? COMPARE_PRESETS[0].a);
  const [bId, setBId] = useState(initialB ?? COMPARE_PRESETS[0].b);
  const [synced, setSynced] = useState(true);

  const topicA = TOPICS.find((t) => t.id === aId) ?? TOPICS[0];
  const topicB = TOPICS.find((t) => t.id === bId) ?? TOPICS[1];

  const reducedMotion = prefersReducedMotion();
  const vizA = useMemo(() => topicA.create(), [topicA]);
  const masterPlayer = usePlayer(vizA.steps.length, {
    initialSpeed: 1,
    learnMode: reducedMotion ? true : undefined,
  });

  usePlayerKeyboard(masterPlayer, synced);

  const handleSyncToggle = () => setSynced((v) => !v);

  return (
    <main className="stage-wrap page-wrap compare-page">
      <header className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Compare topics</h1>
          <p className="page-subtitle">Side-by-side animations with optional synchronized playback.</p>
        </div>
        <div className="page-head-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="compare-presets">
        {COMPARE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            data-active={aId === p.a && bId === p.b}
            onClick={() => {
              setAId(p.a);
              setBId(p.b);
              masterPlayer.seek(0);
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="compare-selectors">
        <label className="compare-select">
          <span>Left</span>
          <select value={aId} onChange={(e) => setAId(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="chip" data-active={synced} onClick={handleSyncToggle}>
          {synced ? "synced" : "independent"}
        </button>
        <label className="compare-select">
          <span>Right</span>
          <select value={bId} onChange={(e) => setBId(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {synced && (
        <div className="compare-sync-controls">
          <Controls player={masterPlayer} />
        </div>
      )}

      <ColorLegend />

      <div className="compare-grid">
        {synced ? (
          <>
            <SyncedPane topic={topicA} index={masterPlayer.index} />
            <SyncedPane topic={topicB} index={masterPlayer.index} />
          </>
        ) : (
          <>
            <ComparePane topic={topicA} />
            <ComparePane topic={topicB} />
          </>
        )}
      </div>

      <p className="compare-hint">
        Open a single topic for quizzes and code panels —{" "}
        <button type="button" className="text-link" onClick={() => onSelectTopic(aId)}>
          {topicA.title}
        </button>{" "}
        or{" "}
        <button type="button" className="text-link" onClick={() => onSelectTopic(bId)}>
          {topicB.title}
        </button>
      </p>
    </main>
  );
}

function SyncedPane({ topic, index }: { topic: Topic; index: number }) {
  const viz = useMemo(() => {
    const v = topic.create();
    return { ...v, steps: tagTopicChapters(topic.id, v.steps) };
  }, [topic]);

  const clamped = Math.min(index, viz.steps.length - 1);
  const step = viz.steps[clamped];

  return (
    <div className="compare-pane">
      <header className="compare-pane-head">
        <h2 className="compare-pane-title">{topic.title}</h2>
        <span className="compare-pane-cat">{topic.category}</span>
      </header>
      <Stage
        steps={viz.steps}
        renderStep={viz.renderStep}
        index={clamped}
        caption={step.caption}
        insight={step.insight}
      />
      <div className="compare-step-label">
        step {clamped + 1} / {viz.steps.length}
      </div>
    </div>
  );
}

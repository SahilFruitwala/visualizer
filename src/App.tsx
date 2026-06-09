import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Controls } from "./components/Controls";
import { usePlayer } from "./engine/usePlayer";
import { TOPICS, topicsByCategory } from "./topics";
import type { Topic } from "./engine/types";
import { FONT_MONO, FONT_SANS } from "./theme";

type Theme = "dark" | "light";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("dsa-theme") as Theme) || "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("dsa-theme", theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

export default function App() {
  const [activeId, setActiveId] = useState(TOPICS[0].id);
  const [theme, toggleTheme] = useTheme();
  const topic = TOPICS.find((t) => t.id === activeId) ?? TOPICS[0];
  const groups = topicsByCategory();

  return (
    <div className="app">
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      {/* key forces a fresh player/viz when switching topics */}
      <TopicView
        key={topic.id}
        topic={topic}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeId={activeId}
        onSelect={setActiveId}
        groups={groups}
      />
    </div>
  );
}

function TopicView({
  topic,
  theme,
  onToggleTheme,
  activeId,
  onSelect,
  groups,
}: {
  topic: Topic;
  theme: Theme;
  onToggleTheme: () => void;
  activeId: string;
  onSelect: (id: string) => void;
  groups: { category: string; topics: Topic[] }[];
}) {
  const [nonce, setNonce] = useState(0);
  const viz = useMemo(() => topic.create(), [topic, nonce]);
  const player = usePlayer(viz.steps.length);
  const step = viz.steps[player.index];

  return (
    <main className="stage-wrap">
      <header className="topic-head">
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase" }}>
            {topic.category}
          </div>
          <h1 style={{ fontFamily: FONT_SANS, fontSize: 34, fontWeight: 800, color: "var(--text)", margin: "4px 0 0" }}>
            {topic.title}
          </h1>
        </div>

        <div className="head-actions">
          {/* topic picker shown only on narrow screens (sidebar is hidden) */}
          <select
            className="mobile-nav"
            value={activeId}
            onChange={(e) => onSelect(e.target.value)}
            aria-label="Choose topic"
          >
            {groups.map((g) => (
              <optgroup key={g.category} label={g.category}>
                {g.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <section className="stage">
        <div className="stage-canvas">{viz.renderStep(step, player.index)}</div>
        <div className="caption">{step.caption}</div>
      </section>

      <section className="controls-bar">
        <Controls player={player} onShuffle={() => setNonce((n) => n + 1)} />
      </section>

      <section className="info">
        <div className="panel">
          <div className="panel-title">How it works</div>
          <p className="explanation">{viz.explanation}</p>
        </div>
        <div className="panel">
          <div className="panel-title">Code</div>
          <pre className="code">{viz.code}</pre>
        </div>
      </section>
    </main>
  );
}

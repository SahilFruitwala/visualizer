import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Controls } from "./components/Controls";
import { CodeBlock } from "./components/CodeBlock";
import { usePlayer } from "./engine/usePlayer";
import { TOPICS, topicsByCategory } from "./topics";
import type { Topic } from "./engine/types";
import { FONT_MONO, FONT_SANS, setActiveTheme, type Theme } from "./theme";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("dsa-theme") as Theme) || "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    setActiveTheme(theme);
    localStorage.setItem("dsa-theme", theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
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

          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </header>

      <section className="stage">
        <div className="stage-canvas">{viz.renderStep(step, player.index)}</div>
        <div className="caption">{step.caption}</div>
      </section>

      <section className="controls-bar">
        <Controls
          player={player}
          onShuffle={topic.shufflable ? () => setNonce((n) => n + 1) : undefined}
        />
      </section>

      <section className="info">
        <div className="panel">
          <div className="panel-title">How it works</div>
          <p className="explanation">{viz.explanation}</p>
        </div>
        <div className="panel">
          <div className="panel-title">Code</div>
          <CodeBlock code={viz.code} />
        </div>
      </section>
    </main>
  );
}

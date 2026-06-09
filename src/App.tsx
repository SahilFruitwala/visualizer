import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ChapterPanel } from "./components/ChapterPanel";
import { ColorLegend } from "./components/ColorLegend";
import { Sidebar } from "./components/Sidebar";
import { Controls } from "./components/Controls";
import { CodeBlock } from "./components/CodeBlock";
import { QuizPanel } from "./components/QuizPanel";
import { Stage } from "./components/Stage";
import { TopicMeta } from "./components/TopicNav";
import { deriveChapters } from "./engine/chapters";
import { tagTopicChapters } from "./engine/topicChapters";
import { usePlayerKeyboard } from "./engine/useKeyboard";
import { usePlayer } from "./engine/usePlayer";
import type { Topic } from "./engine/types";
import {
  defaultTopicId,
  rememberTopic,
  sectionById,
  SECTIONS,
  topicsByCategoryForSection,
  topicsForSection,
  type SectionId,
} from "./sections";
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

function SectionRedirect({ sectionId }: { sectionId: SectionId }) {
  const section = sectionById(sectionId)!;
  return <Navigate to={`${section.path}/${defaultTopicId(section)}`} replace />;
}

function SectionPage({ sectionId }: { sectionId: SectionId }) {
  const section = sectionById(sectionId)!;
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();
  const topics = topicsForSection(section);
  const topic = topics.find((t) => t.id === topicId);
  const groups = topicsByCategoryForSection(section);

  useEffect(() => {
    if (!topic) {
      navigate(`${section.path}/${defaultTopicId(section)}`, { replace: true });
      return;
    }
    rememberTopic(sectionId, topic.id);
  }, [topic, section, sectionId, navigate]);

  if (!topic) return null;

  const selectTopic = (id: string) => {
    rememberTopic(sectionId, id);
    navigate(`${section.path}/${id}`);
  };

  const selectSection = (id: SectionId) => {
    const next = sectionById(id)!;
    navigate(`${next.path}/${defaultTopicId(next)}`);
  };

  return (
    <div className="app">
      <Sidebar
        section={section}
        activeId={topic.id}
        onSelect={selectTopic}
        onSectionChange={selectSection}
      />
      <TopicView
        key={topic.id}
        topic={topic}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeId={topic.id}
        onSelect={selectTopic}
        groups={groups}
        sectionTabs={
          <div className="section-tabs mobile-section-tabs" role="tablist" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === section.id}
                className="section-tab"
                data-active={s.id === section.id}
                onClick={() => selectSection(s.id)}
              >
                {s.shortLabel}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SectionRedirect sectionId="ds" />} />
        <Route path="/ds" element={<SectionRedirect sectionId="ds" />} />
        <Route path="/ds/:topicId" element={<SectionPage sectionId="ds" />} />
        <Route path="/algo" element={<SectionRedirect sectionId="algo" />} />
        <Route path="/algo/:topicId" element={<SectionPage sectionId="algo" />} />
        <Route path="/api" element={<SectionRedirect sectionId="api" />} />
        <Route path="/api/:topicId" element={<SectionPage sectionId="api" />} />
        <Route path="*" element={<SectionRedirect sectionId="ds" />} />
      </Routes>
    </BrowserRouter>
  );
}

function TopicView({
  topic,
  theme,
  onToggleTheme,
  activeId,
  onSelect,
  groups,
  sectionTabs,
}: {
  topic: Topic;
  theme: Theme;
  onToggleTheme: () => void;
  activeId: string;
  onSelect: (id: string) => void;
  groups: { category: string; topics: Topic[] }[];
  sectionTabs?: ReactNode;
}) {
  const [nonce, setNonce] = useState(0);
  const viz = useMemo(() => {
    const v = topic.create();
    return { ...v, steps: tagTopicChapters(topic.id, v.steps) };
  }, [topic, nonce]);
  const chapters = useMemo(() => deriveChapters(viz.steps), [viz.steps]);
  const player = usePlayer(viz.steps.length, { initialSpeed: 1, learnMode: true });
  const step = viz.steps[player.index];

  usePlayerKeyboard(player);

  return (
    <main className="stage-wrap">
      <header className="topic-head">
        <div className="topic-head-main">
          {sectionTabs}
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase" }}>
            {topic.category}
          </div>
          <h1 style={{ fontFamily: FONT_SANS, fontSize: 34, fontWeight: 800, color: "var(--text)", margin: "4px 0 0" }}>
            {topic.title}
          </h1>
          <TopicMeta topic={topic} onSelect={onSelect} />
        </div>

        <div className="head-actions">
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

      <ColorLegend />

      <Stage
        steps={viz.steps}
        renderStep={viz.renderStep}
        index={player.index}
        caption={step.caption}
        insight={step.insight}
      />

      <section className="controls-bar">
        <Controls
          player={player}
          chapters={chapters}
          onShuffle={topic.shufflable ? () => setNonce((n) => n + 1) : undefined}
        />
      </section>

      <ChapterPanel
        chapters={chapters}
        index={player.index}
        onSeek={player.seek}
      />

      <section className="info">
        <div className="panel">
          <div className="panel-title">How it works</div>
          <p className="explanation">{viz.explanation}</p>
        </div>
        <div className="panel code-panel">
          <div className="panel-title">Code · step {player.index + 1}</div>
          <CodeBlock code={viz.code} highlightLines={step.codeLines} />
        </div>
      </section>

      {topic.quiz && topic.quiz.length > 0 && (
        <QuizPanel topicId={topic.id} questions={topic.quiz} />
      )}
    </main>
  );
}

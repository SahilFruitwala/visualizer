import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AppShell, resolveSectionId, useAppNav } from "./components/AppShell";
import { ChapterPanel } from "./components/ChapterPanel";
import { ColorLegend } from "./components/ColorLegend";
import { Controls } from "./components/Controls";
import { CodeBlock } from "./components/CodeBlock";
import { ComparePage } from "./components/ComparePage";
import { ComplexityPanel } from "./components/ComplexityPanel";
import { PathsPage } from "./components/PathsPage";
import { QuizPanel } from "./components/QuizPanel";
import { Stage } from "./components/Stage";
import { FavoriteButton } from "./components/FavoriteButton";
import { KeyboardHelp } from "./components/KeyboardHelp";
import { PrereqPanel } from "./components/PrereqPanel";
import { RelatedPanel } from "./components/RelatedPanel";
import { TopicMeta } from "./components/TopicNav";
import { TopicPager } from "./components/TopicPager";
import { ThemeProvider, ThemeToggle } from "./components/ThemeToggle";
import { deriveChapters } from "./engine/chapters";
import { prefersReducedMotion } from "./engine/reducedMotion";
import { saveTopicProgress } from "./engine/progress";
import { getResumeStep, saveResumeStep } from "./engine/resume";
import { tagTopicChapters } from "./engine/topicChapters";
import { usePlayerKeyboard } from "./engine/useKeyboard";
import { usePlayer } from "./engine/usePlayer";
import type { Topic } from "./engine/types";
import { TOPICS } from "./topics";
import {
  defaultTopicId,
  rememberTopic,
  sectionById,
  sectionForTopic,
  SECTIONS,
  topicsForSection,
  type SectionId,
} from "./sections";

function SectionRedirect({ sectionId }: { sectionId: SectionId }) {
  const section = sectionById(sectionId)!;
  return <Navigate to={`${section.path}/${defaultTopicId(section)}`} replace />;
}

function TopicRoute({ sectionId }: { sectionId: SectionId }) {
  const section = sectionById(sectionId)!;
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topics = topicsForSection(section);
  const topic = topics.find((t) => t.id === topicId);
  const { selectTopic, selectSection } = useAppNav();

  useEffect(() => {
    const anywhere = TOPICS.find((t) => t.id === topicId);
    if (anywhere && !topic) {
      const owner = sectionForTopic(topicId!);
      if (owner) {
        navigate(`${owner.path}/${topicId}`, { replace: true });
        return;
      }
    }
    if (!topic) {
      navigate(`${section.path}/${defaultTopicId(section)}`, { replace: true });
      return;
    }
    rememberTopic(sectionId, topic.id);
  }, [topic, topicId, section, sectionId, navigate]);

  if (!topic) return null;

  const sectionTabs = (
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
  );

  const mobileToolbar = (
    <div className="mobile-toolbar mobile-toolbar-topic">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => document.dispatchEvent(new CustomEvent("devviz:open-drawer"))}
        aria-label="Browse topics"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Menu</span>
      </button>
      {sectionTabs}
      <button
        type="button"
        className="mobile-search-btn"
        onClick={() => document.dispatchEvent(new CustomEvent("devviz:open-search"))}
        aria-label="Search topics"
      >
        ⌕
      </button>
    </div>
  );

  return (
    <AppShell sectionId={sectionId} activeTopicId={topic.id} view="topics" mobileToolbar={mobileToolbar}>
      <TopicView
        key={topic.id}
        topic={topic}
        onSelect={selectTopic}
      />
    </AppShell>
  );
}

function PathsRoute() {
  const { selectTopic } = useAppNav();
  return (
    <AppShell sectionId={resolveSectionId("/paths")} view="paths">
      <PathsPage onSelect={selectTopic} />
    </AppShell>
  );
}

function CompareRoute() {
  const [searchParams] = useSearchParams();
  const { selectTopic } = useAppNav();
  return (
    <AppShell sectionId={resolveSectionId("/compare")} view="compare">
      <ComparePage
        initialA={searchParams.get("a") ?? undefined}
        initialB={searchParams.get("b") ?? undefined}
        onSelectTopic={selectTopic}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SectionRedirect sectionId="ds" />} />
          <Route path="/ds" element={<SectionRedirect sectionId="ds" />} />
          <Route path="/ds/:topicId" element={<TopicRoute sectionId="ds" />} />
          <Route path="/algo" element={<SectionRedirect sectionId="algo" />} />
          <Route path="/algo/:topicId" element={<TopicRoute sectionId="algo" />} />
          <Route path="/api" element={<SectionRedirect sectionId="backend" />} />
          <Route path="/api/:topicId" element={<TopicRoute sectionId="backend" />} />
          <Route path="/backend" element={<SectionRedirect sectionId="backend" />} />
          <Route path="/backend/:topicId" element={<TopicRoute sectionId="backend" />} />
          <Route path="/frontend" element={<SectionRedirect sectionId="frontend" />} />
          <Route path="/frontend/:topicId" element={<TopicRoute sectionId="frontend" />} />
          <Route path="/paths" element={<PathsRoute />} />
          <Route path="/compare" element={<CompareRoute />} />
          <Route path="*" element={<SectionRedirect sectionId="ds" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function TopicView({
  topic,
  onSelect,
}: {
  topic: Topic;
  onSelect: (id: string) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nonce, setNonce] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const reducedMotion = prefersReducedMotion();

  const viz = useMemo(() => {
    const v = topic.create();
    return { ...v, steps: tagTopicChapters(topic.id, v.steps) };
  }, [topic, nonce]);

  const chapters = useMemo(() => deriveChapters(viz.steps), [viz.steps]);

  const initialIndex = useMemo(() => {
    const fromUrl = searchParams.get("step");
    if (fromUrl != null) {
      const n = Number.parseInt(fromUrl, 10);
      if (!Number.isNaN(n)) {
        return Math.max(0, Math.min(n, viz.steps.length - 1));
      }
    }
    const resumed = getResumeStep(topic.id);
    if (resumed != null) {
      return Math.max(0, Math.min(resumed, viz.steps.length - 1));
    }
    return 0;
  }, [topic.id, viz.steps.length, searchParams]);

  const player = usePlayer(viz.steps.length, {
    initialSpeed: 1,
    initialIndex,
    learnMode: reducedMotion ? true : undefined,
  });
  const step = viz.steps[player.index];

  usePlayerKeyboard(player, !focusMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?" || focusMode) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      setHelpOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  useEffect(() => {
    document.title = `${topic.title} — Dev Visualizer`;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (selector.includes("property=")) {
          el.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] ?? "");
        } else {
          el.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] ?? "");
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", topic.blurb);
    setMeta('meta[property="og:title"]', "content", topic.title);
    setMeta('meta[property="og:description"]', "content", topic.blurb);

    return () => {
      document.title = "Dev Visualizer — Learn DSA & APIs";
    };
  }, [topic]);

  useEffect(() => {
    saveResumeStep(topic.id, player.index);
    saveTopicProgress(topic.id, player.index, viz.steps.length);
    if (searchParams.get("step") === String(player.index)) return;
    const next = new URLSearchParams(searchParams);
    next.set("step", String(player.index));
    setSearchParams(next, { replace: true });
  }, [player.index, topic.id, viz.steps.length, searchParams, setSearchParams]);

  useEffect(() => {
    if (!shareNote) return;
    const t = window.setTimeout(() => setShareNote(null), 2000);
    return () => window.clearTimeout(t);
  }, [shareNote]);

  const shareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?step=${player.index}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
    } catch {
      setShareNote("Could not copy");
    }
  };

  return (
    <main className={`stage-wrap${focusMode ? " focus-mode" : ""}`}>
      {!focusMode && (
        <header className="topic-head">
          <div className="topic-head-main">
            <div className="topic-category">{topic.category}</div>
            <h1 className="topic-title">{topic.title}</h1>
            <TopicMeta topic={topic} />
          </div>
          <div className="topic-head-actions">
            <FavoriteButton topicId={topic.id} />
            <ThemeToggle />
          </div>
        </header>
      )}

      {!focusMode && <TopicPager topic={topic} onSelect={onSelect} />}

      {shareNote && (
        <div className="toast" role="status">
          {shareNote}
        </div>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {player.index + 1}: {step.caption}
      </div>

      {!focusMode && <ColorLegend />}

      {!focusMode && (
        <ComplexityPanel topic={topic} stepIndex={player.index} totalSteps={viz.steps.length} />
      )}

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
          onShare={shareLink}
          onFocusToggle={() => setFocusMode((v) => !v)}
          focusMode={focusMode}
        />
      </section>

      {!focusMode && (
        <>
          <ChapterPanel chapters={chapters} index={player.index} onSeek={player.seek} />

          <PrereqPanel topic={topic} onSelect={onSelect} />

          <RelatedPanel topic={topic} onSelect={onSelect} />

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
        </>
      )}

      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import type { AppView } from "./AppShell";
import {
  defaultTopicId,
  topicsByCategoryForSection,
  topicsForSection,
  type Section,
  SECTIONS,
} from "../sections";
import { FONT_MONO, FONT_SANS } from "../theme";
import { ThemeToggle } from "./ThemeToggle";

function NavGroup({
  category,
  topics,
  activeId,
  onSelect,
  query,
  defaultOpen,
}: {
  category: string;
  topics: { id: string; title: string; blurb: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  query: string;
  defaultOpen: boolean;
}) {
  const hasActive = topics.some((t) => t.id === activeId);
  const [open, setOpen] = useState(defaultOpen || hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <div className="nav-group" data-open={open}>
      <button
        type="button"
        className="nav-group-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="nav-group-label">{category}</span>
        <span className="nav-group-meta">
          <span className="nav-group-count">{topics.length}</span>
          <span className="nav-group-chevron" aria-hidden />
        </span>
      </button>
      {open && (
        <div className="nav-group-items">
          {topics.map((t) => (
            <button
              key={t.id}
              className="nav-item"
              data-active={t.id === activeId}
              onClick={() => onSelect(t.id)}
              title={t.blurb}
            >
              <span className="nav-item-title">{t.title}</span>
              {query.trim() && <span className="nav-item-blurb">{t.blurb}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  section,
  activeId,
  view,
  onSelect,
  onSectionChange,
  onNavigate,
  onOpenSearch,
}: {
  section: Section;
  activeId: string;
  view: AppView;
  onSelect: (id: string) => void;
  onSectionChange: (sectionId: Section["id"]) => void;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}) {
  const [query, setQuery] = useState("");
  const allTopics = topicsForSection(section);
  const groups = topicsByCategoryForSection(section);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        topics: g.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.blurb.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.topics.length > 0);
  }, [groups, query]);

  const totalInSection = allTopics.length;
  const searching = query.trim().length > 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <button type="button" className="sidebar-brand" onClick={() => onNavigate(`${section.path}/${defaultTopicId(section)}`)}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
            Dev<span style={{ color: "var(--accent)" }}>·</span>Visualizer
          </span>
        </button>
        <div className="sidebar-subhead" style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          <span>{section.label} · {totalInSection} topics</span>
          <a
            className="sidebar-contribute"
            href="https://github.com/SahilFruitwala/visualizer/blob/master/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            title="Found a bug or want to add a topic? Contribute on GitHub"
            aria-label="Contribute on GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>Contribute</span>
          </a>
        </div>

        <button type="button" className="sidebar-search-btn" onClick={onOpenSearch}>
          <span>⌕ Search all topics</span>
          <kbd>⌘K</kbd>
        </button>

        <input
          type="search"
          className="sidebar-search"
          placeholder={`Filter ${section.shortLabel}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={`Filter topics in ${section.label}`}
        />
      </div>

      <div className="section-tabs" role="tablist" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === section.id}
            className="section-tab"
            data-active={s.id === section.id}
            onClick={() => onSectionChange(s.id)}
          >
            {s.shortLabel}
          </button>
        ))}
      </div>

      <nav className="sidebar-nav">
        {searching && filteredGroups.length === 0 && (
          <p className="search-empty">No topics match “{query.trim()}”.</p>
        )}
        {filteredGroups.map((g) => (
          <NavGroup
            key={g.category}
            category={g.category}
            topics={g.topics}
            activeId={activeId}
            onSelect={onSelect}
            query={query}
            defaultOpen={searching || filteredGroups.length <= 4}
          />
        ))}
      </nav>

      <footer className="sidebar-footer">
        <button
          type="button"
          className="sidebar-footer-btn"
          data-active={view === "paths"}
          onClick={() => onNavigate("/paths")}
        >
          Paths
        </button>
        <button
          type="button"
          className="sidebar-footer-btn"
          data-active={view === "compare"}
          onClick={() => onNavigate("/compare")}
        >
          Compare
        </button>
        <ThemeToggle className="theme-toggle sidebar-theme-toggle" />
      </footer>
    </aside>
  );
}

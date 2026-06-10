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
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          {section.label} · {totalInSection} topics
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

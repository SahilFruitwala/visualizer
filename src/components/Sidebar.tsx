import { useMemo, useState } from "react";
import { isTopicComplete } from "../engine/progress";
import { topicsByCategoryForSection, topicsForSection, type Section, SECTIONS } from "../sections";
import { FONT_MONO, FONT_SANS } from "../theme";

export function Sidebar({
  section,
  activeId,
  onSelect,
  onSectionChange,
}: {
  section: Section;
  activeId: string;
  onSelect: (id: string) => void;
  onSectionChange: (sectionId: Section["id"]) => void;
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

  const globalMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q),
    );
  }, [allTopics, query]);

  return (
    <aside className="sidebar">
      <div style={{ padding: "22px 20px 14px" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
          Dev<span style={{ color: "var(--accent)" }}>·</span>Visualizer
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          DSA & APIs — learn by watching
        </div>
        <input
          type="search"
          className="sidebar-search"
          placeholder="Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search topics"
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

      <nav style={{ overflowY: "auto", flex: 1, paddingBottom: 24 }}>
        {query.trim() && globalMatches.length === 0 && (
          <p className="search-empty">No topics match “{query.trim()}”.</p>
        )}
        {filteredGroups.map((g) => (
          <div key={g.category} style={{ marginBottom: 6 }}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "var(--muted)",
                padding: "12px 20px 6px",
              }}
            >
              {g.category}
            </div>
            {g.topics.map((t) => (
              <button
                key={t.id}
                className="nav-item"
                data-active={t.id === activeId}
                data-done={isTopicComplete(t.id)}
                onClick={() => onSelect(t.id)}
                title={t.blurb}
              >
                <span className="nav-item-title">{t.title}</span>
                {query.trim() && <span className="nav-item-blurb">{t.blurb}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

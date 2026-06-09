import { topicsByCategoryForSection, type Section, SECTIONS } from "../sections";
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
  const groups = topicsByCategoryForSection(section);

  return (
    <aside className="sidebar">
      <div style={{ padding: "22px 20px 14px" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
          Dev<span style={{ color: "var(--accent)" }}>·</span>Visualizer
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          DSA & APIs — learn by watching
        </div>
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
        {groups.map((g) => (
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
                onClick={() => onSelect(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

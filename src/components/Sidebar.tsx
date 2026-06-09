import { topicsByCategory } from "../topics";
import { FONT_MONO, FONT_SANS } from "../theme";

export function Sidebar({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const groups = topicsByCategory();
  return (
    <aside className="sidebar">
      <div style={{ padding: "22px 20px 14px" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
          DSA<span style={{ color: "var(--accent)" }}>·</span>Visualizer
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          learn by watching
        </div>
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

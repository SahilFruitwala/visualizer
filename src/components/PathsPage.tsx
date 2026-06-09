import { LEARNING_PATHS } from "../engine/paths";
import { TOPICS } from "../topics";
import { sectionForTopic } from "../sections";
import { ThemeToggle } from "./ThemeToggle";

export function PathsPage({ onSelect }: { onSelect: (topicId: string) => void }) {
  return (
    <main className="stage-wrap page-wrap">
      <header className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Learning paths</h1>
          <p className="page-subtitle">
            Curated sequences that build on each other. Pick a path and work through it in order.
          </p>
        </div>
        <div className="page-head-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="paths-grid">
        {LEARNING_PATHS.map((path) => {
          const firstTopicId = path.topicIds[0];

          return (
            <article key={path.id} className="path-card">
              <h2 className="path-card-title">{path.title}</h2>
              <p className="path-card-meta">{path.topicIds.length} topics</p>

              <ol className="path-topic-list">
                {path.topicIds.map((id, i) => {
                  const topic = TOPICS.find((t) => t.id === id);
                  if (!topic) return null;
                  const section = sectionForTopic(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="path-topic-btn"
                        onClick={() => onSelect(id)}
                      >
                        <span className="path-topic-num">{i + 1}</span>
                        <span className="path-topic-info">
                          <span className="path-topic-name">{topic.title}</span>
                          <span className="path-topic-section">
                            {section?.shortLabel} · {topic.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <button
                type="button"
                className="path-start-btn"
                onClick={() => firstTopicId && onSelect(firstTopicId)}
              >
                Start path →
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

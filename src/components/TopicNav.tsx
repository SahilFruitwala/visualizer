import { TOPICS } from "../topics";
import { pathForTopic, nextInPath, prevInPath } from "../engine/paths";
import { isTopicComplete } from "../engine/progress";
import type { Topic } from "../engine/types";
import { sectionForTopic } from "../sections";
import { FONT_MONO } from "../theme";

export function TopicMeta({
  topic,
  onSelect,
}: {
  topic: Topic;
  onSelect: (id: string) => void;
}) {
  const path = pathForTopic(topic.id);
  const next = nextInPath(topic.id);
  const prev = prevInPath(topic.id);
  const prereqTopics = (topic.prerequisites ?? [])
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter((t): t is Topic => t != null);
  const done = isTopicComplete(topic.id);

  return (
    <div className="topic-meta">
      <p className="topic-blurb">{topic.blurb}</p>

      {(topic.useWhen || (topic.badges && topic.badges.length > 0)) && (
        <div className="topic-badges">
          {topic.useWhen && <span className="badge badge-use">Use when: {topic.useWhen}</span>}
          {topic.badges?.map((b) => (
            <span key={b} className="badge">
              {b}
            </span>
          ))}
        </div>
      )}

      {path && (
        <div className="topic-path">
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "var(--muted)", letterSpacing: 1 }}>
            PATH · {path.title.toUpperCase()}
          </span>
          <div className="path-dots">
            {path.topicIds.map((id) => {
              const t = TOPICS.find((x) => x.id === id);
              if (!t) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className="path-dot"
                  data-active={id === topic.id}
                  data-done={isTopicComplete(id)}
                  title={t.title}
                  onClick={() => onSelect(id)}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {prereqTopics.length > 0 && (
        <div className="topic-links">
          <span className="link-label">Prerequisites:</span>
          {prereqTopics.map((t) => {
            const cross = sectionForTopic(t.id)?.id !== sectionForTopic(topic.id)?.id;
            return (
              <button key={t.id} type="button" className="text-link" onClick={() => onSelect(t.id)}>
                {t.title}
                {cross && <span className="link-section"> · {sectionForTopic(t.id)?.shortLabel}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="topic-links">
        {prev && (
          <button type="button" className="nav-link prev" onClick={() => onSelect(prev.topicId)}>
            ← {TOPICS.find((t) => t.id === prev.topicId)?.title}
          </button>
        )}
        {next && (
          <button type="button" className="nav-link next" onClick={() => onSelect(next.topicId)}>
            {TOPICS.find((t) => t.id === next.topicId)?.title} →
          </button>
        )}
      </div>

      {done && (
        <p className="topic-done" style={{ fontFamily: FONT_MONO, fontSize: 12, color: "var(--accent)", margin: "8px 0 0" }}>
          ✓ Completed
        </p>
      )}
    </div>
  );
}

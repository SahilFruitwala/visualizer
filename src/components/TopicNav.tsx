import type { Topic } from "../engine/types";

export function TopicMeta({ topic }: { topic: Topic }) {
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
    </div>
  );
}

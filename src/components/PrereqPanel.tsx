import { TOPICS } from "../topics";
import type { Topic } from "../engine/types";
import { sectionForTopic } from "../sections";

export function PrereqPanel({
  topic,
  onSelect,
}: {
  topic: Topic;
  onSelect: (id: string) => void;
}) {
  const prereqTopics = (topic.prerequisites ?? [])
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter((t): t is Topic => t != null);

  if (prereqTopics.length === 0) return null;

  return (
    <section className="panel prereq-panel">
      <div className="panel-title">Prerequisites</div>
      <p className="prereq-hint">Helpful to know before this topic.</p>
      <ul className="prereq-list">
        {prereqTopics.map((t) => {
          const cross = sectionForTopic(t.id)?.id !== sectionForTopic(topic.id)?.id;
          return (
            <li key={t.id}>
              <button type="button" className="prereq-link" onClick={() => onSelect(t.id)}>
                <span>{t.title}</span>
                {cross && (
                  <span className="prereq-link-section">{sectionForTopic(t.id)?.shortLabel}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

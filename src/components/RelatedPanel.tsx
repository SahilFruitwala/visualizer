import { getRelatedTopics } from "../engine/relatedTopics";
import type { Topic } from "../engine/types";
import { sectionForTopic } from "../sections";

export function RelatedPanel({
  topic,
  onSelect,
}: {
  topic: Topic;
  onSelect: (id: string) => void;
}) {
  const relatedTopics = getRelatedTopics(topic.id);

  if (relatedTopics.length === 0) return null;

  return (
    <section className="panel related-panel">
      <div className="panel-title">Related topics</div>
      <p className="related-hint">Topics that build on this one or share the same category.</p>
      <ul className="related-list">
        {relatedTopics.map((t) => {
          const cross = sectionForTopic(t.id)?.id !== sectionForTopic(topic.id)?.id;
          return (
            <li key={t.id}>
              <button type="button" className="related-link" onClick={() => onSelect(t.id)}>
                <span>{t.title}</span>
                {cross && (
                  <span className="related-link-section">{sectionForTopic(t.id)?.shortLabel}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

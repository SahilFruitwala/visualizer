import { TOPICS } from "../topics";
import { topicNeighbors } from "../engine/topicNav";
import type { Topic } from "../engine/types";

export function TopicPager({
  topic,
  onSelect,
}: {
  topic: Topic;
  onSelect: (id: string) => void;
}) {
  const { prevId, nextId } = topicNeighbors(topic.id);
  const prevTitle = prevId ? TOPICS.find((t) => t.id === prevId)?.title : null;
  const nextTitle = nextId ? TOPICS.find((t) => t.id === nextId)?.title : null;

  return (
    <nav className="topic-nav-bar" aria-label="Topic navigation">
      <button
        type="button"
        className="topic-nav-btn"
        disabled={!prevId}
        onClick={() => prevId && onSelect(prevId)}
      >
        <span className="topic-nav-label">Previous</span>
        <span className="topic-nav-title">{prevTitle ?? "—"}</span>
      </button>
      <button
        type="button"
        className="topic-nav-btn topic-nav-btn-next"
        disabled={!nextId}
        onClick={() => nextId && onSelect(nextId)}
      >
        <span className="topic-nav-label">Next</span>
        <span className="topic-nav-title">{nextTitle ?? "—"}</span>
      </button>
    </nav>
  );
}

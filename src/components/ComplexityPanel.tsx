import type { Topic } from "../engine/types";

const SORTING_CATEGORIES = new Set(["Sorting", "Searching"]);

export function ComplexityPanel({
  topic,
  totalSteps,
}: {
  topic: Topic;
  stepIndex: number;
  totalSteps: number;
}) {
  const hasBadges = topic.badges && topic.badges.length > 0;
  const showProgress = SORTING_CATEGORIES.has(topic.category) || totalSteps > 8;

  if (!hasBadges && !showProgress) return null;

  return (
    <section className="complexity-panel" aria-label="Complexity and progress">
      {hasBadges && (
        <div className="complexity-badges">
          {topic.badges!.map((b) => (
            <span key={b} className="complexity-badge">
              {b}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

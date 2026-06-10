import type { Topic } from "../engine/types";

const SORTING_CATEGORIES = new Set(["Sorting", "Searching"]);

export function ComplexityPanel({
  topic,
  stepIndex,
  totalSteps,
}: {
  topic: Topic;
  stepIndex: number;
  totalSteps: number;
}) {
  const hasBadges = topic.badges && topic.badges.length > 0;
  const showProgress = SORTING_CATEGORIES.has(topic.category) || totalSteps > 8;

  if (!hasBadges && !showProgress) return null;

  const pct = totalSteps > 1 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 100;

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
      {showProgress && (
        <div className="complexity-progress">
          <div className="complexity-progress-label">
            <span>Animation progress</span>
            <span>
              step {stepIndex + 1}/{totalSteps} ({pct}%)
            </span>
          </div>
          <div className="complexity-progress-track" aria-hidden>
            <div className="complexity-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </section>
  );
}

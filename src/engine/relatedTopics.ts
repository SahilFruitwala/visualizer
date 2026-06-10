import { TOPICS } from "../topics";
import type { Topic } from "./types";

export function getRelatedTopics(topicId: string): Topic[] {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return [];

  const seen = new Set<string>([topicId]);
  const related: Topic[] = [];

  for (const t of TOPICS) {
    if (t.prerequisites?.includes(topicId) && !seen.has(t.id)) {
      seen.add(t.id);
      related.push(t);
    }
  }

  for (const t of TOPICS) {
    if (t.category === topic.category && !seen.has(t.id)) {
      seen.add(t.id);
      related.push(t);
    }
  }

  return related.slice(0, 5);
}

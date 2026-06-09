import { topicsForSection, sectionForTopic } from "../sections";

/** Prev/next in sidebar order (same sequence as the section nav). */
export function topicNeighbors(topicId: string): {
  prevId?: string;
  nextId?: string;
} {
  const section = sectionForTopic(topicId);
  if (!section) return {};
  const topics = topicsForSection(section);
  const i = topics.findIndex((t) => t.id === topicId);
  if (i < 0) return {};

  return {
    prevId: i > 0 ? topics[i - 1].id : undefined,
    nextId: i < topics.length - 1 ? topics[i + 1].id : undefined,
  };
}

import type { Topic } from "./types";
import { TOPIC_META } from "./topicMeta";

export function enrichTopic(topic: Topic): Topic {
  const meta = TOPIC_META[topic.id];
  if (!meta) return topic;
  return {
    ...topic,
    prerequisites: topic.prerequisites ?? meta.prerequisites,
    quiz: topic.quiz && topic.quiz.length >= 2 ? topic.quiz : (meta.quiz ?? topic.quiz),
    useWhen: topic.useWhen ?? meta.useWhen,
    badges: topic.badges ?? meta.badges,
    shufflable: topic.shufflable ?? meta.shufflable,
  };
}

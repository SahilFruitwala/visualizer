import { LEARNING_PATHS } from "./paths";

const PROGRESS_KEY = "devviz:progress";

interface TopicProgressEntry {
  step: number;
  totalSteps: number;
  completed: boolean;
}

function readProgress(): Record<string, TopicProgressEntry> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TopicProgressEntry>;
  } catch {
    return {};
  }
}

function writeProgress(map: Record<string, TopicProgressEntry>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function saveTopicProgress(topicId: string, step: number, totalSteps: number) {
  const map = readProgress();
  const prev = map[topicId];
  map[topicId] = {
    step,
    totalSteps,
    completed: prev?.completed === true || step >= totalSteps - 1,
  };
  writeProgress(map);
}

export function getTopicProgress(
  topicId: string,
): { step: number; totalSteps: number; completed: boolean } | null {
  const entry = readProgress()[topicId];
  if (!entry) return null;
  return { step: entry.step, totalSteps: entry.totalSteps, completed: entry.completed };
}

export function isTopicCompleted(topicId: string): boolean {
  return readProgress()[topicId]?.completed === true;
}

export function getPathProgress(pathId: string): {
  completed: number;
  total: number;
  percent: number;
} {
  const path = LEARNING_PATHS.find((p) => p.id === pathId);
  if (!path) return { completed: 0, total: 0, percent: 0 };

  const total = path.topicIds.length;
  const completed = path.topicIds.filter(isTopicCompleted).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

const RESUME_KEY = "devviz:resume";

function readResume(): Record<string, number> {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeResume(map: Record<string, number>) {
  localStorage.setItem(RESUME_KEY, JSON.stringify(map));
}

export function getResumeStep(topicId: string): number | null {
  const step = readResume()[topicId];
  return step != null && step >= 0 ? step : null;
}

export function saveResumeStep(topicId: string, step: number) {
  const map = readResume();
  map[topicId] = step;
  writeResume(map);
}

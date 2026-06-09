const KEY = "devviz:completed";

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function write(ids: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function isTopicComplete(topicId: string): boolean {
  return read().has(topicId);
}

export function markTopicComplete(topicId: string) {
  const ids = read();
  ids.add(topicId);
  write(ids);
}

export function clearTopicComplete(topicId: string) {
  const ids = read();
  ids.delete(topicId);
  write(ids);
}

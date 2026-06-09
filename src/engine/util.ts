// Fisher–Yates shuffle (returns a new array).
export function shuffle<T>(a: readonly T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// A small array of distinct values 1..n in random order.
export function randomArray(n: number, max = 99): number[] {
  const out = new Set<number>();
  while (out.size < n) out.add(1 + Math.floor(Math.random() * max));
  return [...out];
}

export function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}


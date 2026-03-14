const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();

export function isRateLimited(key: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || now > current.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  attempts.set(key, current);
  return { limited: false, retryAfter: 0 };
}

type Bucket = { tokens: number; updated: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const b = buckets.get(key) ?? { tokens: limit, updated: now }
  const elapsed = now - b.updated
  const refill = Math.floor(elapsed / windowMs) * limit
  b.tokens = Math.min(limit, b.tokens + refill)
  b.updated = now
  if (b.tokens <= 0) {
    buckets.set(key, b)
    return { allowed: false, remaining: 0 }
  }
  b.tokens -= 1
  buckets.set(key, b)
  return { allowed: true, remaining: b.tokens }
}


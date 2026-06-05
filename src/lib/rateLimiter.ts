import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const limiterMap = new Map<string, RateLimitRecord>();

export function isRateLimited(
  req: NextRequest,
  limit: number,
  windowMs: number,
  actionKey: string
): { limited: boolean; remaining: number; reset: number } {
  // Get IP address
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const key = `${actionKey}:${ip}`;
  const now = Date.now();

  const record = limiterMap.get(key);

  if (!record) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    limiterMap.set(key, newRecord);
    return { limited: false, remaining: limit - 1, reset: newRecord.resetTime };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { limited: false, remaining: limit - 1, reset: record.resetTime };
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { limited: false, remaining: limit - record.count, reset: record.resetTime };
}

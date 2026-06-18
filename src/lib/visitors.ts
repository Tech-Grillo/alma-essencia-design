type VisitorsMap = Map<string, number>;

const visitors: VisitorsMap = new Map();

let redisClient: any = null;
const useRedis = typeof process !== "undefined" && !!process.env.REDIS_URL;
if (useRedis) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis");
    redisClient = new IORedis(process.env.REDIS_URL);
  } catch (e) {
    console.warn("ioredis not available or failed to init, falling back to in-memory visitors");
    redisClient = null;
  }
}

export function touchVisitor(id: string) {
  if (redisClient) {
    // store as sorted set with score = timestamp
    redisClient.zadd("visitors", Date.now(), id).catch(() => {});
    // keep key expiry to avoid unbounded growth
    redisClient.expire("visitors", 60 * 60 * 24 * 2).catch(() => {});
    return;
  }

  visitors.set(id, Date.now());
}

export async function getActiveVisitors(windowMs = 1000 * 60 * 5) {
  if (redisClient) {
    const minScore = Date.now() - windowMs;
    try {
      const count = await redisClient.zcount("visitors", minScore, "+inf");
      return Number(count);
    } catch (e) {
      return 0;
    }
  }

  const now = Date.now();
  let count = 0;
  for (const [, ts] of visitors) {
    if (now - ts <= windowMs) count++;
  }
  return count;
}

export function cleanupVisitors(windowMs = 1000 * 60 * 60) {
  if (redisClient) {
    const threshold = Date.now() - windowMs;
    redisClient.zremrangebyscore("visitors", 0, threshold).catch(() => {});
    return;
  }

  const now = Date.now();
  for (const [id, ts] of visitors) {
    if (now - ts > windowMs) visitors.delete(id);
  }
}

export async function getAllVisitors() {
  if (redisClient) {
    try {
      const ids = await redisClient.zrange("visitors", 0, -1);
      return ids;
    } catch (e) {
      return [];
    }
  }

  return Array.from(visitors.keys());
}

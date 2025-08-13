import Redis from "ioredis";

// Create Redis connection
export const redis = new Redis();

// Lua script for atomic like toggle
export const toggleLikeLua = `
  local key = KEYS[1]
  local userId = ARGV[1]
  if redis.call("SISMEMBER", key, userId) == 1 then
    redis.call("SREM", key, userId)
    return 0 -- unliked
  else
    redis.call("SADD", key, userId)
    return 1 -- liked
  end
`;

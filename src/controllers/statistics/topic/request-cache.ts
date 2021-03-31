import hash from 'object-hash';
import httpContext from 'express-http-context';
import redisClient from '@lib/redis';
import config from 'config';

export const requestCache = async (topic, params, func, ttl=300) => {
    if (config.get('requestCache.enabled') === true) {
        const redis = await redisClient.connect();
        const requestHash = hash(params);
        const userId = httpContext.get('user_id');
        const domainId = httpContext.get('domain_id');
        const cacheKey = `${topic}:${domainId}:${userId}:${requestHash}`;

        const cacheValue = await redis.get(cacheKey);
        if (cacheValue) {
            return JSON.parse(<string>cacheValue);
        }

        const response = await func(params);
        await redis.set(cacheKey, JSON.stringify(response), ttl || config.get('requestCache.ttl') || 300);

        return response;
    } else {
        return await func(params);
    }
};

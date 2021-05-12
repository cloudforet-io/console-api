import httpContext from 'express-http-context';
import redisClient from '@lib/redis';

export const setParamsOnRedis = (key, body) => {
    const param = {
        req_body: body,
        auth_info: {
            token: httpContext.get('token'),
            user_id: httpContext.get('user_id'),
            domain_id: httpContext.get('domain_id'),
            user_type: httpContext.get('user_type')
        }
    };
    redisClient.set(key, JSON.stringify(param), 600);
};

export const getParamsFromRedis = async (key: string) => {
    const client = await redisClient.connect();
    const source_params = await client.get(key) as any;
    return JSON.parse(source_params);
};

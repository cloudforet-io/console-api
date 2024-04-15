import httpContext from 'express-http-context';

import { ExcelExportOptions } from '@controllers/add-ons/excel/type';
import { RedisParam } from '@lib/excel/type';
import redisClient from '@lib/redis';

export const setParamsOnRedis = async (key, body: ExcelExportOptions|ExcelExportOptions[]) => {
    const client = await redisClient.connect();
    const param: RedisParam = {
        req_body: body,
        auth_info: {
            token: httpContext.get('token'),
            user_id: httpContext.get('user_id'),
            domain_id: httpContext.get('domain_id'),
            user_type: httpContext.get('user_type')
        }
    };
    await client.set(key, JSON.stringify(param), 600);
};

export const getParamsFromRedis = async (key: string): Promise<RedisParam> => {
    const client = await redisClient.connect();
    const source_params = await client.get(key) as any;
    return JSON.parse(source_params) as RedisParam;
};

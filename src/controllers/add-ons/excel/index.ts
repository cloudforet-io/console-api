import { createExcel } from '@lib/excel';
import { setParamsOnRedis, getParamsFromRedis } from '@lib/excel/redis';
import { setAuthInfo } from '@lib/excel/auth-info';
import { get } from 'lodash';
import { v4 } from 'uuid';

export const exportExcel = async (request) => {
    const redisKey = v4();
    setParamsOnRedis(redisKey, request.body);
    return { file_link: `/add-ons/excel/download?key=${redisKey}` };
};

export const downloadExcel = async (request, response) => {
    const redisKey = request.query.key;
    const redisParam = await getParamsFromRedis(redisKey);
    const authInfo = get(redisParam, 'auth_info');

    if (!authInfo) {
        throw new Error(`Invalid download key (key = ${redisKey})`);
    } else {
        setAuthInfo(authInfo);
    }

    return await createExcel(redisParam, response);
};

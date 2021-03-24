import {
    setParamsOnRedis, getParamsFromRedis, setAuthInfo,
    createExcel
} from '@lib/excel';
import { get } from 'lodash';
import { v4 } from 'uuid';

export const exportExcel = async (request) => {
    const redisKey = v4();
    if (!request.body.template.hasOwnProperty('options')) {
        request.body.template.options = {};
    }
    setParamsOnRedis(redisKey, request.body);

    const downloadUrl = `/add-ons/excel/download?key=${redisKey}`;
    return downloadUrl;
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

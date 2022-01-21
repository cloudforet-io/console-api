import { createExcel } from '@lib/excel';
import { setParamsOnRedis, getParamsFromRedis } from '@lib/excel/redis';
import { setAuthInfo } from '@lib/excel/auth-info';
import { get } from 'lodash';
import { v4 as uuid } from 'uuid';
import { DownloadExcelRequest, ExcelExportRequest, ExcelExportResponse } from '@controllers/add-ons/excel/type';

export const exportExcel = async (request: ExcelExportRequest): Promise<ExcelExportResponse> => {
    const redisKey = uuid();
    setParamsOnRedis(redisKey, request.body);
    return { file_link: `/add-ons/excel/download?key=${redisKey}` };
};

export const downloadExcel = async (request: DownloadExcelRequest, response) => {
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

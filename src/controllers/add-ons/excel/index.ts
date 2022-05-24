import { Response } from 'express';
import { get } from 'lodash';
import { v4 as uuid } from 'uuid';

import { DownloadExcelRequest, ExcelExportOptions, ExcelExportRequest, ExcelExportResponse } from '@controllers/add-ons/excel/type';
import { createExcel } from '@lib/excel';
import { setAuthInfo } from '@lib/excel/auth-info';
import { setParamsOnRedis, getParamsFromRedis } from '@lib/excel/redis';
import { ExcelOptions } from '@lib/excel/type';

const checkExcelExportParams = (options: ExcelExportOptions, arrayIdx?: number) => {
    const { source, template } = options;
    if (!source) {
        throw new Error(`Required Parameter. (key = source${arrayIdx === undefined ? '' : ` in ${arrayIdx}th index`})`);
    }
    if (!template) {
        throw new Error(`Required Parameter. (key = template${arrayIdx === undefined ? '' : ` in ${arrayIdx}th index`})`);
    }

    if (!source.url || !source.param) {
        throw new Error(`Invalid Parameter. (source${arrayIdx === undefined ? '' : ` in ${arrayIdx}th index`} = must have url and param keys)`);
    }
    if (typeof source.url !== 'string') {
        throw new Error(`Parameter type is invalid. (source.url${arrayIdx === undefined ? '' : ` in ${arrayIdx}th index`} = string)`);
    }
    if (!source.param.query) {
        throw new Error(`Invalid Parameter. (source.param${arrayIdx === undefined ? '' : ` in ${arrayIdx}th index`} = must have query)`);
    }
};

export const exportExcel = async ({ body }: ExcelExportRequest): Promise<ExcelExportResponse> => {
    const redisKey = uuid();
    if (Array.isArray(body)) {
        body.forEach((d, idx) => checkExcelExportParams(d, idx));
    } else {
        checkExcelExportParams(body);
    }

    setParamsOnRedis(redisKey, body);
    return { file_link: `/add-ons/excel/download?key=${redisKey}` };
};

export const downloadExcel = async (request: DownloadExcelRequest, response: Response) => {
    const redisKey = request.query.key;
    const redisParam = await getParamsFromRedis(redisKey);
    const authInfo = get(redisParam, 'auth_info');

    if (!authInfo) {
        throw new Error(`Invalid download key (key = ${redisKey})`);
    } else {
        setAuthInfo(authInfo);
    }

    const excelOptions = get(redisParam, 'req_body') as ExcelOptions|ExcelOptions[];
    return await createExcel(response, excelOptions);
};

import { get, range } from 'lodash';
import { DateTime } from 'luxon';
import httpContext from 'express-http-context';
import redisClient from '@lib/redis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import serviceClient from '@lib/service-client';
import ExcelJS from 'exceljs';

dayjs.extend(utc);
dayjs.extend(timezone);


/* Raw Data */
const getRawData = async (redisParam) => {
    const sourceURL = get(redisParam,'req_body.source.url');
    const sourceParam = get(redisParam,'req_body.source.param');

    if (!sourceURL || !sourceParam) {
        throw new Error('Unsupported api type.(reason= data form doesn\'t support file format.)');
    }
    delete sourceParam.query.page; // delete page limit option

    let data = [];
    const routeName = sourceURL.substr(0, sourceURL.indexOf('/'));
    const client = await serviceClient.get(routeName, 'v1');
    try {
        const res = await client.post(sourceURL, sourceParam);
        data = get(res, 'data.results', []);
    } catch(e) {
        console.error('Excel data retrieval has failed due to', e.message);
    }

    return data;
};

/* Columns */
const getExcelColumns = (template) => {
    const columnFields = template.data_source;
    const columns = [];

    columnFields.forEach((field) => {
        const column = {
            header: field.name,
            key: field.key,
            type: field.type,
            width: 20,
            style: {
                alignment: {
                    vertical: 'top',
                    horizontal:'left'
                }
            }
        };
        columns.push(column);
    });

    return columns;
};

/* Rows */
const convertRawDataToExcelData = (rawData, columns, timezone) => {
    const results = [];
    rawData.forEach((data) => {
        const rowData = {};
        columns.forEach((column) => {
            let cellData = data[column.key];
            if (cellData && column.type === 'datetime') {
                const seconds = Number(cellData.seconds);
                cellData = DateTime.fromSeconds(seconds).setZone(timezone).toFormat('yyyy-LL-dd HH:mm:ss');
            } else if (Array.isArray(cellData)) {
                let cellDataWithLineBreak = '';
                cellData.forEach((d, index) => {
                    if (index > 0) cellDataWithLineBreak += '\n';
                    cellDataWithLineBreak += JSON.stringify(d);
                });
                cellData = cellDataWithLineBreak;
            }
            rowData[column.key] = cellData;
        });
        results.push(rowData);
    });
    return results;
};

/* Header */
const convertNumToLetter = (num) => {
    let letters = '';
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
        num = Math.floor(num / 26) - 1;
    }
    return letters;
};
const setHeaderStyle = (workSheet, columnLength) => {
    const headerLetters = range(columnLength).map((i) => `${convertNumToLetter(i)}1`);    // [ 'A1', 'B1', 'C1', 'D1', 'E1', 'F1' ]
    headerLetters.forEach((letter) => {
        workSheet.getCell(letter).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb:'ffbdc0bf' }
        };
        workSheet.getCell(letter).font = {
            bold: true
        };
        workSheet.getCell(letter).border = {
            top: { style:'thin' },
            left: { style:'thin' },
            bottom: { style:'thin' },
            right: { style:'thin' }
        };
    });
};

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

export const getParamsFromRedis = async (key) => {
    const client = await redisClient.connect();
    const source_params = await client.get(key);
    return JSON.parse(source_params);
};

export const setAuthInfo = (authInfo) => {
    httpContext.set('token', authInfo.token);
    httpContext.set('user_id', authInfo.user_id);
    httpContext.set('domain_id', authInfo.domain_id);
    httpContext.set('user_type', authInfo.user_type);
};

export const createExcel = async (redisParam, response) => {
    const rawData = await getRawData(redisParam);
    const template = get(redisParam,'req_body.template');
    const timezone = template.options.timezone;

    const now = dayjs().tz(timezone).format('YYYY_MM_DD_HH_mm');
    const fileName = `export_${now}.xlsx`;

    /* set response header */
    response.setHeader('Content-Type', 'application/vnd.ms-excel');
    response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    /* create workbook */
    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet();

    /* set columns */
    const columns = getExcelColumns(template);
    workSheet.columns = columns;
    setHeaderStyle(workSheet, columns.length);

    /* set cell data */
    const excelData = convertRawDataToExcelData(rawData, columns, timezone);
    excelData.forEach((row) => {
        workSheet.addRow(row);
    });

    let outBuffer = null;
    await workBook.xlsx.writeBuffer().then((buffer) => {
        outBuffer = buffer;
    });
    return outBuffer;
};

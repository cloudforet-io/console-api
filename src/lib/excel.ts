//@ts-nocheck
import { get, range, find, uniqBy } from 'lodash';
import httpContext from 'express-http-context';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ExcelJS from 'exceljs';

import redisClient from '@lib/redis';
import serviceClient from '@lib/service-client';
import { getResources } from '@controllers/add-ons/autocomplete/resource';
import { getValueByPath } from '@lib/utils';

dayjs.extend(utc);
dayjs.extend(timezone);

const FIELD_TYPE = {
    datetime: 'datetime',
    enum: 'enum'
};

/* Raw Data */
const getRawData = async (requestBody) => {
    const sourceURL = get(requestBody,'source.url');
    const sourceParam = get(requestBody,'source.param');

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
    const columnFields = template.fields;
    const columns = [];

    columnFields.forEach((field) => {
        const column = {
            header: field.name,
            key: field.key,
            height: 24,
            style: {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'right'
                }
            }
        };
        columns.push(column);
    });

    return columns;
};
const setColumnStyle = (worksheet, headerRowNumber) => {
    const minWidth = 10;
    worksheet.columns.forEach((column) => {
        let maxColumnLength = 0;
        column.eachCell({ includeEmpty: true }, (cell, cellNumber) => {
            if (cellNumber > headerRowNumber) {
                maxColumnLength = Math.max(
                    maxColumnLength,
                    minWidth,
                    cell.value ? cell.value.toString().length : 0
                );
            }
        });
        column.width = maxColumnLength + 2;
    });
};
const setRowStyle = (worksheet, headerRowNumber) => {
    worksheet.eachRow((row, rowNumber) => {
        row.border = {
            top: { style: 'thin', color: {argb: 'E5E5E8'} },
            left: { style: 'thin', color: {argb: 'E5E5E8'} },
            bottom: { style: 'thin', color: {argb: 'E5E5E8'} },
            right: { style: 'thin', color: {argb: 'E5E5E8'} }
        };
        if (rowNumber > headerRowNumber && rowNumber % 2 === 0) {
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F7F7F7' }
            };
        }
    });
};

/* Rows */
const getReferenceResources = async (template) => {
    const referenceResource = {};
    const columnFields = template.fields;
    for (const field of columnFields) {
        const reference = field.reference;
        if (reference) {
            const referenceType = reference.resource_type;
            if (!get(referenceResource, referenceType)) {
                const res = await getResources(reference);
                referenceResource[referenceType] = res.results;
            }
        }
    }
    return referenceResource;
};
const convertRawDataToExcelData = (rawData, columns, template, referenceResources) => {
    const columnFields = template.fields;
    const timezone = template.options.timezone;
    const results = [];

    rawData.forEach((data) => {
        const rowData = {};
        columnFields.forEach((field) => {
            const key = field.key;
            const type = field.type;
            const reference = field.reference;
            let cellData = getValueByPath(data, key);

            /* convert to reference name */
            if (reference) {
                const referenceResource = referenceResources[reference.resource_type];
                let convertedData;
                if (Array.isArray(cellData)) {
                    convertedData = [];
                    cellData.forEach((d) => {
                        const selectedData = find(referenceResource, { key: d });
                        if (selectedData) convertedData.push(selectedData.name);
                        else convertedData.push(d);
                    });
                } else {
                    convertedData = find(referenceResource, { key: cellData });
                    if (convertedData) convertedData = convertedData.name;
                    else convertedData = cellData;
                }
                cellData = convertedData;
            }

            /* format data */
            if (type === FIELD_TYPE.datetime) {
                if (cellData) {
                    cellData = dayjs.tz(dayjs(cellData), timezone).format('YYYY-MM-DD HH:mm:ss');
                }
            } else if (type === FIELD_TYPE.enum) {
                const enumItems = field.enum_items;
                if (enumItems) cellData = enumItems[cellData];
            } else if (Array.isArray(cellData)) {
                cellData = uniqBy(cellData);
                let cellDataWithLineBreak = '';
                cellData.forEach((d, index) => {
                    if (index > 0) cellDataWithLineBreak += '\n';
                    cellDataWithLineBreak += JSON.parse(JSON.stringify(d));
                });
                cellData = cellDataWithLineBreak;
            }
            rowData[key] = cellData;
        });
        results.push(rowData);
    });
    return results;
};

/* Header */
const setHeaderMessageStyle = (worksheet) => {
    const cellId = 'A1';
    worksheet.getRow(1).height = 48;
    worksheet.getCell(cellId).font = {
        bold: true,
        size: 22,
        color: { argb: '003566' }
    };
    worksheet.getCell(cellId).alignment = {
        vertical: 'bottom',
        horizontal: 'left'
    };
};
const convertNumToLetter = (num) => {
    let letters = '';
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
        num = Math.floor(num / 26) - 1;
    }
    return letters;
};
const setHeaderStyle = (worksheet, headerRowNumber, columnLength) => {
    const headerLetters = range(columnLength).map((i) => `${convertNumToLetter(i)}${headerRowNumber}`); // [ 'A1', 'B1', 'C1', 'D1', 'E1', 'F1' ]
    worksheet.getRow(headerRowNumber).height = 32;
    headerLetters.forEach((letter) => {
        worksheet.getCell(letter).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb: '003566' }
        };
        worksheet.getCell(letter).font = {
            bold: true,
            size: 12,
            color: { argb: 'FFFFFF' }
        };
        worksheet.getCell(letter).alignment = {
            vertical: 'middle',
            horizontal: 'right'
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

const createWorksheet = async (workbook, requestBody) => {
    const rawData = await getRawData(requestBody);
    const template = get(requestBody,'template');
    const sheetName = get(template, 'options.sheet_name');
    const headerMessage = get(template, 'options.header_message');

    const worksheet = workbook.addWorksheet(sheetName);

    /* set header */
    const columns = getExcelColumns(template);
    worksheet.columns = columns;
    if (headerMessage) {
        worksheet.spliceRows(1, 0, []);
        worksheet.getRow(2).values = template.fields.map(d => d.name);
    }
    const headerRowNumber = headerMessage ? 2 : 1;
    setHeaderStyle(worksheet, headerRowNumber, columns.length);

    /* set header message */
    if (headerMessage) {
        worksheet.getCell('A1').value = headerMessage.title;
        setHeaderMessageStyle(worksheet);
    }

    /* set cell data */
    const referenceResources = await getReferenceResources(template);
    const excelData = convertRawDataToExcelData(rawData, columns, template, referenceResources);
    excelData.forEach((row) => {
        worksheet.addRow(row);
    });
    setRowStyle(worksheet, headerRowNumber);
    setColumnStyle(worksheet, headerRowNumber);
};
export const createExcel = async (redisParam, response) => {
    const reqBody = get(redisParam,'req_body');
    let timezone;
    let fileNamePrefix = '';

    /* create workbook */
    const workbook = new ExcelJS.Workbook();

    if (Array.isArray(reqBody)) {
        for (const requestBody of reqBody) {
            await createWorksheet(workbook, requestBody);
        }
        timezone = get(reqBody[0], 'template.options.timezone');
        fileNamePrefix = get(reqBody[0], 'template.options.file_name_prefix');
    } else {
        await createWorksheet(workbook, reqBody);
        timezone = get(reqBody, 'template.options.timezone');
        fileNamePrefix = get(reqBody, 'template.options.file_name_prefix');
    }

    const now = dayjs().tz(timezone).format('YYYY_MM');
    const fileName = `export_${now}.xlsx`;

    /* set response header */
    response.setHeader('Content-Type', 'application/vnd.ms-excel');
    response.setHeader('Content-Disposition', `attachment; filename=${fileNamePrefix}_${fileName}`);

    let outBuffer = null;
    await workbook.xlsx.writeBuffer().then((buffer) => {
        outBuffer = buffer;
    });
    return outBuffer;
};

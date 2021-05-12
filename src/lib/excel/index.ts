import { find, get, range, uniqBy } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ExcelJS from 'exceljs';

import logger from '@lib/logger';
import serviceClient from '@lib/service-client';
import { getResources } from '@controllers/add-ons/autocomplete/resource';
import { getValueByPath } from '@lib/utils';
import { ExcelData, FIELD_TYPE, Reference, ReferenceResourceMap, Template, TemplateField } from '@lib/excel/type';

dayjs.extend(utc);
dayjs.extend(timezone);

/* Style */
const setRowStyle = (worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    const headerRowNumber = headerMessage ? 2 : 1;

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
const setColumnStyle = (worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    const headerRowNumber = headerMessage ? 2 : 1;
    const minWidth = 10;

    worksheet.columns.forEach((column) => {
        let maxColumnLength = 0;
        column.eachCell({ includeEmpty: true }, (cell, cellNumber) => {
            if (cellNumber >= headerRowNumber) {
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
const setHeaderMessageStyle = (worksheet) => {
    const cellId = 'A1';
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
const setHeaderStyle = (worksheet, headerRowNumber, columnLength) => {
    const convertNumToLetter = (num) => {
        let letters = '';
        while (num >= 0) {
            letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
            num = Math.floor(num / 26) - 1;
        }
        return letters;
    };

    const headerLetters = range(columnLength).map((i) => `${convertNumToLetter(i)}${headerRowNumber}`); // [ 'A1', 'B1', 'C1', 'D1', 'E1', 'F1' ]
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
            horizontal: 'left'
        };
    });
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
    const client = await serviceClient.get(routeName);
    try {
        const res = await client.post(sourceURL, sourceParam);
        data = get(res, 'data.results', []);
    } catch(e) {
        logger.error(`CREATE EXCEL - data retrieval failed. ${e}`);
        throw e;
    }

    return data;
};

/* Headers */
const setExcelHeaderMessage = (worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    if (headerMessage) {
        worksheet.spliceRows(1, 0, []);
        worksheet.getCell('A1').value = headerMessage.title;
        setHeaderMessageStyle(worksheet);
    }
};
const setExcelHeader = (worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    const headerLength = get(template, 'fields')?.length;
    const headerRowNumber = headerMessage ? 2 : 1;

    if (headerMessage) {
        worksheet.getRow(2).values = template.fields.map(d => d.name);
    }
    setHeaderStyle(worksheet, headerRowNumber, headerLength);
};

/* Column Data */
const setExcelColumnData = async (worksheet, template: Template) => {
    const columnFields = template.fields;
    worksheet.columns = columnFields.map((field) => ({
        header: field.name,
        key: field.key,
        height: 24,
        style: {
            font: {
                size: 12
            },
            alignment: {
                vertical: 'top',
                horizontal: 'left'
            }
        }
    }));
};

/* Cell Data */
const getReferenceResourceMap = (template: Template): ReferenceResourceMap => {
    const referenceResourceMap = {};
    const columnFields: Array<TemplateField> = template.fields;
    try {
        (async () => {
            for (const field of columnFields) {
                const reference = field.reference;
                if (reference) {
                    const referenceType = reference.resource_type;
                    if (!get(referenceResourceMap, referenceType)) {  // prevent redundancy
                        const res = await getResources(reference);
                        referenceResourceMap[referenceType] = res.results;
                    }
                }
            }
        })();
    } catch (e) {
        logger.error(`CREATE EXCEL - getting reference resources failed. ${e}`);
        throw e;
    }
    return referenceResourceMap;
};
const convertReferenceToReferenceResource = (referenceResourceMap: ReferenceResourceMap, reference: Reference, cellData) => {
    const referenceResource = referenceResourceMap[reference.resource_type];
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
    return convertedData;
};
const formatData = (cellData, field: TemplateField, timezone): string => {
    const type = field.type;

    if (cellData === null || cellData === undefined || Number.isNaN(cellData)) return '';

    let results = cellData;

    try {
        if (type === FIELD_TYPE.datetime) {
            if (cellData) {
                results = dayjs.tz(dayjs(cellData), timezone).format('YYYY-MM-DD HH:mm:ss');
            }
        }

        else if (type === FIELD_TYPE.enum) {
            const enumItems = field.enum_items;
            if (enumItems) results = enumItems[cellData];
        }

        else if (Array.isArray(cellData)) {
            results = '';
            cellData = uniqBy(cellData);
            cellData.filter(d => d !== null && d !== undefined && !Number.isNaN(d))
                .forEach((d, index) => {
                    if (index > 0) results += '\n';
                    results += JSON.parse(JSON.stringify(d));
                });
        }
    } catch (e) {
        logger.error(`FORMAT DATA ERROR: ${e}`);
        throw e;
    }

    return results;
};
const convertRawDataToExcelData = (rawData, template: Template): Array<ExcelData> => {
    const columnFields = template.fields;
    const timezone = template.options.timezone;
    const referenceResourceMap = getReferenceResourceMap(template);
    const results: Array<ExcelData> = [];

    rawData.forEach((data) => {
        const rowData = {};
        columnFields.forEach((field) => {
            const key = field.key;
            const reference = field.reference;
            let cellData = getValueByPath(data, key);

            if (reference) {
                cellData = convertReferenceToReferenceResource(referenceResourceMap, reference, cellData);
            }

            rowData[key] = formatData(cellData, field, timezone);
        });
        results.push(rowData);
    });
    return results;
};
const setExcelCellData = async (worksheet, template: Template, requestBody) => {
    const rawData = await getRawData(requestBody);
    const excelData = convertRawDataToExcelData(rawData, template);
    excelData.forEach((row) => {
        worksheet.addRow(row);
    });
};

/* Worksheet */
const createWorksheet = async (workbook, requestBody) => {
    const template: Template = get(requestBody,'template');
    const sheetName = get(template, 'options.sheet_name');
    const worksheet = workbook.addWorksheet(sheetName);

    try {
        await setExcelColumnData(worksheet, template);
        setExcelHeaderMessage(worksheet, template);
        setExcelHeader(worksheet, template);
    } catch (e) {
        logger.error(`CREATE WORKSHEET - SET EXCEL COLUMN DATA ERROR: ${e}`);
        throw e;
    }

    try {
        await setExcelCellData(worksheet, template, requestBody);
        setRowStyle(worksheet, template);
        setColumnStyle(worksheet, template);
    } catch (e) {
        logger.error(`CREATE WORKSHEET - SET EXCEL CELL DATA ERROR: ${e}`);
        throw e;
    }
};
const getOutBuffer = async (workbook) => {
    try {
        return await workbook.xlsx.writeBuffer();
    } catch (e) {
        logger.error(`CREATE EXCEL - BUFFER WRITE ERROR: ${e}`);
        throw e;
    }
};
const getFileName = (reqBody) => {
    try {
        let timezone;
        let prefix;
        if (Array.isArray(reqBody)) {
            timezone = get(reqBody[0], 'template.options.timezone');
            prefix = get(reqBody[0], 'template.options.file_name_prefix');
        } else {
            timezone = get(reqBody, 'template.options.timezone');
            prefix = get(reqBody, 'template.options.file_name_prefix');
        }
        const now = dayjs().tz(timezone).format('YYYYMMDD');
        const fileName = `export_${now}.xlsx`;
        return `${prefix}_${fileName}`;
    } catch (e) {
        logger.error(`CREATE EXCEL - FILE NAME ERROR: ${e}`);
        throw e;
    }
};

export const createExcel = async (redisParam, response) => {
    const reqBody = get(redisParam,'req_body');

    const workbook = new ExcelJS.Workbook();
    if (Array.isArray(reqBody)) {
        await Promise.all(reqBody.map((eachReqBody) => createWorksheet(workbook, eachReqBody)));
    } else {
        await createWorksheet(workbook, reqBody);
    }

    response.setHeader('Content-Type', 'application/vnd.ms-excel');
    response.setHeader('Content-Disposition', `attachment; filename=${getFileName(reqBody)}`);

    return await getOutBuffer(workbook);
};

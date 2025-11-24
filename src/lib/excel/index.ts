import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import ExcelJS, { Buffer, Column, Workbook, Worksheet } from 'exceljs';
import { Response } from 'express';
import { find, get, range, uniqBy } from 'lodash';

import { getResources } from '@controllers/add-ons/autocomplete/resource';
import { currencyMoneyFormatter } from '@lib/excel/currency';
import { ExcelData, ExcelOptions, FIELD_TYPE, HeaderMessage, Reference, Source, SourceParam, TemplateField, TemplateOptions } from '@lib/excel/type';
import serviceClient from '@lib/service-client';
import serviceClientV2 from '@lib/service-client-v2';
import { getValueByPath } from '@lib/utils';

dayjs.extend(utc);
dayjs.extend(timezone);

/* Style */
const setRowStyle = (worksheet, headerMessage?: HeaderMessage) => {
    const headerRowNumber = headerMessage?.title ? 2 : 1;

    worksheet.eachRow((row, rowNumber) => {
        row.border = {
            top: { style: 'thin', color: { argb: 'E5E5E8' } },
            left: { style: 'thin', color: { argb: 'E5E5E8' } },
            bottom: { style: 'thin', color: { argb: 'E5E5E8' } },
            right: { style: 'thin', color: { argb: 'E5E5E8' } }
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
const setColumnStyle = (worksheet, headerMessage?: HeaderMessage) => {
    const headerRowNumber = headerMessage?.title ? 2 : 1;
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
const setHeaderStyle = (worksheet: Worksheet, headerRowNumber: number, columnLength: number) => {
    const convertNumToLetter = (num: number) => {
        let letters = '';
        while (num >= 0) {
            letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
            num = Math.floor(num / 26) - 1;
        }
        return letters;
    };
    range(columnLength).forEach((i) => {
        const letter = `${convertNumToLetter(i)}${headerRowNumber}`;
        worksheet.getCell(letter).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '003566' }
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
const getRawData = async (url: string, param: SourceParam, version = 'v1') => {
    delete param.query.page; // delete page limit option

    let data = [];
    const routeName = url.substr(0, url.indexOf('/'));
    let client;
    if (version === 'v2') {
        client = serviceClientV2.get(routeName);
    } else {
        client = serviceClient.get(routeName);
    }

    const res = await client.post(url, param);
    data = get(res, 'data.results', []);
    return data;
};

/* Headers */
const getExcelColumns = (fields: TemplateField[]): Partial<Column>[] => {
    return fields.map<Partial<Column>>((field) => ({
        header: field.name,
        key: field.key,
        height: 24,
        style: {
            font: {
                size: 12
            },
            alignment: {
                vertical: 'top',
                horizontal: 'left',
                wrapText: true
            }
        }
    }));
};
const setExcelHeaderMessage = (worksheet: Worksheet, title: string) => {
    worksheet.spliceRows(1, 0, []);
    worksheet.getCell('A1').value = title;
    setHeaderMessageStyle(worksheet);
};
const setExcelHeader = (worksheet: Worksheet, columns: Partial<Column>[], headerMessage?: HeaderMessage) => {
    const title = headerMessage?.title;
    const headerRowNumber = title ? 2 : 1;
    worksheet.columns = columns;
    if (title) {
        setExcelHeaderMessage(worksheet, title);
        worksheet.getRow(headerRowNumber).values = columns.map(d => d.header as string);
    // worksheet.getRow(headerRowNumber).values = template.fields.map(d => d.name);
    }
    setHeaderStyle(worksheet, headerRowNumber, columns.length);
};


interface ReferenceResourceMap {
  [key: string]: {
    key: string;
    name: string;
  }
}

/* Cell Data */
const getReferenceResourceMap = async (fields: TemplateField[]): Promise<ReferenceResourceMap> => {
    const referenceResourceMap = {};
    const references = fields.filter(field =>
        (field.reference && !get(referenceResourceMap, field.reference.resource_type)))
        .map(field => field.reference) as Array<Reference>;

    const promiseResults = await Promise.allSettled(references.map(reference => getResources(reference)));

    promiseResults.map((res, idx) => {
        if (res.status === 'fulfilled') {
            const reference = references[idx];
            referenceResourceMap[reference.resource_type] = res.value.results;
        }
    });
    return referenceResourceMap;

};
const convertReferenceToReferenceResource = (referenceResourceMap: ReferenceResourceMap, reference: Reference, cellData) => {
    const referenceResource = referenceResourceMap[reference.resource_type];
    let convertedData;
    if (Array.isArray(cellData)) {
        convertedData = [];
        cellData.forEach((d) => {
      // @ts-ignore
            const selectedData: any = find(referenceResource, { key: d });
            if (selectedData) convertedData.push(selectedData.name);
            else convertedData.push(d);
        });
    } else {
    // @ts-ignore
        convertedData = find(referenceResource, { key: cellData });
        if (convertedData) convertedData = convertedData.name;
        else convertedData = cellData;
    }
    return convertedData;

};
const formatData = (cellData, field: TemplateField, timezone: string): string => {
    const type = field.type;

    if (cellData === null || cellData === undefined || Number.isNaN(cellData)) return '';

    let results = cellData;

    if (type === FIELD_TYPE.datetime) {
        if (cellData) {
            results = dayjs.tz(dayjs(cellData), timezone).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    else if (type === FIELD_TYPE.currency) {
        const currency = field.options?.currency as any;
        const currencyRates = field.options?.currencyRates;
        results = currencyMoneyFormatter(cellData, currency, currencyRates);
    }

    else if (type === FIELD_TYPE.enum) {
        const enumItems = field.enum_items;
        if (enumItems) results = enumItems[cellData];
    }

    else if (Array.isArray(cellData)) {
        results = '';
    // @ts-ignore
        cellData = uniqBy(cellData);
        cellData.filter(d => d !== null && d !== undefined && !Number.isNaN(d))
            .forEach((d, index) => {
                if (index > 0) results += '\n';
                results += JSON.parse(JSON.stringify(d));
            });
    }
    return results;
};
const convertRawDataToExcelData = async (rawData, fields: TemplateField[], timezone: string): Promise<Array<ExcelData>> => {
    const referenceResourceMap = await getReferenceResourceMap(fields);
    const results: Array<ExcelData> = [];

    rawData.forEach((data) => {
        const rowData = {};
        fields.forEach((field) => {
            const key = field.key;
            const reference = field.reference;
            const keyDepth = field?.options?.key_depth;
            let cellData = getValueByPath(data, key, keyDepth);

            if (reference) {
                cellData = convertReferenceToReferenceResource(referenceResourceMap, reference, cellData);
            }

            rowData[key] = formatData(cellData, field, timezone);
        });
        results.push(rowData);
    });
    return results;
};
const setExcelCellRows = async (worksheet: Worksheet, source: Source, fields: TemplateField[], options: TemplateOptions, version = 'v1'): Promise<void> => {
    const { url, param, data } = source;
    if (!data && !(url && param)) {
        throw new Error('Invalid Excel Options. (source = must have data key, or both url and param keys.)');
    }
    let rawData;
    if (data) {
        rawData = data;
    } else {
        rawData = await getRawData(url as string, param as SourceParam, version);
    }
    const excelData = await convertRawDataToExcelData(rawData, fields, options.timezone);
    worksheet.addRows(excelData);
};
const setDataValidation = (worksheet: Worksheet, fields: TemplateField[]) => {
    fields.forEach(({ type, enum_items }, fieldIdx) => {
        if (type === 'enum' && enum_items) {
            const columns = worksheet.columns[fieldIdx];
            if (columns?.eachCell) {
                columns.eachCell(cell => {
                    cell.dataValidation = {
                        type: 'list',
                        allowBlank: true,
                        formulae: [`"${Object.values(enum_items).join(',')}"`]
                    };
                });
            }
        }
    });
};

/* Worksheet */
const createWorksheet = async (workbook: Workbook, excelOptions: ExcelOptions) => {
    if (typeof excelOptions !== 'object') {
        throw new Error('Invalid Excel Options. (must be object type)');
    }
    const template = excelOptions.template;
    if (!template || typeof template !== 'object') {
        throw new Error('Invalid Excel Options. (template = required in object type)');
    }
    const fields = template.fields;
    if (!template.fields || !Array.isArray(template.fields)) {
        throw new Error('Invalid Excel Options. (template.fields = required in list of object type)');
    }
    const options = template.options ?? {};
    const headerMessage = options.header_message;
    if (headerMessage && typeof headerMessage !== 'object') {
        throw new Error('Invalid Excel Options. (template.options.header_message = must be object type)');
    }
    const source = excelOptions.source;
    const sheetName = options.sheet_name;
    const version = excelOptions.version ?? 'v1';

  // worksheet creation
    const worksheet: Worksheet = workbook.addWorksheet(sheetName);

    const columns = getExcelColumns(fields);
    setExcelHeader(worksheet, columns, headerMessage);
    if (source) {
        await setExcelCellRows(worksheet, source, fields, options, version);
        setDataValidation(worksheet, fields);

    }
    setRowStyle(worksheet, headerMessage);
    setColumnStyle(worksheet, headerMessage);
};
const getOutBuffer = async (workbook: Workbook): Promise<Buffer> => {
    return await workbook.xlsx.writeBuffer();
};
const getFileName = (excelOptions: ExcelOptions | ExcelOptions[]) => {
    let timezone;
    let prefix;
    if (Array.isArray(excelOptions)) {
        timezone = get(excelOptions[0], 'template.options.timezone');
        prefix = get(excelOptions[0], 'template.options.file_name_prefix');
    } else {
        timezone = get(excelOptions, 'template.options.timezone');
        prefix = get(excelOptions, 'template.options.file_name_prefix');
    }
    const now = dayjs().tz(timezone).format('YYYYMMDD');
    const fileName = `export_${now}.xlsx`;
    return `${prefix}_${fileName}`;
};

export const createExcel = async (response: Response, excelOptions: ExcelOptions | ExcelOptions[]): Promise<Buffer> => {
    const workbook: Workbook = new ExcelJS.Workbook();
    if (Array.isArray(excelOptions)) {
        await Promise.all(excelOptions.map((eachOpt) => createWorksheet(workbook, eachOpt)));
    } else {
        await createWorksheet(workbook, excelOptions);
    }

    response.setHeader('Content-Type', 'application/vnd.ms-excel');
    response.setHeader('Content-Disposition', `attachment; filename=${getFileName(excelOptions)}`);

    return await getOutBuffer(workbook);
};

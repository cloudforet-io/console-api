import { find, get, range, uniqBy } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Response } from 'express';
import ExcelJS, { Buffer, Column, Workbook, Worksheet } from 'exceljs';

import serviceClient from '@lib/service-client';
import { getResources } from '@controllers/add-ons/autocomplete/resource';
import { getValueByPath } from '@lib/utils';
import { currencyMoneyFormatter } from '@lib/excel/currency';
import { ExcelData, ExcelOptions, FIELD_TYPE, Reference, Source, SourceParam, Template, TemplateField } from '@lib/excel/type';

dayjs.extend(utc);
dayjs.extend(timezone);

/* Style */
const setRowStyle = (worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    const headerRowNumber = headerMessage ? 2 : 1;

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
const setHeaderStyle = (worksheet: Worksheet, headerRowNumber, columnLength) => {
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
const getRawData = async (url: string, param: SourceParam) => {
    delete param.query.page; // delete page limit option

    let data = [];
    const routeName = url.substr(0, url.indexOf('/'));
    const client = serviceClient.get(routeName);

    const res = await client.post(url, param);
    data = get(res, 'data.results', []);
    return data;
};

/* Headers */
const setExcelHeaderMessage = (worksheet: Worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    if (headerMessage) {
        worksheet.spliceRows(1, 0, []);
        worksheet.getCell('A1').value = headerMessage.title;
        setHeaderMessageStyle(worksheet);
    }
};
const setExcelHeader = (worksheet: Worksheet, template: Template) => {
    const headerMessage = get(template, 'options.header_message');
    const headerLength = get(template, 'fields')?.length;
    const headerRowNumber = headerMessage ? 2 : 1;

    if (headerMessage) {
        worksheet.getRow(2).values = template.fields.map(d => d.name);
    }
    setHeaderStyle(worksheet, headerRowNumber, headerLength);
};

/* Column Data */
const setExcelColumnData = async (worksheet: Worksheet, template: Template) => {
    const columnFields = template.fields;
    worksheet.columns = columnFields.map<Partial<Column>>((field) => ({
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

interface ReferenceResourceMap {
    [key: string]: {
        key: string;
        name: string;
    }
}

/* Cell Data */
const getReferenceResourceMap = async (template: Template): Promise<ReferenceResourceMap> => {
    const referenceResourceMap = {};
    const columnFields: Array<TemplateField> = template.fields;
    const references = columnFields.filter(field =>
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
        const currency = field.options?.currency;
        const currencyRates = field.options?.currencyRates;
        results = currencyMoneyFormatter(cellData, currency, currencyRates, true);
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
const convertRawDataToExcelData = async (rawData, template: Template): Promise<Array<ExcelData>> => {
    const columnFields = template.fields;
    const timezone = template.options.timezone;
    const referenceResourceMap = await getReferenceResourceMap(template);
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
const setExcelCellData = async (worksheet, template: Template, source: Source) => {
    const { url, param, data } = source;
    if (!data && !(url && param)) {
        throw new Error('Invalid parameter. (source = must have data key, or both url and param keys.)');
    }
    let rawData;
    if (data) {
        rawData = data;
    } else {
        rawData = await getRawData(url as string, param as SourceParam);
    }
    const excelData = await convertRawDataToExcelData(rawData, template);
    excelData.forEach((row) => {
        worksheet.addRow(row);
    });
};

/* Worksheet */
const createWorksheet = async (workbook: Workbook, excelOptions: ExcelOptions) => {
    const source = get(excelOptions,'source');
    const template = get(excelOptions,'template');
    const sheetName: string|undefined = get(template, 'options.sheet_name');
    const worksheet: Worksheet = workbook.addWorksheet(sheetName);

    await setExcelColumnData(worksheet, template);
    setExcelHeaderMessage(worksheet, template);
    setExcelHeader(worksheet, template);
    if (source) {
        await setExcelCellData(worksheet, template, source);
    }
    setRowStyle(worksheet, template);
    setColumnStyle(worksheet, template);
};
const getOutBuffer = async (workbook: Workbook): Promise<Buffer> => {
    return await workbook.xlsx.writeBuffer();
};
const getFileName = (excelOptions: ExcelOptions|ExcelOptions[]) => {
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

export const createExcel = async (response: Response, excelOptions: ExcelOptions|ExcelOptions[]): Promise<Buffer> => {
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

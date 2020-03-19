import file from '@lib/file';
import { setExcelResponseHeader, getHeaderRows, excelStyler, getExcelOption, setRows, setColumns} from '@/add-ons/excel/lib/excel';
import ExcelJS from 'exceljs';
import _ from 'lodash';

const exportExcel = async (request) => {
    const redisKey = file.generateRandomKey();
    file.setFileParamsOnRedis(redisKey, request.body, request.originalUrl);
    const excelLink = file.getFileRequestURL(request, redisKey);
    return excelLink;
};

const getExcelData = async (serviceClient, redis_param) => {
    const sourceURL = _.get(redis_param,'source.url', null);
    const sourceParam = _.get(redis_param,'source.param', null);
    const template = _.get(redis_param,'template', null);

    if(!sourceURL|| !sourceParam || !template) {
        const errorMSG = 'Unsupported api type.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }
    const selectedClient = await serviceClient.get(sourceURL.substr(0,sourceURL.indexOf('/')));
    const selectedData = await selectedClient.post(sourceURL, sourceParam);
    const response = _.get(selectedData, 'data.results', null);

    if(response === null) {
        const errorMSG = 'Unsupported api.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }
    return {
        source_data: response,
        source_template: template
    };
};

const writeBuffer = async (workbook) => {
    let outBuffer = null;
    const buffer = await workbook.xlsx.writeBuffer().then(function(buffer) {
        outBuffer =  buffer;
    });
    return outBuffer;
};


const createExcel = async (sheetData, response) => {
    const template = _.get(sheetData,'source_template');
    const options = getExcelOption(template);
    const fileName = options.name;

    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet('statistics');
    setExcelResponseHeader(response, fileName);
    const columnData = setColumns(workSheet, sheetData.source_template.data_source);
    setRows(workSheet, sheetData.source_data, columnData);
    const headerLetters = getHeaderRows(columnData);
    excelStyler(workSheet, headerLetters);

    const buffer = await writeBuffer(workBook, response);
    return buffer;
};

export {
    exportExcel,
    getExcelData,
    createExcel
};

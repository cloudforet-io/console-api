import file from '@lib/file';
import { jsonExcelStandardize, getExcelOption } from '@/add-ons/excel/lib/excel';
import XLSX from 'xlsx';
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

const createExcel = async (sheetData, response) => {
    const template = _.get(sheetData,'source_template');
    const options = getExcelOption(template);
    const fileName = options.name;

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

    const excelTypeData = jsonExcelStandardize(sheetData.source_data, sheetData.source_template.data_source);

    const ws = XLSX.utils.json_to_sheet(excelTypeData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, fileName);
    const buffer = XLSX.write(wb, {type:'buffer', bookType: 'xlsx'});
    return buffer;
};

export {
    exportExcel,
    getExcelData,
    createExcel
};

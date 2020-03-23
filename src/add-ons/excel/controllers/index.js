import file from '@lib/file';
import { setExcelResponseHeader, getDynamicData, getHeaderRows, excelStyler, getExcelOption, setRows, setColumns} from '@/add-ons/excel/lib/excel';
import ExcelJS from 'exceljs';
import _ from 'lodash';

const exportExcel = async (request) => {
    const redisKey = file.generateRandomKey();
    file.setFileParamsOnRedis(redisKey, request.body, request.originalUrl);
    const excelLink = file.getFileRequestURL(request, redisKey);
    return excelLink;
};

const getExcelData = async (serviceClient, redis_param, subOptions) => {
    const sourceURL = _.get(redis_param,'source.url', null);
    const sourceParam = _.get(redis_param,'source.param', null);
    const template = _.get(redis_param,'template', null);

    if(!sourceURL|| !sourceParam || !template) {
        const errorMSG = 'Unsupported api type.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }

    const timeZoneData = subOptions;
    if(_.isPlainObject(timeZoneData)){
        const timeZoneReqBody = {
            client: 'identity',
            url: '/identity/user/get',
            body: {
                user_id: subOptions.user_id
            }
        };
        const userInfo = await getDynamicData(serviceClient, timeZoneReqBody);
        if(userInfo){
            const userTimezone = _.get(userInfo, 'data.timezone', 'UTC');
            template.options['timezone']= userTimezone;
        }
    }

    const selectedData = await getDynamicData(serviceClient, {
        client: sourceURL.substr(0,sourceURL.indexOf('/')),
        url: sourceURL,
        body: sourceParam
    });

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

const writeBuffer = async (workbook, options) => {
    let outBuffer = null;
    const buffer = options.file_type === 'xlsx' ? await workbook.xlsx.writeBuffer().then(function(buffer) {
        outBuffer =  buffer;
    }) : await workbook.csv.writeBuffer().then(function(buffer) {
        outBuffer =  buffer;
    });
    return outBuffer;
};


const createExcel = async (sheetData, response) => {
    const template = _.get(sheetData,'source_template');
    const options = getExcelOption(template);

    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet(options.sheet_name);
    setExcelResponseHeader(response, options.file_name);

    const columnObj = setColumns(workSheet, sheetData.source_template);
    const columnData = columnObj.columns;
    setRows(workSheet, sheetData.source_data, columnObj);
    const headerLetters = getHeaderRows(columnData);
    excelStyler(workSheet, headerLetters);
    const buffer = await writeBuffer(workBook, options);
    return buffer;
};

export {
    exportExcel,
    getExcelData,
    createExcel
};

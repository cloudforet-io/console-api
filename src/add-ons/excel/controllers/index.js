import file from '@lib/file';
import { setExcelResponseHeader, getDynamicData, getHeaderRows, excelStyler, getExcelOption, setRows, setColumns} from '@/add-ons/excel/lib/excel';
import ExcelJS from 'exceljs';
import _ from 'lodash';


const excelActionContextBuilder = (actionContexts) => {
    const callBack = _.get(actionContexts, 'callBack', null);
    const serviceClient = _.get(actionContexts, 'clients', null);
    const redisParameters = _.get(actionContexts, 'redisParam', null);
    const authInfo = _.get(actionContexts, 'authenticationInfo', null);
    const protocol = _.get(actionContexts, 'protocol', null);

    if(!callBack || !serviceClient || !redisParameters || !authInfo || !protocol){
        throw new Error('action Context has not been set');
    }

    return  {
        callBack,
        data:{
            func: getExcelData,
            param: [ serviceClient, redisParameters.req_body, subOptionBuilder({ redisParameters, authInfo })]
        },
        buffer:{
            func: createExcel,
            param:[ protocol.res ],
            additionalData:true
        }
    };
};

const exportExcel = async (request) => {
    const redisKey = file.generateRandomKey();
    if(!request.body.template.hasOwnProperty('options')){
        _.set(request.body.template, 'options', {});
    }
    file.setFileParamsOnRedis(redisKey, request.body, request.originalUrl);

    const excelLink = file.getFileRequestURL(request, redisKey);
    return excelLink;
};

const subOptionBuilder = (subOptionObject) => {

    const current_page = _.get(subOptionObject,'redisParameters.req_body.template.options.current_page', false);
    const optionInfo = _.get(subOptionObject,'redisParameters.art-template.options.timezone', null);
    const authInfo = _.get(subOptionObject,'authInfo', null);
    authInfo['current_page'] = current_page;

    const subOptions = optionInfo ? {
        current_page,
        user_type: authInfo.user_type,
        timezone: optionInfo
    } : authInfo;

    return subOptions;
};


const getExcelData = async (serviceClient, redis_param, subOptions) => {
    const sourceURL = _.get(redis_param,'source.url', null);
    const sourceParam = _.get(redis_param,'source.param', null);
    const template = _.get(redis_param,'template', null);

    if(!sourceURL|| !sourceParam || !template) {
        const errorMSG = 'Unsupported api type.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }

    if(!subOptions.hasOwnProperty('timezone')){
        const user_type = _.get(subOptions, 'user_type', 'USER');
        const timeZoneReqBody =  {
            client: 'identity',
            url: user_type === 'DOMAIN_OWNER' ? '/identity/domain-owner/get' : '/identity/user/get',
            body: {
                user_id: subOptions.user_id
            }
        };

        const userInfo = await getDynamicData(serviceClient, timeZoneReqBody);
        if(userInfo){
            let timezone = null;
            let userTimezone = _.get(userInfo, 'data.timezone', 'UTC');
            if(userTimezone.indexOf('+') > -1 || userTimezone.indexOf('-') > -1){
                timezone = 'UTC';
            }

            template.options['timezone']= timezone ? timezone : userTimezone;
        }
    }

    if (!_.get(subOptions, 'current_page') && !_.isEmpty(sourceParam.query)) {
        delete sourceParam.query.page;
    }

    let selectedData = [];

    try{

        selectedData = await getDynamicData(serviceClient, {
            client: sourceURL.substr(0, sourceURL.indexOf('/')),
            url: sourceURL,
            body: sourceParam
        });

    }catch(e){
        console.error('Excel data retrieval has failed due to', e.message);
    }

    const response = _.get(selectedData, 'data.results', []);

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
    excelActionContextBuilder,
    subOptionBuilder,
    exportExcel,
    getExcelData,
    createExcel
};

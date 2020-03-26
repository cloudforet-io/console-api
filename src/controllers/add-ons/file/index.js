import file from '@lib/file';
import { createExcel, getExcelData } from '@/add-ons/excel/controllers';
import serviceClient from '@lib/service-client';
import _ from 'lodash';

const download = async (protocal) => {
    let fileBuffer = null;
    const redisParameters = await file.getFileParamsFromRedis(_.get(protocal, 'req.query.key'));
    const authInfo = _.get(redisParameters, 'auth_info', null);

    if(!authInfo){
        throw new Error(`Invalid download key (key = ${_.get(protocal, 'req.query.key')})`);
    }

    file.setToken(redisParameters.auth_info);
    const call_back = _.get(redisParameters, 'call_back', null);

    if(call_back){
        const call_back_ = call_back.split('/').filter(func => ['','add-ons'].indexOf(func) == -1);
        const current_page = _.get(redisParameters.req_body,'template.options.current_page', false);
        const optionInfo = _.get(redisParameters.req_body,'template.options.timezone', null);
        authInfo['current_page'] = current_page;
        const subOptions = optionInfo ? {
            current_page,
            timezone: optionInfo
        } : authInfo;
        
        const fileData = await getExcelData(serviceClient, redisParameters.req_body, subOptions);
        fileBuffer = await createExcel(fileData, protocal.res);
    }

    return fileBuffer;
};

const upload = async (params) => {
    /*
    * Will be added for if other request comes in
    *
    */
    return {};
};

export {
    download,
    upload
};

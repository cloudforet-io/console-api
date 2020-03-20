import file from '@lib/file';
import { createExcel, getExcelData } from '@/add-ons/excel/controllers';
import serviceClient from '@lib/service-client';
import _ from 'lodash';

const download = async (protocal) => {
    const redisParameters = await file.getFileParamsFromRedis(_.get(protocal, 'req.query.key'));
    const authInfo = _.get(redisParameters, 'auth_info', null);
    if(!authInfo){
        throw new Error(`Invalid download key (key = ${_.get(protocal, 'req.query.key')})`);
    }
    file.setToken(redisParameters.auth_info);

    const optionInfo = _.get(redisParameters.req_body,'template.options.timezone', null);
    const subOptions = (optionInfo) ? optionInfo : authInfo;
    const fileData = await getExcelData(serviceClient, redisParameters.req_body, subOptions);

    const fileBuffer = await createExcel(fileData, protocal.res);
    return fileBuffer;
};

const upload = async (params) => {
    /*
    * Will be added for if other request comes in
    * */
    return {};
};

export {
    download,
    upload
};

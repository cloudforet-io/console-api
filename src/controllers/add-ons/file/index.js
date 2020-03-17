import file from '@lib/file';
import { createExcel, getExcelData } from '@/add-ons/excel/controllers';
import serviceClient from '@lib/service-client';
import _ from 'lodash';

const download = async (protocal) => {
    const redisParameters = await file.getFileParamsFromRedis(_.get(protocal, 'req.query.key'));
    file.setToken(redisParameters.auth_info);
    const fileData = await getExcelData(serviceClient, redisParameters.req_body);
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

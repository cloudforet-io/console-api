import file from '@lib/file';
import serviceClient from '@lib/service-client';
import _ from 'lodash';

const download = async (protocol) => {
    let fileBuffer = null;
    let actionContext = null;
    let bufferFromCallBack = null;
    const redisParameters = await file.getFileParamsFromRedis(_.get(protocol, 'req.query.key'));
    const authInfo = _.get(redisParameters, 'auth_info', null);

    if(!authInfo){
        throw new Error(`Invalid download key (key = ${_.get(protocol, 'req.query.key')})`);
    }

    file.setToken(authInfo);
    const callBack = file.getActionFlag(redisParameters);
    if(callBack) {
        const selectedController = await file.dynamicImportModuleHandler(callBack);
        if(!_.isEmpty(selectedController)){
            actionContext = file.actionContextBuilder(callBack, serviceClient, redisParameters, authInfo, protocol);
            bufferFromCallBack = selectedController[file.getActionKey(callBack)](actionContext);
        }
        fileBuffer = bufferFromCallBack === null ? bufferFromCallBack : await file.callBackHandler(bufferFromCallBack);
        console.log('buffers: ', fileBuffer);
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

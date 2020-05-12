import redisClient from '@lib/redis';
import uuidv4 from 'uuid/v4';
import httpContext from 'express-http-context';
import _ from 'lodash';
import path from 'path';

class File {

    async dynamicImportModuleHandler(callBack){
        let importedDependency = null;
        const srcPath = path.dirname(__dirname);
        const controllerPath = path.join(srcPath, `/add-ons/${callBack.report_type}/controllers/`, 'index.js');
        await Promise.all([
            import(controllerPath),
        ]).then(([ImportExt]) => {
            importedDependency = ImportExt;
        });
        return importedDependency;
    };

    actionContextBuilder(callBack, serviceClient, redisParameters, authInfo, protocol){
        return {
            callBack,
            clients: serviceClient,
            redisParam: redisParameters,
            authenticationInfo: authInfo,
            protocol
        };
    }

    setFileParamsOnRedis(key, body, callBack) {
        const param = {
            req_body: body,
            call_back: callBack,
            auth_info: {
                token: httpContext.get('token'),
                user_id: httpContext.get('user_id'),
                domain_id: httpContext.get('domain_id'),
                user_type: httpContext.get('user_type')
            }
        };
        redisClient.set(key,JSON.stringify(param), 600);
    }

    async getFileParamsFromRedis (key) {
        const client = await redisClient.connect();
        const source_params = await client.get(key);
        return JSON.parse(source_params);
    }

    getActionFlag(RedisParameter) {
        const call_back = _.get(RedisParameter, 'call_back', null);
        if(call_back){
            const call_back_ = call_back.split('/').filter(func => ['','add-ons'].indexOf(func) == -1);
            return {
                report_type: call_back_[0],
                action_type: call_back_[1]
            };
        }else {
            return null;
        }
    }

    getActionKey(callBack){
        return `${callBack.report_type}ActionContextBuilder`;
    }

    async callBackHandler(callBackHandlerPram) {
        let exportBuffer = null;
        const callBack = _.get(callBackHandlerPram, 'callBack', null);
        const data = _.get(callBackHandlerPram, 'data', null);
        const buffer = _.get(callBackHandlerPram, 'buffer', null);

        if(!callBack || !data || !buffer){
            throw new Error('call back action is not available.');
        } else {
            if(callBack.action_type === 'export'){

                let retrievedData = null;
                try{
                    retrievedData = await data['func'].apply(null, data.param);
                } catch(e){
                    console.error('Data retrieval has failed due to', e.message);
                }

                exportBuffer = buffer.additionalData ? await buffer['func'].apply(null, this.dynamicArgsGenerator([retrievedData],buffer.param)) :
                    await buffer['func'].apply(null, buffer.param);

            } else if (callBack.action_type === 'import') {
                /* import Handler will be located on here */
            } else {
                /* if there's any other actions */
            }
            return exportBuffer;
        }
    }

    dynamicArgsGenerator(originalArgs, additionalArgs){
        const origin = [];
        Array.prototype.push.apply(origin, originalArgs);
        Array.prototype.push.apply(origin, additionalArgs);
        return origin;
    }

    setToken(authInfo) {
        httpContext.set('token', authInfo.token);
        httpContext.set('user_id', authInfo.user_id);
        httpContext.set('domain_id', authInfo.domain_id);
        httpContext.set('user_type', authInfo.user_type);
    }

    generateRandomKey() {
        const fileRandomKey = `${uuidv4().slice(12,36)}`;
        return fileRandomKey;
    }

    getFileRequestURL(req, key) {
        const url = req.protocol + '://' + req.get('host');
        const fullDownloadLink = process.env.FILE_EXPORT === 'local' ? `${url}/add-ons/file/download?key=${key}` : `/add-ons/file/download?key=${key}`;

        /*const fullDownloadLink = `${url}/add-ons/file/download?key=${key}`;*/
        //const fullDownloadLink = `/add-ons/file/download?key=${key}`;
        const fileURL = { file_link : fullDownloadLink };
        return fileURL;
    }

    fileError (msg) {
        let err = new Error(msg);
        err.status = 500;
        err.error_code = 'ERROR_UNSUPPORTED_API';

        throw err;
    }
}

export default new File();

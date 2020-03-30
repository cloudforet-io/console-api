import redisClient from '@lib/redis';
import uuidv4 from 'uuid/v4';
import httpContext from 'express-http-context';

class File {
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
        const fullDownloadLink = `/add-ons/file/download?key=${key}`;
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

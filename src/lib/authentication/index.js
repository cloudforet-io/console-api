import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import config from 'config';
import asyncHandler from 'express-async-handler';
import grpcClient from '@lib/grpc-client';

const authError = (msg) => {
    let err = new Error(msg);
    err.status = 401;
    err.error_code = 'ERROR_AUTHENTICATE_FAILURE';

    throw err;
};

const parseToken = (authorization) => {
    if (!authorization) {
        authError('Bearer token is not set. (Headers.authorization: Bearer <token>)');
    } else if (!authorization.startsWith('Bearer ')) {
        authError('Bearer token format is invalid.');
    } else {
        return authorization.split(' ').pop().trim();
    }
};

const getSecret = async (domain_id) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.get_public_key({ domain_id: domain_id });
    let jwk = JSON.parse(response.public_key);
    return jwkToPem(jwk);
};

const verifyToken = async (token) => {
    try {
        let domain_id = jwt.decode(token).did;
        let secret = await getSecret(domain_id);
        jwt.verify(token, secret);

    } catch (e) {
        console.log(e);
        authError('Token verify failed.');
    }
};

const checkAuthURL = (url) => {
    let excludeUrls = config.get('authentication.exclude');
    if (excludeUrls.indexOf(url) < 0) {
        return true;
    } else {
        return false;
    }
};

const Authentication = () => {
    return asyncHandler(async (req, res, next) => {
        if(checkAuthURL(req.url)) {
            let token = parseToken(req.headers.authorization);
            await verifyToken(token);
            req.body['_meta'] = {
                token: token
            };
        }

        next();
    });
};

export default Authentication;

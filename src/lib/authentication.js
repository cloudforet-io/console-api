import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import config from 'config';
import url from 'url';
import uuidv4 from 'uuid/v4';
import asyncHandler from 'express-async-handler';
import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';
import logger from '@lib/logger';
import micromatch from 'micromatch';
import _ from 'lodash';

const corsOptions = {
    origin: (origin, callback) => {
        if (origin) {
            let whiteList = config.get('cors');
            if (micromatch.isMatch(origin, whiteList)) {
                callback(null, true);
            } else {
                let err = new Error(`Not allowed by CORS with requested URL: ${origin}`);
                err.status = 401;
                err.error_code = 'ERROR_AUTHENTICATE_FAILURE';
                callback(err);
            }
        } else {
            callback(null, true);
        }

    },
    credentials: true,
    exposedHeaders: ['Access-Token']
};

const authError = (msg) => {
    let err = new Error(msg);
    err.status = 401;
    err.error_code = 'ERROR_AUTHENTICATE_FAILURE';

    throw err;
};

const parseToken = (authorization) => {
    if (!authorization) {
        authError('Token is not set. (Headers.authorization: Bearer <token>)');
    } else if (!authorization.startsWith('Bearer ')) {
        authError('Token format is invalid.');
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
    let decodedToken = jwt.decode(token);
    if (!decodedToken) {
        authError('Token is invalid or expired.');
    }

    let domainId = decodedToken.did;
    let client = await redisClient.connect();
    let secret = await client.get(`domain:secret.${domainId}`);

    try {
        if (!secret)
        {
            secret = await getSecret(domainId);

            let domainKeyTimeout = config.get('timeout.domainKey');
            await client.set(`domain:secret.${domainId}`, secret, domainKeyTimeout);
        }
    } catch (e) {
        logger.error(e);
        authError('Token is invalid or expired.');
    }

    try {
        let tokenInfo = jwt.verify(token, secret);
        return tokenInfo;
    } catch (e) {
        authError('Token is invalid or expired.');
    }
};

const checkAuthURL = (url) => {
    let excludeUrls = config.get('authentication.exclude');
    if (excludeUrls.indexOf(url) < 0 ) {
        return true;
    } else {
        return false;
    }
};

const setDefaultMeta = (req) => {
    let transactionId = `tnx-${uuidv4().slice(24,36)}`;
    httpContext.set('transaction_id', transactionId);
    httpContext.set('request_url', req.url);
    httpContext.set('request_method', req.method);
};

const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        setDefaultMeta(req);
        const parsedURL = url.parse(req.url).pathname;
        const swaggerURL = _.remove(parsedURL.split('/'), function(o) { return o.length > 0; });

        if(checkAuthURL(parsedURL) && swaggerURL[0] !== 'api-docs') {
            let token = parseToken(req.headers.authorization);
            let tokenInfo = await verifyToken(token, res);

            httpContext.set('token', token);
            httpContext.set('user_id', tokenInfo.aud);
            httpContext.set('domain_id', tokenInfo.did);
            httpContext.set('user_type', tokenInfo.user_type);
        }

        next();
    });
};

export {
    authentication,
    corsOptions
};

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
import { ErrorModel } from '@lib/config/type';

const corsOptions = {
    origin: (origin, callback) => {
        const whiteList = config.get('cors');
        // logger.debug(`[ORIGIN] ${origin} [WHITE_LIST] ${whiteList.join(' | ')}`);
        if (origin) {
            if (micromatch.isMatch(origin, whiteList)) {
                callback(null, true);
            } else {
                const err: ErrorModel = new Error(`Not allowed by CORS with requested URL: ${origin}`);
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
    const err: ErrorModel = new Error(msg);
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
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Domain.get_public_key({ domain_id: domain_id });

    const jwk = JSON.parse(response.public_key);
    return jwkToPem(jwk);
};

const verifyToken = async (token) => {
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
        authError('Token is invalid or expired.');
    }

    const domainId = decodedToken.did;
    const client = await redisClient.connect();
    let secret = await client.get(`domain:secret.${domainId}`);

    try {
        if (!secret)
        {
            secret = await getSecret(domainId);

            const domainKeyTimeout = config.get('timeout.domainKey');
            await client.set(`domain:secret.${domainId}`, secret, domainKeyTimeout);
        }
    } catch (e) {
        logger.error(e);
        authError('Token is invalid or expired.');
    }

    try {
        const tokenInfo = jwt.verify(token, secret);
        return tokenInfo;
    } catch (e) {
        authError('Token is invalid or expired.');
    }
};

const checkAuthURL = (url) => {
    const excludeUrls = config.get('authentication.exclude');
    if (excludeUrls.indexOf(url) < 0 ) {
        return true;
    } else {
        return false;
    }
};

const setDefaultMeta = (req) => {
    const transactionId = `tnx-${uuidv4().slice(24,36)}`;
    httpContext.set('transaction_id', transactionId);
    httpContext.set('request_url', req.url);
    httpContext.set('request_method', req.method);

    if (req.headers['mock-mode'] && req.headers['mock-mode'].toLowerCase() === 'true')
    {
        httpContext.set('mock_mode', true);
    }
};

const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        setDefaultMeta(req);
        const parsedURL = url.parse(req.url).pathname;

        if(checkAuthURL(parsedURL)) {
            const token = parseToken(req.headers.authorization);
            httpContext.set('token', token);

            if (parsedURL !== config.get('authentication.refreshTokenUrl')) {
                const tokenInfo = await verifyToken(token);
                httpContext.set('user_id', tokenInfo.aud);
                httpContext.set('domain_id', tokenInfo.did);
                httpContext.set('user_type', tokenInfo.user_type);
            }
        }

        next();
    });
};

export {
    authentication,
    corsOptions
};

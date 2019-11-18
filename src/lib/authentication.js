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

const refreshToken = async (accessToken) => {
    let client = await redisClient.connect();
    let refreshToken = await client.get(`token:${accessToken}`);

    if (refreshToken) {
        let identityV1 = await grpcClient.get('identity', 'v1');
        let response = await identityV1.Token.refresh({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        let refreshTokenTimeout = config.get('timeout.refreshToken');
        await client.set(`token:${response.access_token}`, response.refresh_token, refreshTokenTimeout);
        return response.access_token;
    } else {
        authError('Token expired.');
    }
};

const verifyToken = async (accessToken, res) => {
    let decodedToken = jwt.decode(accessToken);
    if (!decodedToken) {
        authError('Token verify failed.');
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
        authError('Token verify failed.');
    }

    try {
        let tokenInfo = jwt.verify(accessToken, secret);
        return tokenInfo;
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            let newAccessToken = await refreshToken(accessToken);
            res.set('Access-Token', newAccessToken);
            return jwt.verify(newAccessToken, secret);
        } else {
            throw(e);
        }
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

const setDefaultMeta = (req) => {
    let transactionId = `tnx-${uuidv4().slice(24,36)}`;
    httpContext.set('transaction_id', transactionId);
    httpContext.set('request_url', req.url);
    httpContext.set('request_method', req.method);
};

const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        setDefaultMeta(req);

        if(checkAuthURL(url.parse(req.url).pathname)) {
            let accessToken = parseToken(req.headers.authorization);
            let tokenInfo = await verifyToken(accessToken, res);

            httpContext.set('token', accessToken);
            httpContext.set('user_id', tokenInfo.aud);
            httpContext.set('domain_id', tokenInfo.did);
        }

        next();
    });
};

export {
    authentication,
    corsOptions
};

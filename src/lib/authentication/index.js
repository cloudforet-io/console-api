import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import config from 'config';
import url from 'url';
import asyncHandler from 'express-async-handler';
import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';

const corsOptions = {
    origin: (origin, callback) => {
        if (origin) {
            let whiteList = config.get('cors');
            if (whiteList.indexOf(origin) !== -1) {
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
    credentials: true
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
    let refreshToken = await client.get(`token.${accessToken}`);
    if (refreshToken) {
        let identityV1 = await grpcClient.get('identity', 'v1');
        let response = await identityV1.Token.refresh({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        let refreshTokenTimeout = config.get('timeout.refreshToken');
        await client.set(`token.${response.access_token}`, response.refresh_token, refreshTokenTimeout);
        return response.access_token;
    } else {
        authError('Token expired.');
    }
};

const verifyToken = async (accessToken, res) => {
    let domain_id = jwt.decode(accessToken).did;
    let client = await redisClient.connect();
    let secret = await client.get(`domain.secret.${domain_id}`);

    try {
        if (!secret)
        {
            secret = await getSecret(domain_id);

            let domainKeyTimeout = config.get('timeout.domainKey');
            await client.set(`domain.secret.${domain_id}`, secret, domainKeyTimeout);
        }
    } catch (e) {
        console.log(e);
        authError('Token verify failed.');
    }

    try {
        jwt.verify(accessToken, secret);
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            let newAccessToken = await refreshToken(accessToken);
            res.set('AccessToken', newAccessToken);
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

const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        if(checkAuthURL(url.parse(req.url).pathname)) {
            let accessToken = parseToken(req.headers.authorization);
            await verifyToken(accessToken, res);

            req.body['_meta'] = {
                token: accessToken
            };
        }

        next();
    });
};

export {
    authentication,
    corsOptions
};

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
import expressSession from 'express-session';
import connectRedis from 'connect-redis';

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

const session = () => {
    let redisStore = connectRedis(expressSession);
    let client = redisClient.create();

    return expressSession({
        store: new redisStore({ client: client}),
        secret: 'keyboard cat',
        resave: false,
        rolling: true,
        saveUninitialized: true,
        cookie: {
            maxAge: config.get('timeout.session')*1000
        }
    });
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

const refreshToken = async (session) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.refresh({
        access_token: session.accessToken,
        refresh_token: session.refreshToken
    });

    return response;
};

const verifyTokenWithSession = async (session) => {
    let decodedToken = jwt.decode(session.accessToken);
    if (!decodedToken) {
        authError('Session expired.');
    }

    let domainId = decodedToken.did;
    let client = await redisClient.connect();
    let secret = await client.get(`domain:secret.${domainId}`);

    try {
        if (!secret)
        {
            secret = await getSecret(domainId);

            let domainKeyTimeout = config.get('timeout.domainKey');
            await client.set(`domain:secret:${domainId}`, secret, domainKeyTimeout);
        }
    } catch (e) {
        session.destroy();
        console.log(e);
        authError('Session expired.');
    }

    try {
        let tokenInfo = jwt.verify(session.accessToken, secret);
        httpContext.set('token', session.accessToken);
        return tokenInfo;
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            let authInfo = await refreshToken(session);
            setAuthSession(session, authInfo);
            httpContext.set('token', authInfo.access_token);
            return jwt.verify(authInfo.access_token, secret);
        } else {
            session.destroy();
            console.log(e);
            authError('Session expired.');
        }
    }
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
            if (req.session.isLoggedIn) {
                let tokenInfo = await verifyTokenWithSession(req.session);
                httpContext.set('user_id', tokenInfo.aud);
                httpContext.set('domain_id', tokenInfo.did);
            } else {
                let token = parseToken(req.headers.authorization);
                if (token) {
                    let token = parseToken(req.headers.authorization);
                    let tokenInfo = await verifyToken(token, res);

                    httpContext.set('token', token);
                    httpContext.set('user_id', tokenInfo.aud);
                    httpContext.set('domain_id', tokenInfo.did);
                } else {
                    req.session.destroy();
                    authError('Session expired.');
                }
            }
        }

        next();
    });
};

const setAuthSession = (session, authInfo) => {
    session.isLoggedIn = true;
    session.accessToken = authInfo.access_token;
    session.refreshToken = authInfo.refresh_token;
};

const signIn = (authFunc) => {
    return asyncHandler(async (req, res, next) => {
        let authInfo = await authFunc(req.body);
        setAuthSession(req.session, authInfo);
        res.json({});
    });
};

const signOut = () => {
    return asyncHandler(async (req, res, next) => {
        req.session.destroy();
        res.json({});
    });
};

export {
    authentication,
    session,
    signIn,
    signOut,
    corsOptions
};

import config from 'config';
import jwt from 'jsonwebtoken';
import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';
import logger from '@lib/logger';

const issueToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.issue(params);

    let refreshTokenTimeout = config.get('timeout.refreshToken');

    let client = await redisClient.connect();
    await client.set(`token:${response.access_token}`, response.refresh_token, refreshTokenTimeout);

    let tokenInfo = jwt.decode(response.access_token);
    response.user_id = tokenInfo.aud;
    response.domain_id = tokenInfo.did;
    delete response.refresh_token;

    return response;
};

export {
    issueToken
};

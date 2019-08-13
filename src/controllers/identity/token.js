import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';
import config from 'config';
import jwt from 'jsonwebtoken';

const issueToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.issue(params);

    let accessTokenTimeout = config.get('timeout.accessToken');

    let client = await redisClient.connect();
    await client.set(response.access_token, response.refresh_token, accessTokenTimeout);

    response.user_id = jwt.decode(response.access_token).aud;
    delete response.refresh_token;

    return response;
};

export {
    issueToken
};

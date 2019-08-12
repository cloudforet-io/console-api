import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';
import redisClient from '@lib/redis';
import config from 'config';

const issueToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.issue(params);

    let accessTokenTimeout = config.get('timeout.accessToken');

    let client = await redisClient.connect();
    await client.set(response.access_token, response.refresh_token, accessTokenTimeout);

    delete response.refresh_token;
    return response;
};

export {
    issueToken
};

import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';
// import redisClient from '@lib/redis';
// import redis from 'redis';

const issueToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.issue(params);

    // let client = await redisClient.get();
    // client.set(response.access_token, response.refresh_token, redis.print);
    // client.get(response.access_token);
    //console.log(client.get(response.access_token));

    delete response.refresh_token;
    return response;
};

export {
    issueToken
};

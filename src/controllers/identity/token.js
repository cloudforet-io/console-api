import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const issueToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.issue(params);

    return response;
};

const refreshToken = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Token.refresh(params);

    return response;
};

export {
    issueToken,
    refreshToken
};

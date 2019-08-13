import grpcClient from '@lib/grpc-client';

const createUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.create(params);

    return response;
};

const updateUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.update(params);

    return response;
};

const deleteUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.delete(params);

    return response;
};

const enableUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.enable(params);

    return response;
};

const disableUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.disable(params);

    return response;
};

const getUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.get(params);

    return response;
};

const listUsers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.list(params);

    return response;
};

export {
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    getUser,
    listUsers
};

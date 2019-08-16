import grpcClient from '@lib/grpc-client';
//import * as serviceModule from '@lib/service-module';

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

const updateRoleUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.update_role(params);

    return response;
};

const findUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.find(params);

    return response;
};

const syncUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.sync(params);

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

    // let token = params._meta.token;
    // let repoClient = serviceModule.client('repository', token);
    //
    // try {
    //     response = await repoClient.post('/repository/plugin/list', {});
    //     return response.data;
    // } catch (e) {
    //     serviceModule.errorHandler(e);
    // }
};

export {
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    updateRoleUser,
    findUser,
    syncUser,
    getUser,
    listUsers
};

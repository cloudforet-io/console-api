import grpcClient from '@lib/grpc-client';

const createProjectGroup = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.create(params);

    return response;
};

const updateProjectGroup = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.update(params);

    return response;
};

const deleteProjectGroup = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.delete(params);

    return response;
};

const getProjectGroup = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.get(params);

    return response;
};

const addProjectGroupMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.add_member(params);

    return response;
};

const modifyProjectGroupMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.modify_member(params);

    return response;
};

const removeProjectGroupMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.remove_member(params);

    return response;
};

const listProjectGroupMembers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.list_members(params);

    return response;
};

const listProjectGroups = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.list(params);

    return response;
};

export {
    createProjectGroup,
    updateProjectGroup,
    deleteProjectGroup,
    getProjectGroup,
    addProjectGroupMember,
    modifyProjectGroupMember,
    removeProjectGroupMember,
    listProjectGroupMembers,
    listProjectGroups
};

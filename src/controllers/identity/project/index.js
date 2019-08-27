import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createProject = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.create(params);

    return response;
};

const updateProject = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.update(params);

    return response;
};

const deleteProject = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.delete(params);

    return response;
};

const getProject = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.get(params);

    return response;
};

const addProjectMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.add_member(params);

    return response;
};

const modifyProjectMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.modify_member(params);

    return response;
};

const removeProjectMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.remove_member(params);

    return response;
};

const listProjectMembers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.list_members(params);

    return response;
};

const listProjects = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.list(params);

    return response;
};

export {
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addProjectMember,
    modifyProjectMember,
    removeProjectMember,
    listProjectMembers,
    listProjects
};

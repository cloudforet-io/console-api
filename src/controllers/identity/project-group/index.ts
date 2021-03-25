import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';
import { ErrorModel } from '@lib/config/type';

const createProjectGroup = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.create(params);

    return response;
};

const updateProjectGroup = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.update(params);

    return response;
};

const deleteProjectGroup = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.delete(params);

    return response;
};

const getProjectGroup = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.get(params);

    return response;
};

const addProjectGroupMember = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    for (let i=0; i < params.users.length; i++) {
        const user_id = params.users[i];
        try {
            const reqParams = {
                user_id: user_id,
                project_group_id: params.project_group_id,
                labels: params.labels || [],
                role_id: params.role_id
            };

            await identityV1.ProjectGroup.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to add project group members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyProjectGroupMember = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.modify_member(params);

    return response;
};

const removeProjectGroupMember = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};


    for (let i=0; i < params.users.length; i++) {
        const user_id = params.users[i];
        try {
            const reqParams = {
                user_id: user_id,
                project_group_id: params.project_group_id
            };

            await identityV1.ProjectGroup.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to remove project group members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listProjectGroupMembers = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.list_members(params);

    return response;
};

const listProjectGroups = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.list(params);

    return response;
};

const listProjects = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.list_projects(params);

    if (params.include_provider && response.results.length > 0) {
        for(let i =0 ; i < response.results.length; i++ ){
            const currentProject = response.results[i];
            const service_params = {
                project_id: currentProject.project_id,
                domain_id: params.domain_id
            };
            const service_accounts = await identityV1.ServiceAccount.list(service_params);
            if (service_accounts.total_count > 0) {
                const prep = _.uniqBy(service_accounts.results, 'provider').map(a => a.provider);
                response.results[i].providers = prep.length > 0 ? prep : [];
            } else {
                response.results[i].providers = [];
            }
        }

    }

    return response;
};

const statProjectGroups = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ProjectGroup.stat(params);

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
    listProjectGroups,
    listProjects,
    statProjectGroups

};

import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

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
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                project_group_id: params.project_group_id,
                labels: params.labels || []
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await identityV1.ProjectGroup.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add project group members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyProjectGroupMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.modify_member(params);

    return response;
};

const removeProjectGroupMember = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                project_group_id: params.project_group_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await identityV1.ProjectGroup.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove project group members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listProjectGroupMembers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ProjectGroup.list_members(params);

    return response;
};

const listProjectGroups = async (params) => {
    changeQueryKeyword(params.query, ['project_group_id', 'name']);
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

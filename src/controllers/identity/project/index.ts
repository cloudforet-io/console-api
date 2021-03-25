import grpcClient from '@lib/grpc-client';
import { listServiceAccounts } from '@controllers/identity/service-account';
import { listServers, deleteServer } from '@controllers/inventory/server';
import { listCloudServices, deleteCloudService } from '@controllers/inventory/cloud-service';
import { listSchedules, deleteSchedule } from '@controllers/power-scheduler/schedule';
import { ErrorModel } from '@lib/config/type';
import { listRoles } from '@controllers/identity/role';


const PROJECT_REFERENCE_RESOURCES = [
    { resourceId: 'server_id', listMethod: listServers, deleteMethod: deleteServer },
    { resourceId: 'cloud_service_id', listMethod: listCloudServices, deleteMethod: deleteCloudService },
    { resourceId: 'schedule_id', listMethod: listSchedules, deleteMethod: deleteSchedule }
];


const createProject = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.create(params);

    return response;
};

const updateProject = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.update(params);

    return response;
};

const deleteProject = async (params) => {
    await deleteReferenceResources(params.project_id);

    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.delete(params);
    return response;
};

const getProject = async (params) => {

    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.get(params);

    if(params.include_provider) {
        const serviceAccountResponse = await listServiceAccounts({
            project_id: params.project_id,
            domain_id:params.domain_id
        });

        response.providers = serviceAccountResponse.results.map((serviceAccountInfo) => {
            return serviceAccountInfo.provider;
        });
    }

    return response;
};

const addProjectMember = async (params) => {
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
                project_id: params.project_id,
                labels: params.labels || [],
                role_id: params.role_id
            };

            await identityV1.Project.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to add project members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyProjectMember = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.modify_member(params);

    return response;
};

const removeProjectMember = async (params) => {
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
                project_id: params.project_id
            };

            await identityV1.Project.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to remove project members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listProjectMembers = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.list_members(params);

    return response;
};

const listProjects = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.list(params);

    if (params.include_provider) {
        response.results = await Promise.all(response.results.map(async (projectInfo) => {
            const serviceAccountResponse = await listServiceAccounts({
                project_id: projectInfo.project_id,
                domain_id:params.domain_id
            });

            projectInfo['providers'] = serviceAccountResponse.results.map((serviceAccountInfo) => {
                return serviceAccountInfo.provider;
            });

            return projectInfo;
        }));
    }

    return response;
};

const statProjects = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Project.stat(params);

    return response;
};

const deleteReferenceResources = async (projectId) => {
    for (const referenceInfo of PROJECT_REFERENCE_RESOURCES){
        const response = await referenceInfo.listMethod({
            project_id: projectId,
            query: {
                only: [referenceInfo.resourceId]
            }
        });

        for (const resourceInfo of response.results) {
            await referenceInfo.deleteMethod({
                [referenceInfo.resourceId]: resourceInfo[referenceInfo.resourceId]
            });
        }
    }
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
    listProjects,
    statProjects
};

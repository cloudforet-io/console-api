import grpcClient from '@lib/grpc-client';
import { listServiceAccounts } from '@controllers/identity/service-account';
import _ from 'lodash';

const CASCADE_DELETE_RESOURCES = [
    {service: 'inventory.Server', version: 'v1', key: 'server_id'},
    {service: 'inventory.CloudService', version: 'v1', key: 'cloud_service_id'}
];


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
    if(_.isEmpty(response) && typeof response === 'object') {
        await deleteCascading(params);
    }
    return response;
};

const getProject = async (params) => {

    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.get(params);

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

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < params.users.length; i++) {
        let user_id = params.users[i];
        try {
            let reqParams = {
                user_id: user_id,
                project_id: params.project_id,
                labels: params.labels || [],
                roles: params.roles || [],
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await identityV1.Project.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to add project members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyProjectMember = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.modify_member(params);

    return response;
};

const removeProjectMember = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};


    for (let i=0; i < params.users.length; i++) {
        let user_id = params.users[i];
        try {

            const reqParams = {
                user_id: user_id,
                project_id: params.project_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await identityV1.Project.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to remove project members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listProjectMembers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.list_members(params);

    return response;
};

const listProjects = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.list(params);

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
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.stat(params);

    return response;
};

const deleteCascading = async (params) => {
    for (const resource of CASCADE_DELETE_RESOURCES){
        const serializeServiceName = resource.service.split('.');
        const requestService = await grpcClient.get(serializeServiceName[0], resource.version);
        const basicQuery = {
            domain_id: params.domain_id,
            project_id: params.project_id,
            query: {
                only: [
                    resource.key
                ]
            }
        };

        const executeResponse = await _.invoke(requestService, `${serializeServiceName[1]}.list`, basicQuery);
        const cascadeItemIds = _.map(executeResponse.results, resource.key);

        if (!_.isEmpty(cascadeItemIds)) {
            _.set(basicQuery, 'release_project', true);
            delete basicQuery.query;
            let successCount = 0;
            let failCount = 0;
            let failItems = {};
            for(const singleId of cascadeItemIds) {
                _.set(basicQuery, resource.key, singleId);
                try {
                    console.log('basicQuery', basicQuery);
                    const executeResponse = await _.invoke(requestService, `${serializeServiceName[1]}.update`, basicQuery);
                    console.log('response: ', executeResponse);
                    successCount++;
                }catch(e){
                    failItems[singleId] = e.details || e.message;
                    failCount++;
                }
            }
            if (failCount > 0) {
                let error = new Error(`Failed to release project from . (success: ${successCount}, failure: ${failCount})`);
                error.fail_items = failItems;
                console.log('error: ', error);
            }
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

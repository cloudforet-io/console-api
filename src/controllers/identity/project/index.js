import grpcClient from '@lib/grpc-client';
import { serviceExecutor } from '@lib/utils';
import _ from 'lodash';
import serviceClient from '@lib/service-client';
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

    if(_.isEmpty(response) && typeof response === 'object') {

        const selectParams = {
            domain_id: params.domain_id,
            project_id: params.project_id,
            query: {
                only: [
                    'service_account_id'
                ]
            }
        };

        const inventoryV1 = await grpcClient.get('inventory', 'v1');

        const serviceAccounts = await serviceExecutor(identityV1, 'ServiceAccount.list', selectParams, 'service_account_id');
        selectParams.query = { only: ['cloud_service_id'] };
        const cloudServices = await serviceExecutor(inventoryV1, 'CloudService.list', selectParams, 'cloud_service_id');

        if(!_.isEmpty(serviceAccounts)){
            selectParams.service_accounts = serviceAccounts;
            selectParams.release_project = true;
            selectParams.query = {};
            console.log('request param: ', selectParams);
            const identityClient = serviceClient.get('identity', 'v1');
            let serviceAccountResponse = await identityClient.post('/identity/service-account/change-project', selectParams);
            console.log('Service Account Response: ', serviceAccountResponse.data);
        }

        if(!_.isEmpty(cloudServices)){
            selectParams.cloud_services = cloudServices;
            selectParams.release_project = true;
            selectParams.query = {};
            const inventoryClient = serviceClient.get('inventory', 'v1');
            let cloudServiceResponse = await inventoryClient.post('/inventory/cloud-service/change-project', selectParams);
            console.log('Cloud Service Response: ', cloudServiceResponse.data);
        }
    }

    console.log('response: ', response);
    return response;
};

const getProject = async (params) => {

    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.get(params);

    if(params.include_provider) {
        //const providers = [];
        const service_params = {
            project_id: params.project_id,
            domain_id:params.domain_id
        };

        const service_accounts = await identityV1.ServiceAccount.list(service_params);

        if(service_accounts.total_count > 0){
            const prep = _.uniqBy(service_accounts.results, 'provider').map(a => a.provider);
            /*for (let i=0; i < prep.length; i++) {
                const provider = prep[i];
                try {
                    const providerPram = { provider }
                    if (providerPram.domain_id) {
                        providerPram.domain_id = params.domain_id;
                    }

                    const providerOutput = await identityV1.Provider.get(providerPram);
                    const providerName = _.get(providerOutput, 'name');
                    providers.push(providerName);

                } catch (e) {
                    console.log(e);
                }
            }*/
            response.providers = prep.length > 0 ? prep : [];
        }
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
                roles: params.roles || []
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

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
                project_id: params.project_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

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

    if(params.include_provider && response.total_count > 0) {
        for(let i =0 ; i < response.total_count; i++ ){
            const currentProject = response.results[i];
            const service_params = {
                project_id: currentProject.project_id,
                domain_id:params.domain_id
            };
            const service_accounts = await identityV1.ServiceAccount.list(service_params);
            if(service_accounts.total_count > 0){
                const prep = _.uniqBy(service_accounts.results, 'provider').map(a => a.provider);
                response.results[i].providers = prep.length > 0 ? prep : [];
            }else {
                response.results[i].providers = [];
            }
        }

    }

    return response;
};

const statProjects = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Project.stat(params);

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
    listProjects,
    statProjects
};

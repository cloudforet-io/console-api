import grpcClient from '@lib/grpc-client';
import { pageItems } from '@lib/utils';
import serviceClient from '@lib/service-client';
import _ from 'lodash';
import logger from '@lib/logger';

const getServiceAccountReference = async (service_accounts, domain_id) => {

    let identityV1 = await grpcClient.get('identity', 'v1');
    let projects = [];
    let response = await identityV1.ServiceAccount.list({
        query: {
            filter: [{
                key: 'service_account_id',
                value: service_accounts,
                operator: 'in'
            }]
        },
        domain_id: domain_id
    });

    response.results.map((serviceAccountInfo) => {
        if (serviceAccountInfo.project_info.project_id && projects.indexOf(serviceAccountInfo.project_info.project_id) ===-1) {
            projects.push(serviceAccountInfo.project_info.project_id);
        }
    });

    return {
        projects
    };
};

const listServiceAccountProjectMembers = async (projects, domain_id, query) => {
    let identityClient = serviceClient.get('identity');
    let existProjects = [];
    let results = [];
    let projectResponse = await identityClient.post('/identity/project/list', {
        domain_id: domain_id,
        query: {
            minimal: true,
            filter: [{
                key: 'project_id',
                value: projects,
                operator: 'in'
            }]
        }
    });

    projectResponse.data.results.map((projectInfo) => {
        existProjects.push(projectInfo.project_id);
    });

    let promises = existProjects.map(async (project_id) => {
        let response = await identityClient.post('/identity/project/member/list', {
            project_id: project_id,
            domain_id: domain_id,
            query: query
        });

        Array.prototype.push.apply(results, response.data.results);
    });
    await Promise.all(promises);

    return results;
};

const changeResourceInfo = (items) => {
    items.map((item) => {
        if (item.project_info) {
            item.resource_type = 'PROJECT';
            item.resource_id = item.project_info.project_id;
            item.name = item.project_info.name;
            delete item.project_info;
        } /*else if (item.region_info) {
            item.resource_type = 'PROJECT_GROUP';
            item.resource_id = item.region_info.region_id;
            item.name = item.region_info.name;
            delete item.region_info;
        }*/
    });
};

const listServiceAccountMembers = async (params) => {
    let service_accounts = params.service_accounts || [];
    let domain_id = params.domain_id;
    let query = params.query || {};
    let response = {
        results: []
    };

    if (service_accounts.length > 0) {
        let serviceAccountRefer = await getServiceAccountReference(service_accounts, domain_id);

        Array.prototype.push.apply(
            response.results,
            await listServiceAccountProjectMembers(serviceAccountRefer.projects, domain_id, _.cloneDeep(query)));

        changeResourceInfo(response.results);

        if (query.page) {
            response.results = pageItems(response.results, query.page);
        }
    }

    response.total_count = response.results.length;
    return response;
};

export default listServiceAccountMembers;

import grpcClient from '@lib/grpc-client';
import { pageItems } from '@lib/utils';
import serviceClient from '@lib/service-client';
import _ from 'lodash';
import logger from '@lib/logger';

const getCloudServiceReference = async (cloud_services, domain_id) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let projects = [];
    let regions = [];

    let response = await inventoryV1.CloudService.list({
        query: {
            filter: [{
                key: 'cloud_service_id',
                value: cloud_services,
                operator: 'in'
            }]
        },
        domain_id: domain_id
    });

    response.results.map((cloudServiceInfo) => {
        if (cloudServiceInfo.project_id && projects.indexOf(cloudServiceInfo.project_id) < 0) {
            projects.push(cloudServiceInfo.project_id);
        }

        if (cloudServiceInfo.region_info && regions.indexOf(cloudServiceInfo.region_info.region_id) < 0) {
            regions.push(cloudServiceInfo.region_info.region_id);
        }
    });

    return {
        projects,
        regions
    };
};

const listCloudServiceRegionMembers = async (regions, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let results = [];

    let promises = regions.map(async (region_id) => {
        let response = await inventoryV1.Region.list_members({
            region_id: region_id,
            domain_id: domain_id,
            query: query
        });

        Array.prototype.push.apply(results, response.data.results);
    });
    await Promise.all(promises);

    return results;
};

const listCloudServiceProjectMembers = async (projects, domain_id, query) => {
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
        } else if (item.region_info) {
            item.resource_type = 'REGION';
            item.resource_id = item.region_info.region_id;
            item.name = item.region_info.name;
            delete item.region_info;
        }
    });
};

const listCloudServiceMembers = async (params) => {
    let cloud_services = params.cloud_services || []
    let domain_id = params.domain_id;
    let query = params.query || {};

    let response = {
        results: []
    };

    if (cloud_services.length > 0) {
        let cloudServiceRefer = await getCloudServiceReference(cloud_services, domain_id);
        Array.prototype.push.apply(
            response.results,
            await listCloudServiceProjectMembers(cloudServiceRefer.projects, domain_id, _.cloneDeep(query)));
        Array.prototype.push.apply(
            response.results,
            await listCloudServiceRegionMembers(cloudServiceRefer.regions, domain_id, _.cloneDeep(query)));

        changeResourceInfo(response.results);

        if (query.page) {
            response.results = pageItems(response.results, query.page);
        }
    }

    response.total_count = response.results.length;
    return response;
};

export default listCloudServiceMembers;

import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword, pageItems } from '@lib/utils';
import serviceClient from '@lib/service-client';
import _ from 'lodash';
import logger from '@lib/logger';

const getServerReference = async (servers, domain_id) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let projects = [];
    let regions = [];
    let zones = [];
    let pools = [];

    let response = await inventoryV1.Server.list({
        query: {
            filter: [{
                key: 'server_id',
                value: servers,
                operator: 'in'
            }]
        },
        domain_id: domain_id
    });

    response.results.map((serverInfo) => {
        if (serverInfo.project_id && projects.indexOf(serverInfo.project_id) < 0) {
            projects.push(serverInfo.project_id);
        }

        if (regions.indexOf(serverInfo.region_info.region_id) < 0) {
            regions.push(serverInfo.region_info.region_id);
        }

        if (zones.indexOf(serverInfo.zone_info.zone_id) < 0) {
            zones.push(serverInfo.zone_info.zone_id);
        }

        if (serverInfo.pool_info && pools.indexOf(serverInfo.pool_info.pool_id) < 0) {
            pools.push(serverInfo.pool_info.pool_id);
        }
    });

    return {
        projects,
        regions,
        zones,
        pools
    };
};

const listRegionMembers = async (regions, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let results = [];

    let promises = regions.map(async (region_id) => {
        let response = await inventoryV1.Region.list_members({
            region_id: region_id,
            domain_id: domain_id,
            query: query
        });

        Array.prototype.push.apply(results, response.results);
    });
    await Promise.all(promises);

    return results;
};

const listZoneMembers = async (zones, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let results = [];

    let promises = zones.map(async (zone_id) => {
        let response = await inventoryV1.Zone.list_members({
            zone_id: zone_id,
            domain_id: domain_id,
            query: query
        });

        Array.prototype.push.apply(results, response.results);
    });
    await Promise.all(promises);

    return results;
};

const listPoolMembers = async (pools, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let results = [];

    let promises = pools.map(async (pool_id) => {
        let response = await inventoryV1.Pool.list_members({
            pool_id: pool_id,
            domain_id: domain_id,
            query: query
        });

        Array.prototype.push.apply(results, response.results);
    });
    await Promise.all(promises);

    return results;
};

const listProjectMembers = async (projects, domain_id, query) => {
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
        } else if (item.zone_info) {
            item.resource_type = 'ZONE';
            item.resource_id = item.zone_info.zone_id;
            item.name = item.zone_info.name;
            delete item.zone_info;
        } else if (item.pool_info) {
            item.resource_type = 'POOL';
            item.resource_id = item.pool_info.pool_id;
            item.name = item.pool_info.name;
            delete item.pool_info;
        }
    });
};

const listServerMembers = async (params) => {
    let servers = params.servers || []
    let domain_id = params.domain_id;
    let query = params.query || {};
    changeQueryKeyword(query, ['user_id', 'name']);
    let response = {
        results: []
    };

    if (servers.length > 0) {
        let serverRefer = await getServerReference(servers, domain_id);
        Array.prototype.push.apply(
            response.results,
            await listProjectMembers(serverRefer.projects, domain_id, _.cloneDeep(query)));
        Array.prototype.push.apply(
            response.results,
            await listRegionMembers(serverRefer.regions, domain_id, _.cloneDeep(query)));
        Array.prototype.push.apply(
            response.results,
            await listZoneMembers(serverRefer.zones, domain_id, _.cloneDeep(query)));
        Array.prototype.push.apply(
            response.results,
            await listPoolMembers(serverRefer.pools, domain_id, _.cloneDeep(query)));

        changeResourceInfo(response.results);

        if (query.page) {
            response.results = pageItems(response.results, query.page);
        }
    }

    response.total_count = response.results.length;
    return response;
};

export default listServerMembers;

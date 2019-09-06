import grpcClient from '@lib/grpc-client';
import { pageItems } from '@lib/utils';
import serviceClient from '@lib/service-client';
import logger from '@lib/logger';

const getServerReference = async (server_id, domain_id) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.get({
        server_id: server_id,
        domain_id: domain_id
    });

    return {
        project_id: response.project_id,
        region_id: response.region_info.region_id,
        zone_id: response.zone_info.zone_id,
        pool_id: (response.pool_info)?response.pool_info.pool_id:null
    };
};

const listRegionAdmins = async (region_id, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list_admins({
        region_id: region_id,
        domain_id: domain_id,
        query: query
    });

    return response.results;
};

const listZoneAdmins = async (zone_id, domain_id, query) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.list_admins({
        zone_id: zone_id,
        domain_id: domain_id,
        query: query
    });

    return response.results;
};

const listPoolAdmins = async (pool_id, domain_id, query) => {
    if (pool_id) {
        let inventoryV1 = await grpcClient.get('inventory', 'v1');
        let response = await inventoryV1.Pool.list_admins({
            pool_id: pool_id,
            domain_id: domain_id,
            query: query
        });

        return response.results;
    } else {
        return [];
    }
};

const listProjectMembers = async (project_id, domain_id, query) => {
    if (project_id) {
        try {
            let identityClient = serviceClient.get('identity');
            let response = await identityClient.post('/identity/project/member/list', {
                project_id: project_id,
                domain_id: domain_id,
                query: query
            });

            return response.results;
        } catch (e) {
            serviceClient.errorHandler(e);
        }
    } else {
        return [];
    }
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

const listServerAdmins = async (params) => {
    let query = params.query || {};
    let response = {
        results: []
    };

    let serverRefer = await getServerReference(params.server_id, params.domain_id);
    Array.prototype.push.apply(
        response.results,
        await listProjectMembers(serverRefer.project_id, params.domain_id, query));
    Array.prototype.push.apply(
        response.results,
        await listRegionAdmins(serverRefer.region_id, params.domain_id, query));
    Array.prototype.push.apply(
        response.results,
        await listZoneAdmins(serverRefer.zone_id, params.domain_id, query));
    Array.prototype.push.apply(
        response.results,
        await listPoolAdmins(serverRefer.pool_id, params.domain_id, query));

    changeResourceInfo(response.results);

    if (query.page) {
        response.results = pageItems(response.results, query.page);
    }

    response.total_count = response.results.length;
    return response;
};

export default listServerAdmins;

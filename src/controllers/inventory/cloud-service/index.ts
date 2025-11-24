import _ from 'lodash';

import { ErrorModel } from '@lib/error';
import grpcClient from '@lib/grpc-client';

const createCloudService = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.create(params);

    return response;
};

const updateCloudService = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.update(params);

    return response;
};

const deleteCloudService = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.delete(params);

    return response;
};

const changeCloudServiceRegion = async (params) => {

    if (!params.cloud_services) {
        throw new Error('Required Parameter. (key = cloud_services)');
    }

    if (!(params.region_id || params.release_region)) {
        throw new Error('Required Parameter. (key = region_id or release_region)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.cloud_services.map(async (cloud_service_id) => {
        try {
            const reqParams: any = {
                cloud_service_id: cloud_service_id,
                ...params.domain_id && { domain_id: params.domain_id }
            };

            if (params.release_region == true) {
                reqParams.release_region = true;
            } else {
                reqParams.region_id = params.region_id;
            }

            await inventoryV1.CloudService.update(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[cloud_service_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change Cloud Service's project. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const changeCloudServiceProject = async (params) => {

    if (!params.cloud_services) {
        throw new Error('Required Parameter. (key = cloud_services)');
    }

    if (!(params.project_id || params.release_project)) {
        throw new Error('Required Parameter. (key = project_id or release_project)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.cloud_services.map(async (cloud_service_id) => {

        try {
            const reqParams = {
                cloud_service_id: cloud_service_id,
                release_project: false,
                project_id: '',
                domain_id: ''
            };

            if (params.release_project == true) {
                reqParams.release_project = true;
            } else {
                reqParams.project_id = params.project_id;
            }

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.CloudService.update(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[cloud_service_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change Cloud Service's project. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};


const deleteCloudServices = async (params) => {
    if (!params.cloud_services) {
        throw new Error('Required Parameter. (key = cloud_services)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.cloud_services.map(async (cloud_service_id) => {
        try {
            const reqParams = {
                cloud_service_id: cloud_service_id,
                ...params.domain_id && { domain_id: params.domain_id }
            };

            await inventoryV1.CloudService.delete(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[cloud_service_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to delete cloud services. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getCloudService = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.get(params);

    return response;
};

const listCloudServices = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    params = addDateRangeFilter(params);

    const query = _.cloneDeep(params.query) || {};
    const filter = query.filter || [];
    const filter_or = query.filter_or || [];
    const keyword = query.keyword || '';
    const page = query.page || {};

  // Convert sort object to array for gRPC v2 compatibility
    if (query.sort && !Array.isArray(query.sort)) {
        query.sort = [query.sort];
        params.query.sort = query.sort;
    }

    if (page.start || page.limit) {
        return await inventoryV1.CloudService.list(params);
    } else {
        const countResponse = await inventoryV1.CloudService.list({
            query: {
                filter: filter,
                filter_or: filter_or,
                keyword: keyword,
                count_only: true
            }
        });
        const totalCount = countResponse.total_count || 0;
        const pageLimit = 1000;
        const pageCount = Math.ceil(totalCount / pageLimit);
        const items: any = [];
        for (let i = 0; i < pageCount; i++) {
            const requestParams = {
                ..._.cloneDeep(params)
            };
            requestParams.query = requestParams.query || {};
            requestParams.query.page = {
                limit: pageLimit,
                start: (pageLimit * i) + 1
            };

            const response = await inventoryV1.CloudService.list(requestParams);
            items.push(...response.results);
        }

        return {
            results: items,
            total_count: totalCount
        };
    }
};

const statCloudServices = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.stat(params);

    return response;
};

const addDateRangeFilter = (params) => {
    if (params.date_range) {
        const start = params.date_range.start;
        const end = params.date_range.end;
        if (!start) {
            throw new Error('Required Parameter. (key = date_range.start)');
        }

        if (!end) {
            throw new Error('Required Parameter. (key = date_range.end)');
        }

        const query = params.query || {};
        query.filter = query.filter || [];
        query.filter_or = query.filter_or || [];

        query.filter.push(
            { k: 'state', v: ['ACTIVE', 'DELETED'], o: 'in' }
        );
        query.filter.push(
            { k: 'created_at', v: end, o: 'datetime_lte' }
        );
        query.filter_or.push(
            { k: 'deleted_at', v: start, o: 'datetime_gte' }
        );
        query.filter_or.push(
            { k: 'deleted_at', v: null, o: 'eq' }
        );
    }

    return params;
};

export {
    createCloudService,
    updateCloudService,
    deleteCloudService,
    deleteCloudServices,
    changeCloudServiceRegion,
    changeCloudServiceProject,
    getCloudService,
    listCloudServices,
    statCloudServices
};

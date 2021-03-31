import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import {ErrorModel} from '@libconfig/type';

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
            const reqParams = {
                cloud_service_id: cloud_service_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            if (params.release_region == true) {
                reqParams.release_region = true;
            } else {
                reqParams.region_id = params.region_id;
            }

            await inventoryV1.CloudService.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
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
        } catch (e) {
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
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await inventoryV1.CloudService.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
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
    const response = await inventoryV1.CloudService.list(params);

    return response;
};

const statCloudServices = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudService.stat(params);

    return response;
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

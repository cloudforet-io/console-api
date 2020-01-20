import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCloudService = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudService.create(params);

    return response;
};

const updateCloudService = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudService.update(params);

    return response;
};

const deleteCloudServices = async (params) => {
    if (!params.cloud_services) {
        throw new Error('Required Parameter. (key = cloud_services)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.cloud_services.map(async (cloud_service_id) => {
        try {
            let reqParams = {
                cloud_service_id: cloud_service_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.CloudService.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[cloud_service_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete cloud services. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getCloudService = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudService.get(params);

    return response;
};

const listCloudServices = async (params) => {
    changeQueryKeyword(params.query, ['cloud_service_id', 'cloud_service_type', 'provider']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudService.list(params);

    return response;
};

export {
    createCloudService,
    updateCloudService,
    deleteCloudServices,
    getCloudService,
    listCloudServices
};

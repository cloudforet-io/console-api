import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCollector = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.create(params);

    return response;
};

const updateCollector = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.update(params);

    return response;
};

const enableCollectors = async (params) => {
    if (!params.collectors) {
        throw new Error('Required Parameter. (key = collectors)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.collectors.map(async (collector_id) => {
        try {
            let reqParams = {
                collector_id: collector_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Collector.enable(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[collector_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to enable collectors. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const disableCollectors = async (params) => {
    if (!params.collectors) {
        throw new Error('Required Parameter. (key = collectors)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.collectors.map(async (collector_id) => {
        try {
            let reqParams = {
                collector_id: collector_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Collector.disable(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[collector_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to disable collectors. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const collectData = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.collect(params);

    return response;
};

const deleteCollectors = async (params) => {
    if (!params.collectors) {
        throw new Error('Required Parameter. (key = collectors)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.collectors.map(async (collector_id) => {
        try {
            let reqParams = {
                collector_id: collector_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Collector.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[collector_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete collectors. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getCollector = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.get(params);

    return response;
};

const listCollectors = async (params) => {
    changeQueryKeyword(params.query, ['collector_id', 'name']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.list(params);

    return response;
};

export {
    createCollector,
    updateCollector,
    enableCollectors,
    disableCollectors,
    collectData,
    deleteCollectors,
    getCollector,
    listCollectors
};

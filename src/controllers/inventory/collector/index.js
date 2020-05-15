import grpcClient from '@lib/grpc-client';
import { performance } from 'perf_hooks';
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
                collector_id: collector_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

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
                collector_id: collector_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

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
    const startTime = performance.now();
    let response = await inventoryV1.Collector.collect(params);
    const endTime = performance.now();
    console.log(`collecting data takes :  ${((endTime-startTime)/1000).toFixed(4)} seconds.`);
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
                collector_id: collector_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

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


const verifyPlugin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.verify_plugin(params);

    return response;
};


const addSchedule = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.add_schedule(params);

    return response;
};


const updateSchedule = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.update_schedule(params);

    return response;
};


const deleteSchedule = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.deleteSchedule(params);

    return response;
};

const listSchedules = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.list_schedules(params);

    return response;
};

const listCollectors = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.list(params);

    return response;
};

const statCollectors = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.stat(params);

    return response;
};

const getSchedule = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Collector.get_schedule(params);

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
    verifyPlugin,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    listSchedules,
    listCollectors,
    statCollectors,
    getSchedule
};

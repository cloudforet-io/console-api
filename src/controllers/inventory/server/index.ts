//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createServer = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.create(params);

    return response;
};

const updateServer = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.update(params);

    return response;
};

const deleteServer = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.delete(params);

    return response;
};

const changeServerState = async (params) => {
    if (!params.servers) {
        throw new Error('Required Parameter. (key = servers)');
    }

    if (!params.state) {
        throw new Error('Required Parameter. (key = state)');
    } else if (['INSERVICE', 'MAINTENANCE', 'CLOSED'].indexOf(params.state) < 0) {
        throw new Error('Invalid Parameter. (state = INSERVICE | MAINTENANCE | CLOSED)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.servers.map(async (server_id) => {
        try {

            const reqParams = {
                server_id: server_id,
                state: params.state,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await inventoryV1.Server.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error = new Error(`Failed to change server's state. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const changeServerProject = async (params) => {
    if (!params.servers) {
        throw new Error('Required Parameter. (key = servers)');
    }

    if (!(params.project_id || params.release_project)) {
        throw new Error('Required Parameter. (key = project_id or release_project)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.servers.map(async (server_id) => {
        try {
            const reqParams = {
                server_id: server_id
            };

            if (params.release_project == true) {
                reqParams.release_project = true;
            } else {
                reqParams.project_id = params.project_id;
            }

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Server.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error = new Error(`Failed to change server's project. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const changeServerPool = async (params) => {
    if (!params.servers) {
        throw new Error('Required Parameter. (key = servers)');
    }

    if (!(params.pool_id || params.release_pool)) {
        throw new Error('Required Parameter. (key = pool_id or release_pool)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.servers.map(async (server_id) => {
        try {
            const reqParams = {
                server_id: server_id
            };

            if (params.release_pool == true) {
                reqParams.release_pool = true;
            } else {
                reqParams.pool_id = params.pool_id;
            }

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Server.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error = new Error(`Failed to change server's pool. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const deleteServers = async (params) => {
    if (!params.servers) {
        throw new Error('Required Parameter. (key = servers)');
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.servers.map(async (server_id) => {
        try {
            const reqParams = {
                server_id: server_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Server.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error = new Error(`Failed to delete servers. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getServer = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.get(params);

    return response;
};

const listServers = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.list(params);

    return response;
};

const statServers = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.stat(params);

    return response;
};

export {
    createServer,
    updateServer,
    deleteServer,
    changeServerState,
    changeServerProject,
    changeServerPool,
    deleteServers,
    getServer,
    listServers,
    statServers
};

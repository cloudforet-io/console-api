import grpcClient from '@lib/grpc-client';
import { ErrorModel } from '@lib/error';

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
                ... params.domain_id && { domain_id : params.domain_id }
            };

            await inventoryV1.Server.update(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change server's state. (success: ${successCount}, failure: ${failCount})`);
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
            const reqParams: any = {
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
        } catch (e: any) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change server's project. (success: ${successCount}, failure: ${failCount})`);
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
            const reqParams: any = {
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
        } catch (e: any) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change server's pool. (success: ${successCount}, failure: ${failCount})`);
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
            const reqParams: any = {
                server_id: server_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Server.delete(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[server_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to delete servers. (success: ${successCount}, failure: ${failCount})`);
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

    params = addDateRangeFilter(params);

    const response = await inventoryV1.Server.list(params);

    return response;
};

const statServers = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Server.stat(params);

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

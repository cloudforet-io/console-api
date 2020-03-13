import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
import logger from '@lib/logger';

const getRegions = async (client, params) => {
    let reqParams = {
        query: params.query,
        domain_id: params.domain_id
    };

    let response = await client.Region.list(reqParams);
    let items = [];
    response.results.map((itemInfo) => {
        let item = {
            id: itemInfo.region_id,
            name: itemInfo.tags.description || itemInfo.name,
            has_child: true,
            item_type: 'REGION'
        };
        items.push(item);
    });

    return items;
};

const getZones = async (client, params) => {
    let reqParams = {
        query: params.query,
        region_id: params.item_id,
        domain_id: params.domain_id
    };

    let response = await client.Zone.list(reqParams);
    let items = [];
    response.results.map((itemInfo) => {
        let item = {
            id: itemInfo.zone_id,
            name: itemInfo.tags.description || itemInfo.name,
            has_child: true,
            item_type: 'ZONE'
        };
        items.push(item);
    });

    return items;
};

const getPools = async (client, params) => {
    let reqParams = {
        query: params.query,
        zone_id: params.item_id,
        domain_id: params.domain_id
    };

    let response = await client.Pool.list(reqParams);
    let items = [];
    response.results.map((itemInfo) => {
        let item = {
            id: itemInfo.pool_id,
            name: itemInfo.tags.description || itemInfo.name,
            has_child: false,
            item_type: 'POOL'
        };
        items.push(item);
    });

    return items;
};

const getParentItem = async (client, domainId, itemId, itemType, openItems = []) => {
    let reqParams = {
        query: {
        },
        domain_id: domainId
    };

    if (itemType == 'REGION') {
        reqParams.region_id = itemId;
        let response = await client.Region.list(reqParams);

        if (response.total_count == 1) {
            let regionInfo = response.results[0];
            openItems.unshift(regionInfo.region_id);
        }
    } else if (itemType == 'ZONE') {
        reqParams.zone_id = itemId;
        let response = await client.Zone.list(reqParams);

        if (response.total_count == 1) {
            let zoneInfo = response.results[0];
            openItems.unshift(zoneInfo.zone_id);

            let parentItemId = _.get(zoneInfo, 'region_info.region_id');
            if (parentItemId) {
                await getParentItem(
                    client,
                    domainId,
                    parentItemId,
                    'REGION',
                    openItems
                );
            }
        }
    } else if (itemType == 'POOL') {
        reqParams.pool_id = itemId;
        let response = await client.Pool.list(reqParams);

        if (response.total_count == 1) {
            let poolInfo = response.results[0];
            openItems.unshift(poolInfo.pool_id);

            let parentItemId = _.get(poolInfo, 'zone_info.zone_id');
            if (parentItemId) {
                await getParentItem(
                    client,
                    domainId,
                    parentItemId,
                    'ZONE',
                    openItems
                );
            }
        }
    }

    return openItems;
};

const treeDataCenter = async (params) => {
    if (!params.item_type) {
        throw new Error('Required Parameter. (key = item_type)');
    }

    if (params.item_type !== 'ROOT' && !params.item_id) {
        throw new Error('Required Parameter. (key = item_id)');
    }

    if (!params.query) {
        params.query = {};
    }
    params.query.minimal = true;

    if (params.sort) {
        params.query.sort = params.sort;
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = {
        open_items: [],
        items: []
    };

    if (params.search) {
        response.open_items = await getParentItem(
            inventoryV1,
            params.domain_id,
            params.search.item_id,
            params.search.item_type);
    }

    if (params.item_type == 'ROOT') {
        Array.prototype.push.apply(response.items, await getRegions(inventoryV1, params));
    } else if (params.item_type == 'REGION') {
        Array.prototype.push.apply(response.items, await getZones(inventoryV1, params));
    } else if (params.item_type == 'ZONE') {
        Array.prototype.push.apply(response.items, await getPools(inventoryV1, params));
    }

    return response;
};

export default treeDataCenter;

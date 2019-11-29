import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const ITEM_TYPES = ['server'];

const region_map = {
    "KR-AWS01": {
        latitude: 37.56,
        longitude: 126.98
    },
    "KR-IDC01": {
        latitude: 35.25,
        longitude: 128.86
    },
    "SP-GCP01": {
        latitude: 1.29,
        longitude: 103.85
    },
    "US-AZURE01": {
        latitude: 37.783,
        longitude: -122.417
    }
}

const getGeoInfo = (name, geo) => {
    return region_map[name] ? region_map[name][geo] : null
}

const makeResponse = (itemsInfo, itemType) => {
    let response = {};
    itemsInfo.map((itemInfo) => {
        if (itemType == 'region') {
            response[itemInfo.region_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0,
                latitude: itemInfo.tags.latitude || getGeoInfo(itemInfo.tags.description || itemInfo.name, 'latitude'),
                longitude: itemInfo.tags.longitude || getGeoInfo(itemInfo.tags.description || itemInfo.name, 'longitude'),
            };
        } else if (itemType == 'zone') {
            response[itemInfo.zone_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0
            };
        } else {
            response[itemInfo.pool_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0
            };
        }
    });

    return response;
};

const listRegions = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id,
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Region.list(reqParams);
    return makeResponse(response.results, 'region');
};

const listZones = async (inventoryV1, domain_id, region_id) => {
    let reqParams = {
        domain_id: domain_id,
        region_id: region_id,
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Zone.list(reqParams);
    return makeResponse(response.results, 'zone');
};

const listPools = async (inventoryV1, domain_id, zone_id) => {
    let reqParams = {
        domain_id: domain_id,
        zone_id: zone_id,
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Pool.list(reqParams);
    return makeResponse(response.results, 'pool');
};

const getServerCount = async (inventoryV1, domain_id, response, queryType, project_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    if (project_id) {
        reqParams.project_id = project_id;
    }

    let promises = Object.keys(response).map(async (itemId) => {
        if (queryType == 'region') {
            reqParams.region_id = itemId;
        } else if (queryType == 'zone') {
            reqParams.zone_id = itemId;
        } else {
            reqParams.pool_id = itemId;
        }

        let serverResponse = await inventoryV1.Server.list(reqParams);
        response[itemId].count = serverResponse.total_count;
    });

    await Promise.all(promises);

    return response;
};

const getDataCenterItems = async (params) => {
    if (!params.item_type) {
        throw new Error('Required parameter. (key = item_type)');
    } else {
        if (ITEM_TYPES.indexOf(params.item_type) < 0) {
            throw new Error(`Parameter is invalid. (item_type = ${params.item_type})`);
        }
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = {};
    let queryType = null;

    if (params.region_id) {
        queryType = 'zone';
        response = await listZones(inventoryV1, params.domain_id, params.region_id);
    } else if (params.zone_id) {
        queryType = 'pool';
        response = await listPools(inventoryV1, params.domain_id, params.zone_id);
    } else {
        queryType = 'region';
        response = await listRegions(inventoryV1, params.domain_id);
    }

    if (params.item_type == 'server') {
        response = await getServerCount(inventoryV1, params.domain_id, response, queryType, params.project_id);
    }

    return response;
};

export default getDataCenterItems;

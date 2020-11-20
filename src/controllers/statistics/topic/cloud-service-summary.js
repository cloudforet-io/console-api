import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const getComputeQuery = () => {
    return {
        'resource_type': 'inventory.Server',
        'query': {
            'aggregate': {
                'count': {
                    'name': 'total'
                }
            },
            'filter': []
        }
    };
};

const getDatabaseQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'count': {
                    'name': 'total'
                }
            },
            'filter': [
                {
                    'key': 'ref_cloud_service_type.labels',
                    'value': 'Database',
                    'operator': 'eq'
                },
                {
                    'key': 'ref_cloud_service_type.is_major',
                    'value': true,
                    'operator': 'eq'
                }
            ]
        }
    };
};

const getStorageQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'group': {
                    'fields': [
                        {
                            'key': 'data.size',
                            'name': 'total',
                            'operator': 'sum'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'ref_cloud_service_type.labels',
                    'value': 'Storage',
                    'operator': 'eq'
                },
                {
                    'key': 'ref_cloud_service_type.is_major',
                    'value': true,
                    'operator': 'eq'
                }
            ]
        }
    };
};

const SUPPORTED_LABELS = {
    'Compute': getComputeQuery,
    'Database': getDatabaseQuery,
    'Storage': getStorageQuery
};

const makeRequest = (params) => {
    if (!params.label) {
        throw new Error('Required Parameter. (key = label)');
    }

    if (Object.keys(SUPPORTED_LABELS).indexOf(params.label) < 0) {
        throw new Error(`label not supported. (support = ${Object.keys(SUPPORTED_LABELS).join(' | ')})`);
    }


    let requestParams = SUPPORTED_LABELS[params.label]();

    if (params.project_id) {
        requestParams['query']['filter'].push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const cloudServiceSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceSummary;

import grpcClient from '@lib/grpc-client';
import { getValueByPath } from '@lib/utils';
import { getServer, listServers } from '@controllers/inventory/server';
import { getCloudService } from '@controllers/inventory/cloud-service';
import { SUPPORTED_RESOURCE_TYPES } from './config';


const createSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.create(params);

    return response;
};

const updateSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.update(params);

    return response;
};

const deleteSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.delete(params);

    return response;
};

const getSpotGroup = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.get(params);

    return response;
};

const listSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.list(params);

    return response;
};

const interruptSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.interrupt(params);

    return response;
};

const statSpotGroups = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.stat(params);

    return response;
};

const getCandidates = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.SpotGroup.get_candidates(params);

    return response;
};


const getSupportedResourceTypes = () => {
    return SUPPORTED_RESOURCE_TYPES;
};


const getSpotGroupResource = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    const spotGroupInfo = await getSpotGroup({
        spot_group_id: params.spot_group_id,
        only: ['spot_group_id', 'resource_id', 'resource_type']
    });

    const requestParams = {};

    if (spotGroupInfo.resource_type === 'inventory.Server') {
        requestParams['server_id'] = spotGroupInfo.resource_id;
        return getServer(requestParams);
    } else if (spotGroupInfo.resource_type === 'inventory.CloudService') {
        requestParams['cloud_service_id'] = spotGroupInfo.resource_id;
        const cloudServiceInfo = getCloudService(requestParams);

        if (cloudServiceInfo['cloud_service_group'] === 'EKS' && cloudServiceInfo['cloud_service_type'] === 'NodeGroup') {
            // TODO: get ASG from EKS
            // return getCloudService(requestParams);
        } else {
            return cloudServiceInfo;
        }
    }

    return null;
};


const getSpotGroupServers = async (params) => {
    const resourceInfo = await getSpotGroupResource(params);
    const resourceType = `${resourceInfo['provider']}.${resourceInfo['cloud_service_group']}.${resourceInfo['cloud_service_type']}`;
    let results = [];

    if (resourceType === 'aws.EC2.AutoScalingGroup') {
        const instanceIds = getValueByPath(resourceInfo, 'data.instances.instance_id');
        const requestParams = {
            query: {
                filter: [
                    {
                        k: 'reference.resource_id',
                        v: instanceIds,
                        o: 'in'
                    }
                ],
                only: ['server_id', 'name']
            }
        };
        const serversInfo = await listServers(requestParams);
        results = serversInfo.results.map((serverInfo) => {
            return {
                server_id: serverInfo.server_id,
                name: serverInfo.name
            };
        });
    }

    return {
        'results': results
    };
};


export {
    createSpotGroup,
    updateSpotGroup,
    deleteSpotGroup,
    getSpotGroup,
    listSpotGroups,
    interruptSpotGroups,
    statSpotGroups,
    getCandidates,
    getSupportedResourceTypes,
    getSpotGroupServers
};

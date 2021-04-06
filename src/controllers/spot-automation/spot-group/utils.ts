import { getValueByPath } from '@lib/utils';
import { listSpotGroups } from '@controllers/spot-automation/spot-group';
import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listServers } from '@controllers/inventory/server';

export const listSpotGroupResources = async (spotGroups) => {
    const spotGroupsInfo = await listSpotGroups({
        query: {
            filter: [
                {
                    k: 'spot_group_id',
                    v: spotGroups,
                    o: 'in'
                }
            ]
        },
        only: ['spot_group_id', 'resource_id', 'resource_type']
    });

    const cloudServiceMap = {};

    spotGroupsInfo.results.forEach((spotGroupInfo) => {
        cloudServiceMap[spotGroupInfo.resource_id] = spotGroupInfo.spot_group_id;
    });

    const requestParams = {
        query: {
            filter: [
                {
                    k: 'cloud_service_id',
                    v: Object.keys(cloudServiceMap),
                    o: 'in'
                }
            ],
            only: ['cloud_service_id', 'provider', 'cloud_service_group', 'cloud_service_type',
                'data.instances', 'data.load_balancers']
        }
    };

    const response = await listCloudServices(requestParams);
    const spotGroupResourcesInfo = {};

    response.results.forEach((cloudServiceInfo) => {
        if (cloudServiceInfo['cloud_service_group'] === 'EKS' && cloudServiceInfo['cloud_service_type'] === 'NodeGroup') {
            // TODO: get ASG from EKS
        } else {
            spotGroupResourcesInfo[cloudServiceMap[cloudServiceInfo['cloud_service_id']]] = cloudServiceInfo;
        }
    });

    return spotGroupResourcesInfo;
};

export const listSpotGroupServers = async (spotGroups) => {
    const spotGroupResourcesInfo = await listSpotGroupResources(spotGroups);
    const spotGroupServers = {};

    const promises = Object.keys(spotGroupResourcesInfo).map(async (spotGroupId) => {
        const resourceInfo = spotGroupResourcesInfo[spotGroupId];
        const resourceType = `${resourceInfo['provider']}.${resourceInfo['cloud_service_group']}.${resourceInfo['cloud_service_type']}`;

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
            const response = await listServers(requestParams);
            spotGroupServers[spotGroupId] = response.results.map((serverInfo) => {
                return {
                    server_id: serverInfo.server_id,
                    name: serverInfo.name
                };
            });
        }
    });

    await Promise.all(promises);

    return spotGroupServers;
};

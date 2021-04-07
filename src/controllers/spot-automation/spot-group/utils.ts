import { getValueByPath } from '@lib/utils';
import { listSpotGroups } from '@controllers/spot-automation/spot-group';
import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listServers } from '@controllers/inventory/server';

const DEFAULT_ONLY_FIELDS = ['cloud_service_id', 'provider', 'cloud_service_group', 'cloud_service_type'];

export const listSpotGroupResources = async (spotGroups: Array<string>, only: Array<string> = []) => {
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
            only: only.concat(DEFAULT_ONLY_FIELDS)
        }
    };

    const response = await listCloudServices(requestParams);
    const spotGroupResourcesInfo = {};

    const promises = response.results.map(async (cloudServiceInfo) => {
        if (cloudServiceInfo['cloud_service_group'] === 'EKS' && cloudServiceInfo['cloud_service_type'] === 'NodeGroup') {
            const autoScalingGroupsARN = getValueByPath(cloudServiceInfo, 'data.resources.auto_scaling_groups.arn');
            const requestParams = {
                query: {
                    filter: [
                        {
                            k: 'reference.resource_id',
                            v: autoScalingGroupsARN,
                            o: 'in'
                        }
                    ],
                    only: only.concat(DEFAULT_ONLY_FIELDS)
                }
            };
            const response = await listCloudServices(requestParams);
            if (response.total_count > 0) {
                spotGroupResourcesInfo[cloudServiceMap[cloudServiceInfo['cloud_service_id']]] = response.results[0];
            }
        } else {
            spotGroupResourcesInfo[cloudServiceMap[cloudServiceInfo['cloud_service_id']]] = cloudServiceInfo;
        }
    });
    await Promise.all(promises);

    return spotGroupResourcesInfo;
};

export const getSpotGroupResource = async (spotGroupId: string, only: Array<string> = []) => {
    const spotGroupResourcesInfo = await listSpotGroupResources([spotGroupId], only);
    return spotGroupResourcesInfo[spotGroupId];
};

export const listSpotGroupServers = async (spotGroups: Array<string>) => {
    const spotGroupResourcesInfo = await listSpotGroupResources(spotGroups, ['data.instances']);
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

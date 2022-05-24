import { listCloudServices } from '@controllers/inventory/cloud-service';
import { listSpotGroups } from '@controllers/spot-automation/spot-group';
import { getValueByPath } from '@lib/utils';

const getSpotGroupResources = async () => {
    const spotGroupsInfo = await listSpotGroups({
        query: {
            only: ['spot_group_id', 'resource_id', 'resource_type']
        }
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
            only: ['cloud_service_id', 'provider', 'cloud_service_group', 'cloud_service_type']
        }
    };

    const response = await listCloudServices(requestParams);
    const results: Array<object> = [];

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
                    only: ['cloud_service_id', 'provider', 'cloud_service_group', 'cloud_service_type']
                }
            };
            const response = await listCloudServices(requestParams);
            if (response.total_count > 0) {
                const autoScalingGroupInfo = response.results[0];
                results.push({
                    cloud_service_id: autoScalingGroupInfo['cloud_service_id'],
                    provide: autoScalingGroupInfo['provider'],
                    cloud_service_group: autoScalingGroupInfo['cloud_service_group'],
                    cloud_service_type: autoScalingGroupInfo['cloud_service_type'],
                    spot_group_id: cloudServiceMap[autoScalingGroupInfo['cloud_service_id']]
                });
            }
        }
        results.push({
            cloud_service_id: cloudServiceInfo['cloud_service_id'],
            provide: cloudServiceInfo['provider'],
            cloud_service_group: cloudServiceInfo['cloud_service_group'],
            cloud_service_type: cloudServiceInfo['cloud_service_type'],
            spot_group_id: cloudServiceMap[cloudServiceInfo['cloud_service_id']]
        });
    });
    await Promise.all(promises);

    return {
        results: results
    };
};

export default getSpotGroupResources;

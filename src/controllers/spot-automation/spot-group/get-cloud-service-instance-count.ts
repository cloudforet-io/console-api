import { getValueByPath } from '@lib/utils';
import { getCloudService, listCloudServices } from '@controllers/inventory/cloud-service';

const getCloudServiceInfo = async (cloudServiceId) => {
    const cloudServiceInfo = await getCloudService({ cloud_service_id: cloudServiceId });
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
                only: ['data.desired_capacity']
            }
        };
        const response = await listCloudServices(requestParams);
        if (response.total_count > 0) {
            return response.results[0];
        }
    } else {
        return cloudServiceInfo;
    }
};

const getCloudServiceInstanceCount = async (params) => {
    if (!params.cloud_service_id) {
        throw new Error('Required Parameter. (key = cloud_service_id)');
    }

    const cloudServiceInfo = await getCloudServiceInfo(params.cloud_service_id);
    const instanceCount = getValueByPath(cloudServiceInfo, 'data.desired_capacity');
    return {
        count: instanceCount || 0
    };
};

export default getCloudServiceInstanceCount;

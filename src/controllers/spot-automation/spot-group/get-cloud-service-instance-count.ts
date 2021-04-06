import { getValueByPath } from '@lib/utils';
import { getCloudService } from '@controllers/inventory/cloud-service';

const getCloudServiceInfo = async (cloudServiceId) => {
    const cloudServiceInfo = await getCloudService({cloud_service_id: cloudServiceId});
    if (cloudServiceInfo['cloud_service_group'] === 'EKS' && cloudServiceInfo['cloud_service_type'] === 'NodeGroup') {
        // TODO: get ASG from EKS
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
        count: instanceCount
    };
};


export default getCloudServiceInstanceCount;

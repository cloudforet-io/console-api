import { getValueByPath } from '@lib/utils';
import { getSpotGroup } from '@controllers/spot-automation/spot-group';
import { listServers } from '@controllers/inventory/server';
import { getCloudService } from '@controllers/inventory/cloud-service';


const getSpotGroupResource = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    const spotGroupInfo = await getSpotGroup({
        spot_group_id: params.spot_group_id,
        only: ['spot_group_id', 'resource_id', 'resource_type']
    });

    const requestParams = {
        'cloud_service_id': spotGroupInfo.resource_id
    };

    const cloudServiceInfo = getCloudService(requestParams);

    if (cloudServiceInfo['cloud_service_group'] === 'EKS' && cloudServiceInfo['cloud_service_type'] === 'NodeGroup') {
        // TODO: get ASG from EKS
        // return getCloudService(requestParams);
    }

    return cloudServiceInfo;
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


export default getSpotGroupServers;

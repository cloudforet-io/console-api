import { getValueByPath } from '@lib/utils';

import { listSpotGroupResources } from './utils';


const makeResponse = (spotGroupResources) => {
    const spotGroupsCount = {};

    Object.keys(spotGroupResources).forEach((spotGroupId) => {
        const resourceInfo = spotGroupResources[spotGroupId];
        const InstancesState = getValueByPath(resourceInfo, 'data.instances.health_status');
        let total = 0;
        let healthy = 0;
        let unhealthy = 0;

        InstancesState.forEach((lifecycle) => {
            if (lifecycle === 'Healthy') {
                healthy++;
            } else {
                unhealthy++;
            }
            total++;
        });

        spotGroupsCount[spotGroupId] = {
            total,
            healthy,
            unhealthy,
            state: (unhealthy > 0)? 'unhealthy': 'healthy'
        };
    });

    return {
        spot_groups: spotGroupsCount
    };
};

const getSpotGroupInstanceState = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupResources = await listSpotGroupResources(params.spot_groups, ['data.instances']);
    return makeResponse(spotGroupResources);
};


export default getSpotGroupInstanceState;

import { getValueByPath } from '@lib/utils';

import { listSpotGroupResources } from './utils';


const makeResponse = (spotGroupResources) => {
    const spotGroupsCount = {};

    Object.keys(spotGroupResources).forEach((spotGroupId) => {
        const resourceInfo = spotGroupResources[spotGroupId];
        const instanceLifecycles = getValueByPath(resourceInfo, 'data.instances.lifecycle');
        let total = 0;
        let ondemand = 0;
        let spot = 0;

        instanceLifecycles.forEach((lifecycle) => {
            if (lifecycle === 'scheduled') {
                ondemand++;
            } else {
                spot++;
            }
            total++;
        });

        spotGroupsCount[spotGroupId] = {
            total,
            ondemand,
            spot
        };
    });

    return {
        spot_groups: spotGroupsCount
    };
};

const getSpotGroupInstanceCount = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupResources = await listSpotGroupResources(params.spot_groups, ['data.instances']);
    return makeResponse(spotGroupResources);
};


export default getSpotGroupInstanceCount;

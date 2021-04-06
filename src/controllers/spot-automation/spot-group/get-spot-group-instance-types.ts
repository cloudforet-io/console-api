import { getValueByPath } from '@lib/utils';
import { listSpotGroupResources } from './utils';


const makeResponse = (spotGroupResources) => {
    const spotGroupsCount = {};

    Object.keys(spotGroupResources).forEach((spotGroupId) => {
        spotGroupsCount[spotGroupId] = {};
        const resourceInfo = spotGroupResources[spotGroupId];
        const instanceTypes = getValueByPath(resourceInfo, 'data.instances.instance_type');

        instanceTypes.forEach((instanceType) => {
            if (spotGroupsCount[spotGroupId]) {
                if (!spotGroupsCount[spotGroupId][instanceType]) {
                    spotGroupsCount[spotGroupId][instanceType] = 1;
                } else {
                    spotGroupsCount[spotGroupId][instanceType]++;
                }
            }
        });
    });

    return {
        spot_groups: spotGroupsCount
    };
};

const getSpotGroupInstanceTypes = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupResources = await listSpotGroupResources(params.spot_groups);
    return makeResponse(spotGroupResources);
};


export default getSpotGroupInstanceTypes;

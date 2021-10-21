import { listSpotGroupResources } from './utils';


const makeResponse = (spotGroupResources) => {
    const spotGroupsCount = {};

    Object.keys(spotGroupResources).forEach((spotGroupId) => {
        const resourceInfo = spotGroupResources[spotGroupId];
        spotGroupsCount[spotGroupId] = resourceInfo?.data?.load_balancers?.length || 0;
    });

    return {
        spot_groups: spotGroupsCount
    };
};

const getSpotGroupLoadBalancerCount = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupResources = await listSpotGroupResources(params.spot_groups, ['data.load_balancers']);
    return makeResponse(spotGroupResources);
};


export default getSpotGroupLoadBalancerCount;

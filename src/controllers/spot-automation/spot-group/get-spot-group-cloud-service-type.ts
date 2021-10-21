import { SERVICE_TYPE } from '@controllers/spot-automation/spot-group/config';
import { listSpotGroupResources } from '@controllers/spot-automation/spot-group/utils';

const makeResponse = (spotGroupResources) => {
    const spotGroupsType = {};

    Object.keys(spotGroupResources).forEach((spotGroupId) => {
        const resourceInfo = spotGroupResources[spotGroupId];
        spotGroupsType[spotGroupId] = SERVICE_TYPE[resourceInfo?.cloud_service_type];
    });

    return {
        spot_groups: spotGroupsType
    };
};

const getSpotGroupCloudServiceType = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupResources = await listSpotGroupResources(params.spot_groups, ['cloud_service_type']);
    return makeResponse(spotGroupResources);

};

export default getSpotGroupCloudServiceType;

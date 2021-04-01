import { getValueByPath } from '@lib/utils';
import { listSpotGroups } from '@controllers/spot-automation/spot-group';
import { statCloudServices } from '@controllers/inventory/cloud-service';


const getSpotGroupResourceMap = async (spotGroupIds) => {
    const requestParams = {
        query: {
            filter: [
                {
                    k: 'spot_group_id',
                    v: spotGroupIds,
                    o: 'in'
                }
            ],
            only: ['spot_group_id', 'resource_id', 'resource_type']
        }
    };

    const spotGroupsInfo = await listSpotGroups(requestParams);
    const spotGroupMap = {};

    spotGroupsInfo.results.forEach((spotGroupInfo) => {
        spotGroupMap[spotGroupInfo.resource_id] = spotGroupInfo.spot_group_id;
    });

    return spotGroupMap;
};

const statAutoScalingGroupInstanceCount = async (spotGroupMap) => {
    const requestParams = {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'cloud_service_id',
                                name: 'cloud_service_id'
                            },
                            {
                                key: 'data.instances.lifecycle',
                                name: 'lifecycle'
                            }
                        ]
                    }
                }
            ],
            filter: [
                {
                    k: 'cloud_service_id',
                    v: Object.keys(spotGroupMap),
                    o: 'in'
                }
            ]
        }
    };

    return await statCloudServices(requestParams);
};

const makeResponse = (allSpotGroupIds, spotGroupMap, statResponse) => {
    const spotGroupsCount = {};

    allSpotGroupIds.forEach((spotGroupId) => {
        spotGroupsCount[spotGroupId] = {
            total: 0,
            spot: 0,
            ondemand: 0
        };
    });

    statResponse.results.forEach((data) => {
        const spotGroupId = spotGroupMap[data.cloud_service_id];
        let total = 0;
        let ondemand = 0;
        let spot = 0;

        data.lifecycle.forEach((lifecycle) => {
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

    const spotGroupMap = await getSpotGroupResourceMap(params.spot_groups);
    const statResponse = await statAutoScalingGroupInstanceCount(spotGroupMap);
    return makeResponse(params.spot_groups, spotGroupMap, statResponse);
};


export default getSpotGroupInstanceCount;

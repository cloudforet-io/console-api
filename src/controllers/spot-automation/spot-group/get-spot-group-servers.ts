import { listSpotGroupServers } from './utils';

const getSpotGroupServers = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    const spotGroupServers = await listSpotGroupServers([params.spot_group_id]);

    return {
        results: spotGroupServers[params.spot_group_id] || []
    };
};

export default getSpotGroupServers;

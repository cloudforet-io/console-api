import { listSpotGroupServers } from './utils';
import { statServers } from '@controllers/inventory/server';


const makeResponse = async (spotGroupServers) => {
    const spotGroupsCPUUtilization = {};

    const promises = Object.keys(spotGroupServers).map(async (spotGroupId) => {
        const serverIds = spotGroupServers[spotGroupId].map((serverInfo) => {
            return serverInfo.server_id;
        });

        const requestParams = {
            query: {
                aggregate: [
                    {
                        group: {
                            fields: [
                                {
                                    key: 'data.monitoring.cpu.utilization.avg',
                                    name: 'cpu_utilization',
                                    operator: 'average'
                                }
                            ]
                        }
                    }
                ],
                filter: [
                    {
                        k: 'server_id',
                        v: serverIds,
                        o: 'in'
                    }
                ]
            }
        };

        const response = await statServers(requestParams);
        spotGroupsCPUUtilization[spotGroupId] = {
            cpu_utilization: (response.results.length > 0)?response.results[0].cpu_utilization: 0
        };
    });

    await Promise.all(promises);

    return {
        spot_groups: spotGroupsCPUUtilization
    };
};

const getSpotGroupInstanceCPU = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupServers = await listSpotGroupServers(params.spot_groups);
    return await makeResponse(spotGroupServers);
};


export default getSpotGroupInstanceCPU;

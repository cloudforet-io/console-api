import { statServers } from '@controllers/inventory/server';

import { listSpotGroupServers } from './utils';


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
                                    key: 'data.monitoring.disk.write_iops.avg',
                                    name: 'write_iops',
                                    operator: 'average'
                                },
                                {
                                    key: 'data.monitoring.disk.read_iops.avg',
                                    name: 'read_iops',
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
        if (response.results.length > 0) {
            const write_iops = Math.ceil(response.results[0].write_iops) || 0;
            const read_iops = Math.ceil(response.results[0].read_iops) || 0;
            const total_iops = write_iops + read_iops;
            spotGroupsCPUUtilization[spotGroupId] = {
                write_iops,
                read_iops,
                total_iops
            };
        } else {
            spotGroupsCPUUtilization[spotGroupId] = {
                write_iops: 0,
                read_iops: 0,
                total_iops: 0
            };
        }
    });

    await Promise.all(promises);

    return {
        spot_groups: spotGroupsCPUUtilization
    };
};

const getSpotGroupInstanceDisk = async (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const spotGroupServers = await listSpotGroupServers(params.spot_groups);
    return await makeResponse(spotGroupServers);
};


export default getSpotGroupInstanceDisk;

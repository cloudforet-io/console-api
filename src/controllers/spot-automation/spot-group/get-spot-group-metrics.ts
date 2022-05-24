import { listDataSources } from '@controllers/monitoring/data-source';
import { listMetrics } from '@controllers/monitoring/metric';
import { getSpotGroup } from '@controllers/spot-automation/spot-group';

import { listSpotGroupServers } from './utils';


const METRIC_MAP = {
    aws: {
        CPU: [
            {
                key: 'CPUUtilization',
                name: 'CPUUtilization',
                unit: {
                    x: 'Timestamp',
                    y: 'Percent'
                },
                chart_type: 'line',
                chart_options: {}
            }
        ],
        DISK: [
            'EBSWriteOps',
            'EBSReadOps',
            'EBSWriteBytes',
            'EBSReadBytes',
            'DiskWriteOps',
            'DiskReadOps',
            'DiskWriteBytes',
            'DiskReadBytes'
        ]
    }
};

const getServerMetrics = async (provider, metricType, dataSourceId, spotGroupId) => {
    if (metricType === 'CPU') {
        return METRIC_MAP[provider][metricType];
    } else {
        const spotGroupServers = await listSpotGroupServers([spotGroupId]);
        if (spotGroupServers[spotGroupId]) {
            const serverIds = spotGroupServers[spotGroupId].map((serverInfo) => {
                return serverInfo.server_id;
            }) ;
            const response = await listMetrics({
                data_source_id: dataSourceId,
                resource_type: 'inventory.Server',
                resources: serverIds
            });

            return response.metrics.filter((metricInfo) => METRIC_MAP[provider][metricType].indexOf(metricInfo.key) >= 0);

        } else {
            return [];
        }
    }
};

const getSpotGroupMetrics = async (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    if (!params.metric_type) {
        throw new Error('Required Parameter. (key = metric_type)');
    } else if (['CPU', 'DISK'].indexOf(params.metric_type) < 0) {
        throw new Error('Invalid Parameter. (state = CPU | DISK)');
    }

    const spotGroupInfo = await getSpotGroup(params);
    const provider = spotGroupInfo.provider;

    const response = await listDataSources({ provider, monitoring_type: 'METRIC' });

    if (response.total_count > 0) {
        const dataSourceId = response.results[0].data_source_id;
        const metricType = params.metric_type;
        const spotGroupId = params.spot_group_id;
        return {
            data_source_id: dataSourceId,
            metrics: await getServerMetrics(provider, metricType, dataSourceId, spotGroupId)
        };
    } else {
        throw new Error(`Monitoring data source is not installed. (provider = ${provider})`);
    }
};

export default getSpotGroupMetrics;

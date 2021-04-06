import { getSpotGroup } from '@controllers/spot-automation/spot-group';
import { listDataSources } from '@controllers/monitoring/data-source';

const METRIC_MAP = {
    'aws': {
        'CPU': ['CPUUtilization'],
        'DISK': [
            'EBSWriteOps',
            'EBSReadOps',
            'EBSWriteBytes',
            'EBSReadBytes'
        ]
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

    const response = await listDataSources({provider, monitoring_type: 'METRIC'});

    if (response.total_count > 0) {
        return {
            'data_source_id': response.results[0].data_source_id,
            'metrics': METRIC_MAP[provider][params.metric_type]
        };
    } else {
        throw new Error(`Monitoring data source is not installed. (provider = ${provider})`);
    }
};

export default getSpotGroupMetrics;

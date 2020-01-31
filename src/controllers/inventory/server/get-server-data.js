import { getServer } from '@controllers/inventory/server';
import _ from 'lodash';
import { pageItems, filterItems } from '@lib/utils';
import logger from '@lib/logger';

const DATA_KEY_MAP = {
    disk: {
        key: 'disks',
        filterKeys: ['device', 'disk_id']
    },
    nic: {
        key: 'nics',
        filterKeys: ['device', 'mac_address', 'ip_addresses.ip_address']
    },
    security_group: {
        key: 'data.compute.security_group_rules',
        filterKeys: [
            'security_group_id',
            'security_group_name',
            'protocol',
            'direction',
            'port_range_min',
            'port_range_max',
            'remote_cidr',
            'remote_group_id'
        ]
    }
};

const getServerData = async (params) => {
    if (!params.key_path) {
        throw new Error('Required Parameter. (key = key_path)');
    }

    let query = params.query || {};
    let serverInfo = await getServer(params);
    let data = _.get(serverInfo, params.key_path);

    if (!Array.isArray(data)) {
        throw new Error('Only array value type is supported.');
    }

    let response = {
        results: data || []
    };

    if (query.keyword && data.length > 0) {
        response.results = filterItems(response.results, query.keyword, Object.keys(data[0]));
    }

    response.total_count = response.results.length;

    if (query.page) {
        response.results = pageItems(response.results, query.page);
    }

    return response;
};

export default getServerData;

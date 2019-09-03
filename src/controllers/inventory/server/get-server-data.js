import { getServer } from '@controllers/inventory/server';
import _ from 'lodash';
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
        key: 'compute.security_group',
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

const pageItems = (items, page) => {
    if (page.start) {
        if (page.limit) {
            return items.slice((page.start-1), (page.start+page.limit-1));
        } else {
            return items.slice(page.start-1);
        }
    }

    return items;
};

const filterItems = (items, keyword, filterKeys) => {
    return _.filter(items, function(item) {
        return _.includes(item, keyword);
    });
};

const getServerData = async (params) => {
    if (!params.data_type) {
        throw new Error('Required Parameter. (key = data_type)');
    } else if (Object.keys(DATA_KEY_MAP).indexOf(params.data_type) < 0) {
        throw new Error(`Invalid Parameter. (data_type = ${Object.keys(DATA_KEY_MAP).join(' | ')})`);
    }

    let query = params.query || {};
    let serverInfo = await getServer(params);
    let dataKey = DATA_KEY_MAP[params.data_type];
    let data = _.get(serverInfo, dataKey.key);

    let response = {
        results: data || []
    };

    if (query.keyword) {
        response.results = filterItems(response.results, query.keyword, dataKey.filterKeys);
    }

    if (query.page) {
        response.results = pageItems(response.results, query.page);
    }

    response.total_count = response.results.length;

    return response;
};

export default getServerData;

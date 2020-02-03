import { getNetwork } from '@controllers/inventory/network';
import _ from 'lodash';
import { pageItems, filterItems } from '@lib/utils';
import logger from '@lib/logger';


const getData = async (params) => {
    if (!params.key_path) {
        throw new Error('Required Parameter. (key = key_path)');
    }

    let query = params.query || {};
    let itemInfo = await getNetwork(params);
    let data = _.get(itemInfo, params.key_path);

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

export default getData;

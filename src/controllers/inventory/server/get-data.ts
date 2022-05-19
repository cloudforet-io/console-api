import { getServer } from '@controllers/inventory/server';
import { pageItems, filterItems, sortItems, getValueByPath } from '@lib/utils';


const getData = async (params) => {
    if (!params.key_path) {
        throw new Error('Required Parameter. (key = key_path)');
    }

    const query = params.query || {};
    const itemInfo = await getServer(params);
    const data = params.key_path ? getValueByPath(itemInfo, params.key_path) : itemInfo;

    if (!Array.isArray(data)) {
        throw new Error('Only array value type is supported.');
    }

    const response = {
        results: data || [],
        total_count: 0
    };

    if (query.keyword && data.length > 0) {
        response.results = filterItems(response.results, query.keyword, Object.keys(data[0]));
    }

    if (query.sort && query.sort.key) {
        response.results = sortItems(response.results, query.sort);
    }

    response.total_count = response.results.length;

    if (query.page) {
        response.results = pageItems(response.results, query.page);
    }

    return response;
};

export default getData;

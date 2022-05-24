import { cloneDeep } from 'lodash';

import { statServers } from '@controllers/inventory/server';
import { requestCache } from '@controllers/statistics/topic/request-cache';

const makeRequest = (params) => {
    if (!params.default_query) {
        throw new Error('Required Parameter. (key = default_query)');
    }

    params.query = params.default_query;
    params.query.filter = params.query.filter || [];
    params.query.filter_or = params.query.filter_or || [];

    if (params.filter) {
        params.query.filter = params.query.filter.concat(cloneDeep(params.filter));
    }

    if (params.limit) {
        params.query.aggregate.push({
            limit: params.limit
        });
    }

    if (params.keyword) {
        params.query.keyword = params.keyword;
    }

    if (params.date_range) {
        const start = params.date_range.start;
        const end = params.date_range.end;
        if (!start) {
            throw new Error('Required Parameter. (key = date_range.start)');
        }

        if (!end) {
            throw new Error('Required Parameter. (key = date_range.end)');
        }

        params.query.filter.push(
            { k: 'state', v: ['ACTIVE', 'DELETED'], o: 'in' }
        );
        params.query.filter.push(
            { k: 'created_at', v: end, o: 'datetime_lte' }
        );
        params.query.filter_or.push(
            { k: 'deleted_at', v: start, o: 'datetime_gte' }
        );
        params.query.filter_or.push(
            { k: 'deleted_at', v: null, o: 'eq' }
        );
    }

    params.query.aggregate.push({
        sort: {
            key: 'value',
            desc: true
        }
    });

    return params;
};

const requestStat = async (params) => {
    const requestParams = makeRequest(params);
    return await statServers(requestParams);
};

export const analyzeServers = async (params) => {
    return await requestCache('stat:analyzeServers', params, requestStat);
};

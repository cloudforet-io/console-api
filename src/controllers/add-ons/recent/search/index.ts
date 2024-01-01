import httpContext from 'express-http-context';

import { RecentCreateRequestBody, RecentListRequestBody, recentType } from '@controllers/add-ons/recent/type';
import grpcClient from '@lib/grpc-client';


const getClient = () => {
    return grpcClient.get('config');
};

export const listRecentSearch = async ({ type, limit }: RecentListRequestBody) => {
    if (type && recentType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${recentType.join(' | ')} )`);
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');
    return await configV1.UserConfig.list({
        user_id: userId,
        query: {
            filter: [{
                k: 'name',
                v: type ? `console:recent-search:${type}:` : 'console:recent-search:',
                o: 'contain'
            }],
            page: {
                limit: limit ?? 15
            },
            sort: [{
                key: 'updated_at',
                desc: true
            }]
        }
    });
};

export const createRecentSearch = async ({ type, workspace_id, id }: RecentCreateRequestBody) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (recentType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${recentType.join(' | ')} )`);
    } else if (!workspace_id) {
        throw new Error('Required Parameter. (key = workspace_id)');
    } else if (!id) {
        throw new Error('Required Parameter. (key = id)');
    }

    const userId = httpContext.get('user_id');
    const configV1 = await getClient();
    return await configV1.UserConfig.set({
        user_id: userId,
        name: `console:recent-search:${type}:${workspace_id}:${id}`,
        data: {
            type: type,
            workspace_id: workspace_id,
            id: id
        }
    });
};

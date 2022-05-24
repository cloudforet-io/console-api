import httpContext from 'express-http-context';

import { RecentCreateRequestBody, RecentListRequestBody, recentType } from '@controllers/add-ons/recent/type';
import grpcClient from '@lib/grpc-client';


const getClient = () => {
    return grpcClient.get('config');
};

export const listRecentVisit = async ({ type, limit }: RecentListRequestBody) => {
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
                v: type ? `console:recent-visit:${type}:` : 'console:recent-visit:',
                o: 'contain'
            }],
            page: {
                limit: limit ?? 15
            },
            sort: {
                key: 'updated_at',
                desc: true
            }
        }
    });
};

export const createRecentVisit = async ({ type, id }: RecentCreateRequestBody) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (recentType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${recentType.join(' | ')} )`);
    } else if (!id) {
        throw new Error('Required Parameter. (key = id)');
    }

    const userId = httpContext.get('user_id');
    const configV1 = await getClient();
    return await configV1.UserConfig.set({
        user_id: userId,
        name: `console:recent-visit:${type}:${id}`,
        data: {
            type: type,
            id: id
        }
    });
};

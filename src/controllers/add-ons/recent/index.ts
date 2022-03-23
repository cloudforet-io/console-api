import { RecentCreateRequestBody, RecentListRequestBody } from '@controllers/add-ons/recent/type';
import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import dayjs from 'dayjs';


const getClient = () => {
    return grpcClient.get('config');
};

export const listRecent = async ({ type, limit }: RecentListRequestBody) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (['MENU', 'CLOUD_SERVICE'].indexOf(type) < 0) {
        throw new Error('Invalid Parameter. (type = MENU | CLOUD_SERVICE)');
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');
    return await configV1.UserConfig.list({
        user_id: userId,
        query: {
            filter: [{
                k: 'name',
                v: `console:recent:${type}:`,
                o: 'contain'
            }],
            page: {
                limit
            },
            only: ['data', 'updated_at']
        }
    });
};

export const createRecent = async ({ type, id, data }: RecentCreateRequestBody) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (['MENU', 'CLOUD_SERVICE'].indexOf(type) < 0) {
        throw new Error('Invalid Parameter. (type = MENU | CLOUD_SERVICE)');
    } else if (!id) {
        throw new Error('Required Parameter. (key = id)');
    } else if (!data || !Object.keys(data).length) {
        throw new Error('Required Parameter. (key = data)');
    }

    const userId = httpContext.get('user_id');
    const name = `console:recent:${type}:${id}`;

    // check item exists
    const configV1 = await getClient();
    const { results } = await configV1.UserConfig.list({
        user_id: userId,
        name
    });

    // create or update item
    if (!results.length) {
        return await configV1.UserConfig.create({
            user_id: userId,
            name,
            data
        });
    }
    return await configV1.UserConfig.update({
        name,
        updated_at: dayjs.utc().toISOString()
    });
};

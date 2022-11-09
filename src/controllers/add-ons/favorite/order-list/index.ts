import httpContext from 'express-http-context';

import { CreateFavoriteOrderListParams, getFavoriteOrderListParams } from '@controllers/add-ons/favorite/order-list/type';
import { favoriteType } from '@controllers/add-ons/favorite/type';
import grpcClient from '@lib/grpc-client';


const getClient = () => {
    return grpcClient.get('config');
};


export const setFavoritesOrderList = async ({ type, order_list }: CreateFavoriteOrderListParams) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (!Array.isArray(order_list)) {
        throw new Error('Required Parameter. (order_list = values are required in string array format)');
    } else if (type && favoriteType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${favoriteType.join(' | ')} )`);
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');

    return await configV1.UserConfig.set({
        user_id: userId,
        name: `console:favorite:order-list:${type}`,
        data: {
            order_list: order_list
        }
    });
};


export const getFavoritesOrderList = async ({ type }: getFavoriteOrderListParams) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (type && favoriteType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${favoriteType.join(' | ')} )`);
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');

    return await configV1.UserConfig.list({
        user_id: userId,
        query: {
            filter: [{
                k: 'name',
                v: `console:favorite:order-list:${type}`,
                o: 'contain'
            }],
            only: ['data']
        }
    });
};

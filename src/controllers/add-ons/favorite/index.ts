import httpContext from 'express-http-context';

import { CreateFavoriteParams, DeleteFavoriteParams, ListFavoriteParams, favoriteType } from '@controllers/add-ons/favorite/type';
import grpcClient from '@lib/grpc-client';


const getClient = () => {
    return grpcClient.get('config');
};


export const createFavorite = async ({ type, id }: CreateFavoriteParams) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (type && favoriteType.indexOf(type) < 0) {
        throw new Error(`Invalid Parameter. (type = ${favoriteType.join(' | ')} )`);
    } else if (!id) {
        throw new Error('Invalid Parameter. (key = id)');
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');
    return await configV1.UserConfig.set({
        user_id: userId,
        name: `console:favorite:${type}:${id}`,
        data: {
            type: type,
            id: id
        }
    });
};



export const listFavorites = async ({ type }: ListFavoriteParams) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (type && favoriteType.indexOf(type) < 0) {
        throw new Error('Invalid Parameter. (type = MENU | CLOUD_SERVICE | PROJECT | PROJECT_GROUP )');
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');

    return await configV1.UserConfig.list({
        user_id: userId,
        query: {
            filter: [{
                k: 'name',
                v: `console:favorite:${type}:`,
                o: 'contain'
            }],
            only: ['data'],
            sort: {
                key: 'created_at',
                desc: true
            }
        }
    });
};


export const deleteFavorites = async ({ type, id }: DeleteFavoriteParams) => {
    if (!type) {
        throw new Error('Required Parameter. (key = type)');
    } else if (type && favoriteType.indexOf(type) < 0) {
        throw new Error('Invalid Parameter. (type = MENU | CLOUD_SERVICE | PROJECT | PROJECT_GROUP )');
    } else if (!id) {
        throw new Error('Invalid Parameter. (key = id)');
    }

    const configV1 = await getClient();
    const userId = httpContext.get('user_id');

    return await configV1.UserConfig.delete({
        user_id: userId,
        name: `console:favorite:${type}:${id}`
    });
};

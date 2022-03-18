import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import { CreateFavoriteParams, DeleteFavoriteParams, ListFavoriteParams } from '@controllers/add-ons/favorite/type';


const getClient = () => {
    return grpcClient.get('config');
};


export const createFavorite = async ({ resource_type, resource_id, user_id }: CreateFavoriteParams) => {
    if (!resource_type) {
        throw new Error('Required Parameter. (key = resource_type)');
    } else if (!resource_id) {
        throw new Error('Required Parameter. (key = resource_id)');
    }

    const configV1 = await getClient();
    const userId = user_id ?? httpContext.get('user_id');
    const response = await configV1.UserConfig.create({
        user_id: userId,
        name: `console:favorite:${resource_type}:${resource_id}`,
        data: {
            resource_id: resource_id,
            resource_type: resource_type
        }
    });
    return response;
};



export const listFavorites = async ({ user_id, query }: ListFavoriteParams) => {
    const configV1 = await getClient();
    const userId = user_id ?? httpContext.get('user_id');

    const response = await configV1.UserConfig.list({
        user_id: userId,
        query: query
    });
    return response;
};


export const deleteFavorites = async ({ resource_type, resource_id, user_id }: DeleteFavoriteParams) => {
    if (!resource_type) {
        throw new Error('Required Parameter. (key = resource_type)');
    } else if (!resource_id) {
        throw new Error('Required Parameter. (key = resource_id)');
    }

    const configV1 = await getClient();
    const userId = user_id ?? httpContext.get('user_id');

    const response = await configV1.UserConfig.delete({
        user_id: userId,
        name: `console:favorite:${resource_type}:${resource_id}`
    });
    return response;
};

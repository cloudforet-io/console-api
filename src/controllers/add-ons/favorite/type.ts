import { Query } from '@lib/grpc-client/type';

export interface CreateFavoriteParams {
    resource_type: string;
    resource_id: string;
    user_id?: string;
}

export interface ListFavoriteParams {
    user_id?: string;
    query?: Query;
}

export interface DeleteFavoriteParams {
    resource_type: string;
    resource_id: string;
    user_id?: string;
}

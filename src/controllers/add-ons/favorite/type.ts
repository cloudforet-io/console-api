export interface CreateFavoriteParams {
    resource_type: string;
    resource_id: string;
}

export interface ListFavoriteParams {
    resource_type: string;
}

export interface DeleteFavoriteParams {
    resource_type: string;
    resource_id: string;
}

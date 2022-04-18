export const favoriteType = ['MENU', 'CLOUD_SERVICE', 'PROJECT', 'PROJECT_GROUP'] as const;
type FavoriteType = typeof favoriteType[number]

export interface CreateFavoriteParams {
    type: FavoriteType;
    id: any;
}

export interface ListFavoriteParams {
    type: FavoriteType;
}

export interface DeleteFavoriteParams {
    type: FavoriteType;
    id: any;
}

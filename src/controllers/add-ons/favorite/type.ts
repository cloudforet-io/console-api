export const favoriteType = ['MENU', 'CLOUD_SERVICE', 'PROJECT', 'PROJECT_GROUP', 'DASHBOARD', 'COST_ANALYSIS'] as const;
export type FavoriteType = typeof favoriteType[number]

export interface CreateFavoriteParams {
    type: FavoriteType;
    workspace_id: string;
    id: any;
}

export interface ListFavoriteParams {
    type: FavoriteType;
}

export interface DeleteFavoriteParams {
    type: FavoriteType;
    workspace_id: string;
    id: any;
}

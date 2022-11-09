import { FavoriteType } from '@controllers/add-ons/favorite/type';


export interface CreateFavoriteOrderListParams {
    type: FavoriteType;
    order_list: string[];
}

export interface getFavoriteOrderListParams {
    type: FavoriteType;
}

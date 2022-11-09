import express from 'express';
import asyncHandler from 'express-async-handler';

import * as favorite from '@controllers/add-ons/favorite';
import * as favoriteOrderList from '@controllers/add-ons/favorite/order-list';

const router = express.Router();

const controllers = [
    { url: '/create', func: favorite.createFavorite },
    { url: '/list', func: favorite.listFavorites },
    { url: '/delete', func: favorite.deleteFavorites },
    { url: '/order-list/set', func: favoriteOrderList.setFavoritesOrderList },
    { url: '/order-list/get', func: favoriteOrderList.getFavoritesOrderList }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

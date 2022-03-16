import express from 'express';
import asyncHandler from 'express-async-handler';
import * as menu from '@controllers/add-ons/menu';

const router = express.Router();

const controllers = [
    { url: '/list', func: menu.listMenu, method: 'post' }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func());
    }));
});

export default router;

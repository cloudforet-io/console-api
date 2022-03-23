import express from 'express';
import asyncHandler from 'express-async-handler';
import * as recent from '@controllers/add-ons/recent';

const router = express.Router();

const controllers = [
    { url: '/create', func: recent.createRecent, method: 'post' },
    { url: '/list', func: recent.listRecent, method: 'post' }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

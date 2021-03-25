import express from 'express';
import asyncHandler from 'express-async-handler';
import * as history from '@controllers/statistics/history';

const router = express.Router();

const controllers = [
    { url: '/create', func: history.createHistory },
    { url: '/stat', func: history.statHistory },
    { url: '/list', func: history.listHistory }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

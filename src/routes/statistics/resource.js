import express from 'express';
import asyncHandler from 'express-async-handler';
import * as stat from '@controllers/statistics/stat';

const router = express.Router();

const controllers = [
    { url: '/stat', func: stat.resourceStat }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

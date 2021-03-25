import express from 'express';
import asyncHandler from 'express-async-handler';
import * as resource from '@controllers/statistics/resource';

const router = express.Router();

const controllers = [
    { url: '/stat', func: resource.statResource }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

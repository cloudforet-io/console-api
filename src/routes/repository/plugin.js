import express from 'express';
import asyncHandler from 'express-async-handler';
import * as plugin from '@controllers/repository/plugin';

const router = express.Router();
const controllers = [
    { url: '/list', func: plugin.listPlugins }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

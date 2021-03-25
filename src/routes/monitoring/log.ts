import express from 'express';
import asyncHandler from 'express-async-handler';
import * as log from '@controllers/monitoring/log';

const router = express.Router();

const controllers = [
    { url: '/list', func: log.listLogs }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

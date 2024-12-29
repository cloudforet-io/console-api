import express from 'express';
import asyncHandler from 'express-async-handler';

import * as serviceChannel from '@controllers/alert-manager/service-channel';

const router = express.Router();

const controllers = [
    { url: '/list', func: serviceChannel.listServiceChannels }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

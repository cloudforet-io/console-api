import express from 'express';
import asyncHandler from 'express-async-handler';

import * as userChannel from '@controllers/alert-manager/user-channel';

const router = express.Router();

const controllers = [
    { url: '/list', func: userChannel.listUserChannels }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

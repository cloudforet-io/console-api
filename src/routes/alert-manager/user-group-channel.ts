import express from 'express';
import asyncHandler from 'express-async-handler';

import * as userGroupChannel from '@controllers/alert-manager/user-group-channel';

const router = express.Router();

const controllers = [
    { url: '/list', func: userGroupChannel.listUserGroupChannels }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

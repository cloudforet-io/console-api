import express from 'express';
import asyncHandler from 'express-async-handler';

import * as userChannel from '@controllers/notification/user-channel';

const router = express.Router();

const controllers = [
    { url: '/create', func: userChannel.createUserChannel },
    { url: '/update', func: userChannel.updateUserChannel },
    { url: '/set-subscription', func: userChannel.setSubscriptionUserChannel },
    { url: '/set-schedule', func: userChannel.setScheduleUserChannel },
    { url: '/enable', func: userChannel.enableUserChannel },
    { url: '/disable', func: userChannel.disableUserChannel },
    { url: '/delete', func: userChannel.deleteUserChannel },
    { url: '/get', func: userChannel.getUserChannel },
    { url: '/list', func: userChannel.listUserChannel },
    { url: '/stat', func: userChannel.statUserChannel }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

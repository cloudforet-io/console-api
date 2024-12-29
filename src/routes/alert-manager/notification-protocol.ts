import express from 'express';
import asyncHandler from 'express-async-handler';

import * as notificationProtocol from '@controllers/alert-manager/notification-protocol';

const router = express.Router();

const controllers = [
    { url: '/list', func: notificationProtocol.listNotificationProtocols }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

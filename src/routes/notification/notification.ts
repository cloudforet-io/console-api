import express from 'express';
import asyncHandler from 'express-async-handler';
import * as notification from '@controllers/notification/notification';

const router = express.Router();

const controllers = [
    { url: '/create', func: notification.createNotification },
    { url: '/delete', func: notification.deleteNotification },
    { url: '/set-read', func: notification.setReadNotification },
    { url: '/get', func: notification.getNotification },
    { url: '/list', func: notification.listNotification },
    { url: '/stat', func: notification.statNotification }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

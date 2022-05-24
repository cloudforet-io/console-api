import express from 'express';
import asyncHandler from 'express-async-handler';

import * as event from '@controllers/monitoring/event';

const router = express.Router();

const controllers = [
    { url: '/create', func: event.createEvent },
    { url: '/get', func: event.getEvent },
    { url: '/list', func: event.listEvents },
    { url: '/stat', func: event.statEvents }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

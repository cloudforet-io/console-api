import express from 'express';
import asyncHandler from 'express-async-handler';

import * as alert from '@controllers/alert-manager/alert';

const router = express.Router();

const controllers = [
    { url: '/list', func: alert.listAlerts }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

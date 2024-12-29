import express from 'express';
import asyncHandler from 'express-async-handler';

import * as webhook from '@controllers/alert-manager/webhook';

const router = express.Router();

const controllers = [
    { url: '/list', func: webhook.listWebhooks }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

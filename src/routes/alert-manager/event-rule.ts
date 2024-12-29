import express from 'express';
import asyncHandler from 'express-async-handler';

import * as eventRule from '@controllers/alert-manager/event-rule';

const router = express.Router();

const controllers = [
    { url: '/list', func: eventRule.listEventRules }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';

import * as changeHistory from '@controllers/inventory/change-history';

const router = express.Router();

const controllers = [
    { url: '/list', func: changeHistory.listChangeHistory },
    { url: '/stat', func: changeHistory.statChangeHistory }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

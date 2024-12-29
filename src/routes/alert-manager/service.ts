import express from 'express';
import asyncHandler from 'express-async-handler';

import * as service from '@controllers/alert-manager/service';

const router = express.Router();

const controllers = [
    { url: '/list', func: service.listServices }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

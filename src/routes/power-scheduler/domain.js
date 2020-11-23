import express from 'express';
import asyncHandler from 'express-async-handler';
import * as domain from '@controllers/power-scheduler/domain';

const router = express.Router();

const controllers = [
    { url: '/enable', func: domain.enableDomain },
    { url: '/disable', func: domain.disableDomain },
    { url: '/get', func: domain.getDomain },
    { url: '/list', func: domain.listDomains }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

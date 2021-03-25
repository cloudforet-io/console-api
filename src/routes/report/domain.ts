import express from 'express';
import asyncHandler from 'express-async-handler';
import * as domain from '@controllers/report/domain';

const router = express.Router();

const controllers = [
    { url: '/enable', func: domain.enableDomain },
    { url: '/disable', func: domain.disableDomain },
    { url: '/get', func: domain.getDomain },
    { url: '/list', func: domain.listDomains },
    { url: '/stat', func: domain.statDomains }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

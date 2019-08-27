import express from 'express';
import asyncHandler from 'express-async-handler';
import * as domain from '@controllers/identity/domain';
import initDomain from '@controllers/identity/domain/init-domain';

const router = express.Router();
const controllers = [
    { url: '/create', func: domain.createDomain },
    { url: '/update', func: domain.updateDomain },
    { url: '/delete', func: domain.deleteDomain },
    { url: '/enable', func: domain.enableDomain },
    { url: '/disable', func: domain.disableDomain },
    { url: '/verify-plugin', func: domain.verifyDomainPlugin },
    { url: '/get', func: domain.getDomain },
    { url: '/list', func: domain.listDomains }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

router.use('/init', asyncHandler(async (req, res, next) => {
    if (req.method == 'GET') {
        res.json(await initDomain(req.query));
    } else if (req.method == 'POST') {
        res.json(await initDomain(req.body));
    } else {
        next();
    }
}));

export default router;

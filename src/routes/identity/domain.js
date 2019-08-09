import express from 'express';
import asyncHandler from 'express-async-handler';
import * as domain from '@controllers/identity/domain';

const router = express.Router();
const controllers = [
    { url: '/create', func: domain.createDomain },
    { url: '/update', func: domain.updateDomain },
    { url: '/delete', func: domain.deleteDomain },
    { url: '/get', func: domain.getDomain },
    { url: '/list', func: domain.listDomains }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

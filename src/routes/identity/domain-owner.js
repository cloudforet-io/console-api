import express from 'express';
import asyncHandler from 'express-async-handler';
import * as domainOwner from '@controllers/identity/domain-owner';

const router = express.Router();
const controllers = [
    { url: '/create', func: domainOwner.createDomainOwner },
    { url: '/update', func: domainOwner.updateDomainOwner },
    { url: '/delete', func: domainOwner.deleteDomainOwner },
    { url: '/get', func: domainOwner.getDomainOwner }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

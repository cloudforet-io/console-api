import express from 'express';
import asyncHandler from 'express-async-handler';

import * as domainConfig from '@controllers/config/domain-config';

const router = express.Router();

const controllers = [
    { url: '/create', func: domainConfig.createDomainConfig },
    { url: '/update', func: domainConfig.updateDomainConfig },
    { url: '/set', func: domainConfig.setDomainConfig },
    { url: '/delete', func: domainConfig.deleteDomainConfig },
    { url: '/get', func: domainConfig.getDomainConfig },
    { url: '/list', func: domainConfig.listDomainConfigs },
    { url: '/stat', func: domainConfig.statDomainConfigs }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as provider from '@controllers/identity/provider';

const router = express.Router();

const controllers = [
    { url: '/create', func: provider.createProvider },
    { url: '/update', func: provider.updateProvider },
    { url: '/delete', func: provider.deleteProvider },
    { url: '/get', func: provider.getProvider },
    { url: '/list', func: provider.listProviders },
    { url: '/stat', func: provider.statProviders }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as networkType from '@controllers/inventory/network-type';

const router = express.Router();

const controllers = [
    { url: '/create', func: networkType.creatNetworkType },
    { url: '/update', func: networkType.updateNetworkType },
    { url: '/delete-single', func: networkType.deleteNetworkTypeSingle },
    { url: '/delete', func: networkType.deleteNetworkTypes },
    { url: '/get', func: networkType.getNetworkType },
    { url: '/list', func: networkType.listNetworkTypes },
    { url: '/stat', func: networkType.statNetworkTypes },
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as ipAddress from '@controllers/inventory/ip-address';

const router = express.Router();

const controllers = [
    { url: '/allocate', func: ipAddress.allocateIPAddress },
    { url: '/reserve', func: ipAddress.reserveIPAddress },
    { url: '/release', func: ipAddress.releaseIPAddress },
    { url: '/update', func: ipAddress.updateIPAddress },
    { url: '/pin-data', func: ipAddress.pinDataIPAddress },
    { url: '/get', func: ipAddress.getIPAddress },
    { url: '/list', func: ipAddress.listIPAddresses },
    { url: '/stat', func: ipAddress.statIPAddresses }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

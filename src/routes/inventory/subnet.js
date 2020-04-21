import express from 'express';
import asyncHandler from 'express-async-handler';
import * as subnet from '@controllers/inventory/subnet';

const router = express.Router();

const controllers = [
    { url: '/create', func: subnet.createSubnet },
    { url: '/update', func: subnet.updateSubnet },
    { url: '/pin-data', func: subnet.pinDataSubnet },
    { url: '/delete-single', func: subnet.deleteSubnetSingle },
    { url: '/delete', func: subnet.deleteSubnets },
    { url: '/get', func: subnet.getSubnet },
    { url: '/list', func: subnet.listSubnets },
    { url: '/stat', func: subnet.statSubnets }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

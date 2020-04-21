import express from 'express';
import asyncHandler from 'express-async-handler';
import * as networkPolicy from '@controllers/inventory/network-policy';

const router = express.Router();
const controllers = [
    { url: '/create', func: networkPolicy.createNetworkPolicy },
    { url: '/update', func: networkPolicy.updateNetworkPolicy },
    { url: '/pin-data', func: networkPolicy.pinDataNetworkPolicy },
    { url: '/delete-single', func: networkPolicy.deleteNetworkPolicySingle },
    { url: '/delete', func: networkPolicy.deleteNetworkPolicies },
    { url: '/get', func: networkPolicy.getNetworkPolicy },
    { url: '/list', func: networkPolicy.listNetworkPolicies },
    { url: '/stat', func: networkPolicy.statNetworkPolicies }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

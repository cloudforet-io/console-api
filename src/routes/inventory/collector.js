import express from 'express';
import asyncHandler from 'express-async-handler';
import * as collector from '@controllers/inventory/collector';

const router = express.Router();
const controllers = [
    { url: '/create', func: collector.createCollector },
    { url: '/update', func: collector.updateCollector },
    { url: '/enable', func: collector.enableCollectors },
    { url: '/disable', func: collector.disableCollectors },
    { url: '/collect', func: collector.collectData },
    { url: '/delete', func: collector.deleteCollectors },
    { url: '/get', func: collector.getCollector },
    { url: '/list', func: collector.listCollectors }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

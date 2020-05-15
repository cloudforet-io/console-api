import express from 'express';
import asyncHandler from 'express-async-handler';
import * as collector from '@controllers/inventory/collector';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();

setTagRouter(parameterBuilder(collector.listCollectors,collector.updateCollector,'collector_id',router));
const controllers = [
    { url: '/create', func: collector.createCollector },
    { url: '/update', func: collector.updateCollector },
    { url: '/enable', func: collector.enableCollectors },
    { url: '/disable', func: collector.disableCollectors },
    { url: '/collect', func: collector.collectData },
    { url: '/delete', func: collector.deleteCollectors },
    { url: '/get', func: collector.getCollector },
    { url: '/plugin/verify', func: collector.verifyPlugin },
    { url: '/schedule/add', func: collector.addSchedule },
    { url: '/schedule/update', func: collector.updateSchedule },
    { url: '/schedule/delete', func: collector.deleteSchedule },
    { url: '/schedule/list', func: collector.listSchedules },
    { url: '/schedule/get', func: collector.getSchedule },
    { url: '/list', func: collector.listCollectors },
    { url: '/stat', func: collector.statCollectors }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;


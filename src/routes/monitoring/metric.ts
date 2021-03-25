import express from 'express';
import asyncHandler from 'express-async-handler';
import * as metric from '@controllers/monitoring/metric';

const router = express.Router();

const controllers = [
    { url: '/get-data', func: metric.getMetricData },
    { url: '/list', func: metric.listMetrics }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

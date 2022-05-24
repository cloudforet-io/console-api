import express from 'express';
import asyncHandler from 'express-async-handler';

import * as publicDashboard from '@controllers/cost-analysis/public-dashboard';

const router = express.Router();

const controllers = [
    { url: '/create', func: publicDashboard.createPublicDashboard },
    { url: '/update', func: publicDashboard.updatePublicDashboard },
    { url: '/delete', func: publicDashboard.deletePublicDashboard },
    { url: '/get', func: publicDashboard.getPublicDashboard },
    { url: '/list', func: publicDashboard.listPublicDashboards },
    { url: '/stat', func: publicDashboard.statPublicDashboards }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as dashboard from '@controllers/cost-analysis/dashboard';

const router = express.Router();

const controllers = [
    { url: '/create', func: dashboard.createDashboard },
    { url: '/update', func: dashboard.updateDashboard },
    { url: '/change-scope', func: dashboard.changeDashboardScope },
    { url: '/delete', func: dashboard.deleteDashboard },
    { url: '/get', func: dashboard.getDashboard },
    { url: '/list', func: dashboard.listDashboards },
    { url: '/stat', func: dashboard.statDashboards }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

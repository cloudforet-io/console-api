import express from 'express';
import asyncHandler from 'express-async-handler';
import alertCountByState from '@controllers/monitoring/dashboard/alert-count-by-state';
import alertHistorySummary from '@controllers/monitoring/dashboard/alert-history-summary';
import dailyAlertHistory from '@controllers/monitoring/dashboard/daily-alert-history';
import alertByProject from '@controllers/monitoring/dashboard/alert-by-project';
import currentProjectStatus from '@controllers/monitoring/dashboard/current-project-status';
import top5ProjectActivityList from '@controllers/monitoring/dashboard/top5-project-activity-list';
import top5ProjectActivityAlertDetails from '@controllers/monitoring/dashboard/top5-project-activity-alert-details';

const router = express.Router();

const controllers = [
    { url: '/alert-count-by-state', func: alertCountByState },
    { url: '/alert-history-summary', func: alertHistorySummary },
    { url: '/daily-alert-history', func: dailyAlertHistory },
    { url: '/alert-by-project', func: alertByProject },
    { url: '/current-project-status', func: currentProjectStatus },
    { url: '/top5-project-activity-list', func: top5ProjectActivityList },
    { url: '/top5-project-activity-alert-details', func: top5ProjectActivityAlertDetails }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

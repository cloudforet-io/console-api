import express from 'express';
import asyncHandler from 'express-async-handler';
import * as scheduleRule from '@controllers/power-scheduler/schedule-rule';

const router = express.Router();

const controllers = [
    { url: '/create', func: scheduleRule.createScheduleRule },
    { url: '/update', func: scheduleRule.updateScheduleRule },
    { url: '/delete', func: scheduleRule.deleteScheduleRule },
    { url: '/get', func: scheduleRule.getScheduleRule },
    { url: '/list', func: scheduleRule.listScheduleRules },
    { url: '/stat', func: scheduleRule.statScheduleRules }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

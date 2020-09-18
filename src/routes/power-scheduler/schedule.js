import express from 'express';
import asyncHandler from 'express-async-handler';
import * as schedule from '@controllers/power-scheduler/schedule';

const router = express.Router();

const controllers = [
    { url: '/create', func: schedule.createSchedule },
    { url: '/update', func: schedule.updateSchedule },
    { url: '/enable', func: schedule.enableSchedule },
    { url: '/disable', func: schedule.disableSchedule },
    { url: '/delete', func: schedule.deleteSchedule },
    { url: '/append-resource-group', func: schedule.appendResourceGroup },
    { url: '/update-resource-group', func: schedule.updateResourceGroup },
    { url: '/remove-resource-group', func: schedule.removeResourceGroup },
    { url: '/get', func: schedule.getSchedule },
    { url: '/list', func: schedule.listSchedules },
    { url: '/stat', func: schedule.statSchedules }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as jobTask from '@controllers/power-scheduler/job-task';

const router = express.Router();

const controllers = [
    { url: '/list', func: jobTask.listJobTasks },
    { url: '/stat', func: jobTask.statJobTasks }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

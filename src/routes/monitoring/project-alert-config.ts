import express from 'express';
import asyncHandler from 'express-async-handler';
import * as projectAlertConfig from '@controllers/monitoring/project-alert-config';

const router = express.Router();

const controllers = [
    { url: '/create', func: projectAlertConfig.createProjectAlertConfig },
    { url: '/update', func: projectAlertConfig.updateProjectAlertConfig },
    { url: '/delete', func: projectAlertConfig.deleteProjectAlertConfig },
    { url: '/get', func: projectAlertConfig.getProjectAlertConfig },
    { url: '/list', func: projectAlertConfig.listProjectAlertConfigs },
    { url: '/stat', func: projectAlertConfig.statProjectAlertConfigs }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

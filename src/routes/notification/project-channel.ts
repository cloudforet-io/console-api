import express from 'express';
import asyncHandler from 'express-async-handler';

import * as projectChannel from '@controllers/notification/project-channel';

const router = express.Router();

const controllers = [
    { url: '/create', func: projectChannel.createProjectChannel },
    { url: '/update', func: projectChannel.updateProjectChannel },
    { url: '/set-subscription', func: projectChannel.setSubscriptionProjectChannel },
    { url: '/set-schedule', func: projectChannel.setScheduleProjectChannel },
    { url: '/enable', func: projectChannel.enableProjectChannel },
    { url: '/disable', func: projectChannel.disableProjectChannel },
    { url: '/delete', func: projectChannel.deleteProjectChannel },
    { url: '/get', func: projectChannel.getProjectChannel },
    { url: '/list', func: projectChannel.listProjectChannel },
    { url: '/stat', func: projectChannel.statProjectChannel }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

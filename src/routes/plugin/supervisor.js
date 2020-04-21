import express from 'express';
import asyncHandler from 'express-async-handler';
import * as supervisor from '@controllers/plugin/supervisor';

const router = express.Router();

const controllers = [
    { url: '/publish', func: supervisor.publishSupervisors },
    { url: '/register', func: supervisor.registerSupervisor },
    { url: '/update', func: supervisor.updateSupervisor },
    { url: '/deregister', func: supervisor.deregisterSupervisor },
    { url: '/enable', func: supervisor.enableSupervisor },
    { url: '/disable', func: supervisor.disableSupervisor },
    { url: '/plugin/recover', func: supervisor.recoverPlugin },
    { url: '/plugin/list', func: supervisor.listPlugins },
    { url: '/get', func: supervisor.getSupervisor },
    { url: '/list', func: supervisor.listSupervisors },
    { url: '/stat', func: supervisor.statSupervisors }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

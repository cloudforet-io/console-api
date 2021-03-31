import express from 'express';
import asyncHandler from 'express-async-handler';
import * as plugin from '@controllers/repository/plugin';

const router = express.Router();

const controllers = [
    { url: '/register', func: plugin.registerPlugin },
    { url: '/update', func: plugin.updatePlugin },
    { url: '/enable', func: plugin.enablePlugin },
    { url: '/disable', func: plugin.disablePlugin },
    { url: '/deregister', func: plugin.deregisterPlugin },
    { url: '/get-versions', func: plugin.getPluginVersions },
    { url: '/get', func: plugin.getPlugin },
    { url: '/list', func: plugin.listPlugins },
    { url: '/stat', func: plugin.statPlugins }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

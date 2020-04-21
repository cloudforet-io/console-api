import express from 'express';
import asyncHandler from 'express-async-handler';
import * as plugin from '@controllers/plugin/plugin';

const router = express.Router();
const controllers = [
    { url: '/get/end-point', func: plugin.getPluginEndPoint },
    { url: '/verify', func: plugin.pluginVerify },
    { url: '/notify/failure', func: plugin.notifyPluginFailure }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

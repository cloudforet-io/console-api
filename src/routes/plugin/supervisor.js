import express from 'express';
import asyncHandler from 'express-async-handler';
import * as supervisor from '@controllers/plugin/supervisor';

const router = express.Router();
const controllers = [
    { url: '/plugin/recover', func: supervisor.recoverPlugin },
    { url: '/plugin/list', func: supervisor.listPlugin },
    { url: '/get', func: supervisor.getSupervisor },
    { url: '/list', func: supervisor.listSupervisor }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as alert from '@controllers/monitoring/alert';

const router = express.Router();

const controllers = [
    { url: '/create', func: alert.createAlert },
    { url: '/update', func: alert.updateAlert },
    { url: '/update-state', func: alert.updateAlertState },
    { url: '/merge', func: alert.mergeAlert },
    { url: '/snooze', func: alert.snoozeAlert },
    { url: '/add-responder', func: alert.addAlertResponder },
    { url: '/remove-responder', func: alert.removeAlertResponder },
    { url: '/delete', func: alert.deleteAlert },
    { url: '/get', func: alert.getAlert },
    { url: '/list', func: alert.listAlerts },
    { url: '/stat', func: alert.statAlerts }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

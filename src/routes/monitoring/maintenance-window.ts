import express from 'express';
import asyncHandler from 'express-async-handler';
import * as maintenanceWindow from '@controllers/monitoring/maintenance-window';

const router = express.Router();

const controllers = [
    { url: '/create', func: maintenanceWindow.createMaintenanceWindow },
    { url: '/update', func: maintenanceWindow.updateMaintenanceWindow },
    { url: '/close', func: maintenanceWindow.closeMaintenanceWindow },
    { url: '/get', func: maintenanceWindow.getMaintenanceWindow },
    { url: '/list', func: maintenanceWindow.listMaintenanceWindows },
    { url: '/stat', func: maintenanceWindow.statMaintenanceWindows }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

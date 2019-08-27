import express from 'express';
import asyncHandler from 'express-async-handler';
import * as zone from '@controllers/inventory/zone';

const router = express.Router();
const controllers = [
    { url: '/create', func: zone.createZone },
    { url: '/update', func: zone.updateZone },
    { url: '/delete', func: zone.deleteZone },
    { url: '/get', func: zone.getZone },
    { url: '/admin/add', func: zone.addZoneAdmin },
    { url: '/admin/modify', func: zone.modifyZoneAdmin },
    { url: '/admin/remove', func: zone.removeZoneAdmin },
    { url: '/admin/list', func: zone.listZoneAdmins },
    { url: '/list', func: zone.listZones }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

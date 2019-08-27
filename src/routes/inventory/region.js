import express from 'express';
import asyncHandler from 'express-async-handler';
import * as region from '@controllers/inventory/region';

const router = express.Router();
const controllers = [
    { url: '/create', func: region.createRegion },
    { url: '/update', func: region.updateRegion },
    { url: '/delete', func: region.deleteRegion },
    { url: '/get', func: region.getRegion },
    { url: '/admin/add', func: region.addRegionAdmin },
    { url: '/admin/modify', func: region.modifyRegionAdmin },
    { url: '/admin/remove', func: region.removeRegionAdmin },
    { url: '/admin/list', func: region.listRegionAdmins },
    { url: '/list', func: region.listRegions }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

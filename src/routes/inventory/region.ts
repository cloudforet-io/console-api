import express from 'express';
import asyncHandler from 'express-async-handler';
import * as region from '@controllers/inventory/region';

const router = express.Router();

const controllers = [
    { url: '/create', func: region.createRegion },
    { url: '/update', func: region.updateRegion },
    { url: '/delete', func: region.deleteRegion },
    { url: '/get', func: region.getRegion },
    { url: '/list', func: region.listRegions },
    { url: '/stat', func: region.statRegions }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

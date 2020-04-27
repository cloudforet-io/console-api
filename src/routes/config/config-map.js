import express from 'express';
import asyncHandler from 'express-async-handler';
import * as configMap from '@controllers/config/config-map';

const router = express.Router();

const controllers = [
    { url: '/create', func: configMap.createConfigMap },
    { url: '/update', func: configMap.updateConfigMap },
    { url: '/delete', func: configMap.deleteConfigMap },
    { url: '/get', func: configMap.getConfigMap },
    { url: '/list', func: configMap.listConfigMaps },
    { url: '/stat', func: configMap.statConfigMaps }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

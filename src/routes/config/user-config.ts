import express from 'express';
import asyncHandler from 'express-async-handler';
import * as userConfig from '@controllers/config/user-config';

const router = express.Router();

const controllers = [
    { url: '/create', func: userConfig.createUserConfig },
    { url: '/update', func: userConfig.updateUserConfig },
    { url: '/delete', func: userConfig.deleteUserConfig },
    { url: '/get', func: userConfig.getUserConfig },
    { url: '/list', func: userConfig.listUserConfigs },
    { url: '/stat', func: userConfig.statUserConfigs }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

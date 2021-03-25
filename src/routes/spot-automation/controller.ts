import express from 'express';
import asyncHandler from 'express-async-handler';
import * as controller from '@controllers/spot-automation/controller';

const router = express.Router();

const controllers = [
    { url: '/create', func: controller.createController },
    { url: '/update', func: controller.updateController },
    { url: '/update-plugin', func: controller.updateControllerPlugin },
    { url: '/verify-plugin', func: controller.verifyControllerPlugin },
    { url: '/delete', func: controller.deleteController },
    { url: '/get', func: controller.getController },
    { url: '/list', func: controller.listControllers },
    { url: '/stat', func: controller.statControllers }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secretGroup from '@controllers/secret/secret-group';

const router = express.Router();

const controllers = [
    { url: '/create', func: secretGroup.createSecretGroup },
    { url: '/update', func: secretGroup.updateSecretGroup },
    { url: '/delete', func: secretGroup.deleteSecretGroup },
    { url: '/get', func: secretGroup.getSecretGroup },
    { url: '/list', func: secretGroup.listSecretGroups },
    { url: '/stat', func: secretGroup.statSecretGroups },
    { url: '/secret/add', func: secretGroup.addSecret },
    { url: '/secret/remove', func: secretGroup.removeSecret }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

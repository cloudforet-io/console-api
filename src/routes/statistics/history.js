import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secret from '@controllers/secret/secret';

const router = express.Router();

const controllers = [
    { url: '/create', func: secret.createSecret },
    { url: '/update', func: secret.updateSecret },
    { url: '/delete', func: secret.deleteSecret },
    { url: '/get', func: secret.getSecret },
    { url: '/list', func: secret.listSecrets },
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

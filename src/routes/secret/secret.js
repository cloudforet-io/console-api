import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secret from '@controllers/secret/secret';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();

setTagRouter(parameterBuilder(secret.listSecrets, secret.updateSecret, 'secret_id', router));
const controllers = [
    { url: '/create', func: secret.createSecret },
    { url: '/update', func: secret.updateSecret },
    { url: '/delete', func: secret.deleteSecret },
    { url: '/get', func: secret.getSecret },
    { url: '/list', func: secret.listSecrets },
    { url: '/stat', func: secret.statSecrets }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

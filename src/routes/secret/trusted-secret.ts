import express from 'express';
import asyncHandler from 'express-async-handler';

import * as trustedSecret from '@controllers/secret/trusted-secret';

const router = express.Router();

const controllers = [
    { url: '/create', func: trustedSecret.createTrustedSecret },
    { url: '/update', func: trustedSecret.updateTrustedSecret },
    { url: '/delete', func: trustedSecret.deleteTrustedSecret },
    { url: '/update-data', func: trustedSecret.updateTrustedSecretData },
    { url: '/get', func: trustedSecret.getTrustedSecret },
    { url: '/list', func: trustedSecret.listTrustedSecrets },
    { url: '/stat', func: trustedSecret.statTrustedSecrets }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

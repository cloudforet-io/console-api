import express from 'express';
import asyncHandler from 'express-async-handler';
import * as credential from '@controllers/secret/credential';

const router = express.Router();
const controllers = [
    { url: '/create', func: credential.createCredential },
    { url: '/update', func: credential.updateCredential },
    { url: '/delete', func: credential.deleteCredential },
    { url: '/get', func: credential.getCredential },
    { url: '/list', func: credential.listCredentials }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

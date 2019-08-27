import express from 'express';
import asyncHandler from 'express-async-handler';
import * as credentialGroup from '@controllers/secret/credential-group';

const router = express.Router();
const controllers = [
    { url: '/create', func: credentialGroup.createCredentialGroup },
    { url: '/update', func: credentialGroup.updateCredentialGroup },
    { url: '/delete', func: credentialGroup.deleteCredentialGroup },
    { url: '/get', func: credentialGroup.getCredentialGroup },
    { url: '/list', func: credentialGroup.listCredentialGroups }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

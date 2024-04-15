import express from 'express';
import asyncHandler from 'express-async-handler';

import * as trustedAccount from '@controllers/identity/trusted-account';

const router = express.Router();

const controllers = [
    { url: '/create', func: trustedAccount.createTrustedAccount },
    { url: '/update', func: trustedAccount.updateTrustedAccount },
    { url: '/delete', func: trustedAccount.deleteTrustedAccount },
    { url: '/get', func: trustedAccount.getTrustedAccount },
    { url: '/list', func: trustedAccount.listTrustedAccounts },
    { url: '/stat', func: trustedAccount.statTrustedAccounts },
    { url: '/change-project', func: trustedAccount.changeTrustedAccountProject }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

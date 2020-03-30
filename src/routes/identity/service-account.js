import express from 'express';
import asyncHandler from 'express-async-handler';
import * as serviceAccount from '@controllers/identity/service-account';

const router = express.Router();
const controllers = [
    { url: '/create', func: serviceAccount.createServiceAccount },
    { url: '/update', func: serviceAccount.updateServiceAccount },
    { url: '/delete', func: serviceAccount.deleteServiceAccount },
    { url: '/get', func: serviceAccount.getServiceAccount },
    { url: '/list', func: serviceAccount.listServiceAccounts }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

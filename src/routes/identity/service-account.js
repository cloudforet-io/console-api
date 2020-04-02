import express from 'express';
import asyncHandler from 'express-async-handler';
import * as serviceAccount from '@controllers/identity/service-account';
import listServiceAccountMembers from '@controllers/identity/service-account/list-service-account-members';
//member/list
const router = express.Router();
const controllers = [
    { url: '/create', func: serviceAccount.createServiceAccount },
    { url: '/update', func: serviceAccount.updateServiceAccount },
    { url: '/delete', func: serviceAccount.deleteServiceAccount },
    { url: '/get', func: serviceAccount.getServiceAccount },
    { url: '/list', func: serviceAccount.listServiceAccounts },
    { url: '/member/list', func: listServiceAccountMembers},
    { url: '/change-project', func: serviceAccount.changeServiceAccountProject }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

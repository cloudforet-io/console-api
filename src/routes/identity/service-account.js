import express from 'express';
import asyncHandler from 'express-async-handler';
import * as serviceAccount from '@controllers/identity/service-account';
import listServiceAccountMembers from '@controllers/identity/service-account/list-service-account-members';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();

setTagRouter(parameterBuilder (serviceAccount.listServiceAccounts, serviceAccount.updateServiceAccount, 'service_account_id', router));
const controllers = [
    { url: '/create', func: serviceAccount.createServiceAccount },
    { url: '/update', func: serviceAccount.updateServiceAccount },
    { url: '/delete', func: serviceAccount.deleteServiceAccount },
    { url: '/get', func: serviceAccount.getServiceAccount },
    { url: '/list', func: serviceAccount.listServiceAccounts },
    { url: '/stat', func: serviceAccount.statServiceAccounts },
    { url: '/member/list', func: listServiceAccountMembers},
    { url: '/change-project', func: serviceAccount.changeServiceAccountProject }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secretGroup from '@controllers/secret/secret-group';
import {setTagRouter} from '@lib/tag/tag-route';

const router = express.Router();

const bulkTagActionParam = {
    list: secretGroup.listSecretGroups,
    update: secretGroup.updateSecretGroup,
    key: 'secret_group_id',
    router
};

setTagRouter(bulkTagActionParam);
const controllers = [
    { url: '/create', func: secretGroup.createSecretGroup },
    { url: '/update', func: secretGroup.updateSecretGroup },
    { url: '/delete', func: secretGroup.deleteSecretGroup },
    { url: '/get', func: secretGroup.getSecretGroup },
    { url: '/list', func: secretGroup.listSecretGroups },
    { url: '/secret/add', func: secretGroup.addSecret },
    { url: '/secret/remove', func: secretGroup.removeSecret },
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

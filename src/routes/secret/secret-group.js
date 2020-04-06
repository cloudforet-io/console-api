import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secretGroup from '@controllers/secret/secret-group';
import Tag from '@lib/tag';

const router = express.Router();
const controllers = [
    { url: '/create', func: secretGroup.createSecretGroup },
    { url: '/update', func: secretGroup.updateSecretGroup },
    { url: '/delete', func: secretGroup.deleteSecretGroup },
    { url: '/get', func: secretGroup.getSecretGroup },
    { url: '/list', func: secretGroup.listSecretGroups },
    { url: '/secret/add', func: secretGroup.addSecret },
    { url: '/secret/remove', func: secretGroup.removeSecret },
    { url: '/tag/set', func: Tag.bulkTagsAction, param: { list:secretGroup.listSecretGroups, update: secretGroup.updateSecretGroup, flag: { action: 'set', key: 'secret_group'}} },
    { url: '/tag/update', func: Tag.bulkTagsAction, param: { list:secretGroup.listSecretGroups, update: secretGroup.updateSecretGroup, flag:{ action: 'update', key: 'secret_group'}} },
    { url: '/tag/delete', func: Tag.bulkTagsAction, param: { list:secretGroup.listSecretGroups, update: secretGroup.updateSecretGroup, flag: { action: 'delete',key: 'secret_group'}} }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(config.param ? {
            ...config.param,
            body: req.body
        }: req.body));
    }));
});

export default router;

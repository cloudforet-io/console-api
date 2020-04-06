import express from 'express';
import asyncHandler from 'express-async-handler';
import * as secret from '@controllers/secret/secret';
import Tag from '@lib/tag';

const router = express.Router();
const controllers = [
    { url: '/create', func: secret.createSecret },
    { url: '/update', func: secret.updateSecret },
    { url: '/delete', func: secret.deleteSecret },
    { url: '/get', func: secret.getSecret },
    { url: '/list', func: secret.listSecrets },
    { url: '/tag/set', func: Tag.bulkTagsAction, param: { list:secret.listSecrets, update: secret.updateSecret, action: 'set', key: 'secret'} },
    { url: '/tag/update', func: Tag.bulkTagsAction, param: { list:secret.listSecrets, update: secret.updateSecret, action: 'update', key: 'secret'}},
    { url: '/tag/delete', func: Tag.bulkTagsAction, param: { list:secret.listSecrets, update: secret.updateSecret, action: 'delete',key: 'secret'} }
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

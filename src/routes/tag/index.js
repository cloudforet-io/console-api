import express from 'express';
import asyncHandler from 'express-async-handler';
import TagAction from '@lib/tag/tag-action';

const router = express.Router();
const controllers = [
    { url: '/set', func: TagAction.bulkTagsAction },
    { url: '/update', func: TagAction.bulkTagsAction},
    { url: '/delete', func: TagAction.bulkTagsAction}
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

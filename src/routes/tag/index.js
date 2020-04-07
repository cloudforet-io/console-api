import express from 'express';
import asyncHandler from 'express-async-handler';
import Tag from '@lib/tag';

const router = express.Router();
const controllers = [
    { url: '/set', func: Tag.bulkTagsAction },
    { url: '/update', func: Tag.bulkTagsAction},
    { url: '/delete', func: Tag.bulkTagsAction}
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

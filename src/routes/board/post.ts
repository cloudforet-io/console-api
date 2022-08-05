import express from 'express';
import asyncHandler from 'express-async-handler';

import * as post from '@controllers/board/post';

const router = express.Router();

const controllers = [
    { url: '/create', func: post.createPost },
    { url: '/update', func: post.updatePost },
    { url: '/send-notification', func: post.sendNotification },
    { url: '/delete', func: post.deletePost },
    { url: '/get', func: post.getPost },
    { url: '/list', func: post.listPosts },
    { url: '/stat', func: post.statPosts }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

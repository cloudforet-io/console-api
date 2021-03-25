import express from 'express';
import asyncHandler from 'express-async-handler';
import * as token from '@controllers/identity/token';

const router = express.Router();

const controllers = [
    { url: '/issue', func: token.issueToken },
    { url: '/refresh', func: token.refreshToken }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

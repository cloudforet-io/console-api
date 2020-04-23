import express from 'express';
import asyncHandler from 'express-async-handler';
import * as token from '@controllers/identity/token/';

const router = express.Router();
const controllers = [
    { url: '/issue', func: token.issueToken },
    { url: '/refresh', func: token.refreshToken }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

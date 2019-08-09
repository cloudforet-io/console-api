import express from 'express';
import asyncHandler from 'express-async-handler';
import * as apiKey from '@controllers/identity/api-key';

const router = express.Router();
const controllers = [
    { url: '/create', func: apiKey.createAPIKey },
    { url: '/list', func: apiKey.listAPIKeys }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

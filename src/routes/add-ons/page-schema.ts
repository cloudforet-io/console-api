import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPageSchema } from '@controllers/add-ons/page-schema';

const router = express.Router();

const controllers = [
    { url: '/get', func: getPageSchema }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

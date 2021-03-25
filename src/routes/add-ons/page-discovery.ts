import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPageUrl } from '@controllers/add-ons/page-discovery';

const router = express.Router();

const controllers = [
    { url: '/get', func: getPageUrl }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

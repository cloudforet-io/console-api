import express from 'express';
import asyncHandler from 'express-async-handler';
import cloudServiceTypePage from '@controllers/statistics/topic/cloud-service-type-page';

const router = express.Router();

const controllers = [
    { url: '/cloud-service-type-page', func: cloudServiceTypePage }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

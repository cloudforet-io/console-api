import express from 'express';
import asyncHandler from 'express-async-handler';
import { listAWSHealth } from '@controllers/add-ons/aws-health';

const router = express.Router();

const controllers = [
    { url: '/list', func: listAWSHealth }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

module.exports = router;

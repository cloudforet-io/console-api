import express from 'express';
import asyncHandler from 'express-async-handler';
import * as awsHealth from '@/add-ons/aws-health/controllers';

const router = express.Router();
const controllers = [
    { url: '/list', func: awsHealth.listAWSHealth }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

module.exports = router;

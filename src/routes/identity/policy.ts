import express from 'express';
import asyncHandler from 'express-async-handler';
import * as policy from '@controllers/identity/policy';

const router = express.Router();

const controllers = [
    { url: '/create', func: policy.createPolicy },
    { url: '/update', func: policy.updatePolicy },
    { url: '/delete', func: policy.deletePolicy },
    { url: '/get', func: policy.getPolicy },
    { url: '/list', func: policy.listPolicies },
    { url: '/stat', func: policy.statPolicies }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

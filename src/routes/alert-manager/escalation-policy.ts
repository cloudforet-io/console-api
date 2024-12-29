import express from 'express';
import asyncHandler from 'express-async-handler';

import * as escalationPolicy from '@controllers/alert-manager/escalation-policy';

const router = express.Router();

const controllers = [
    { url: '/list', func: escalationPolicy.listEscalationPolicies }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

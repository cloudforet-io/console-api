import express from 'express';
import asyncHandler from 'express-async-handler';
import * as escalationPolicy from '@controllers/monitoring/escalation-policy';

const router = express.Router();

const controllers = [
    { url: '/create', func: escalationPolicy.createEscalationPolicy },
    { url: '/update', func: escalationPolicy.updateEscalationPolicy },
    { url: '/set-default', func: escalationPolicy.setDefaultEscalationPolicy },
    { url: '/delete', func: escalationPolicy.deleteEscalationPolicy },
    { url: '/get', func: escalationPolicy.getEscalationPolicy },
    { url: '/list', func: escalationPolicy.listEscalationPolicies },
    { url: '/stat', func: escalationPolicy.statEscalationPolicies }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;

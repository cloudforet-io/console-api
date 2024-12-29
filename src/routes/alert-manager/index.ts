import express from 'express';

import alertRouter from './alert';
import escalationPolicyRouter from './escalation-policy';
import eventRuleRouter from './event-rule';
import noteRouter from './note';
import notificationProtocolRouter from './notification-protocol';
import serviceRouter from './service';
import serviceChannelRouter from './service-channel';
import userChannelRouter from './user-channel';
import userGroupChannelRouter from './user-group-channel';
import webhookRouter from './webhook';

const router = express.Router();

router.use('/alert', alertRouter);
router.use('/escalation-policy', escalationPolicyRouter);
router.use('/event-rule', eventRuleRouter);
router.use('/note', noteRouter);
router.use('/notification-protocol', notificationProtocolRouter);
router.use('/service', serviceRouter);
router.use('/service-channel', serviceChannelRouter);
router.use('/user-channel', userChannelRouter);
router.use('/user-group-channel', userGroupChannelRouter);
router.use('/webhook', webhookRouter);

export default router;

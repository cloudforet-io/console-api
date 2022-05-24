import express from 'express';

import notificationRouter from './notification';
import projectChannelRouter from './project-channel';
import protocolRouter from './protocol';
import userChannelRouter from './user-channel';

const router = express.Router();

router.use('/protocol', protocolRouter);
router.use('/project-channel', projectChannelRouter);
router.use('/user-channel', userChannelRouter);
router.use('/notification', notificationRouter);

export default router;

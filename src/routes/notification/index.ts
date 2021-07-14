import express from 'express';
import protocolRouter from './protocol';
import projectChannelRouter from './project-channel';
import userChannelRouter from './user-channel';
import notificationRouter from './notification';

const router = express.Router();

router.use('/protocol', protocolRouter);
router.use('/project-channel', projectChannelRouter);
router.use('/user-channel', userChannelRouter);
router.use('/notification', notificationRouter);

export default router;

import express from 'express';
import protocolRouter from './protocol';
import projectChannelRouter from './project-channel';
import userChannelRouter from './user-channel';

const router = express.Router();

router.use('/protocol', protocolRouter);
router.use('/project-channel', projectChannelRouter);
router.use('/user-channel', userChannelRouter);

export default router;

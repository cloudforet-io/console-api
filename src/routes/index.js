import express from 'express';
import identityRouter from './identity';

const router = express.Router();
router.use('/identity', identityRouter);

export default router;

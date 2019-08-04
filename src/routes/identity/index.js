import express from 'express';
import domainRouter from './domain';
import userRouter from './user';

const router = express.Router();
router.use('/domain', domainRouter);
router.use('/user', userRouter);

export default router;

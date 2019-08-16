import express from 'express';
import domainRouter from './domain';
import projectGroupRouter from './project-group';
import projectRouter from './project';
import userRouter from './user';
import apiKeyRouter from './api-key';
import tokenRouter from './token';

const router = express.Router();
router.use('/domain', domainRouter);
router.use('/project-group', projectGroupRouter);
router.use('/project', projectRouter);
router.use('/user', userRouter);
router.use('/api-key', apiKeyRouter);
router.use('/token', tokenRouter);

export default router;

import express from 'express';
import domainRouter from './domain';
import domainOwnerRouter from './domain-owner';
import projectGroupRouter from './project-group';
import projectRouter from './project';
import policyRouter from './policy';
import roleRouter from './role';
import userRouter from './user';
import apiKeyRouter from './api-key';
import tokenRouter from './token';
import providerRouter from './provider';
import serviceAccountRouter from './service-account';

/**
 * @swagger
 * tags:
 *   name: Identity
 *   description: spaceOne Identity Service
 */


const router = express.Router();

router.use('/domain', domainRouter);
router.use('/domain-owner', domainOwnerRouter);
router.use('/project-group', projectGroupRouter);
router.use('/project', projectRouter);
router.use('/policy', policyRouter);
router.use('/role', roleRouter);
router.use('/user', userRouter);
router.use('/api-key', apiKeyRouter);
router.use('/token', tokenRouter);
router.use('/provider', providerRouter);
router.use('/service-account', serviceAccountRouter);
export default router;

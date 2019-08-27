import express from 'express';
import credentialRouter from './credential';
import credentialGroupRouter from './credential-group';

const router = express.Router();
router.use('/credential', credentialRouter);
router.use('/credential-group', credentialGroupRouter);

export default router;

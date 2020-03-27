import express from 'express';
/*
import secretRouter from './secret';
import secretGroupRouter from './secret-group';
*/
import credentialRouter from './credential';
import credentialGroupRouter from './credential-group';

const router = express.Router();
/*
router.use('/secret', secretRouter);
router.use('/secret-group', secretGroupRouter);
*/

router.use('/credential', credentialRouter);
router.use('/credential-group', credentialGroupRouter);

export default router;

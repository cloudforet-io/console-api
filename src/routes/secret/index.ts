import express from 'express';

import secretRouter from './secret';
import secretGroupRouter from './secret-group';
import trustedSecretRouter from './trusted-secret';

const router = express.Router();

router.use('/secret', secretRouter);
router.use('/trusted-secret', trustedSecretRouter);
router.use('/secret-group', secretGroupRouter);


export default router;

import express from 'express';

import domainConfigRouter from './domain-config';
import userConfigRouter from './user-config';

const router = express.Router();

router.use('/user-config', userConfigRouter);
router.use('/domain-config', domainConfigRouter);

export default router;

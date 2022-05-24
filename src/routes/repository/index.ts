import express from 'express';

import pluginRouter from './plugin';
import policyRouter from './policy';
import repositoryRouter from './repository';
import schemaRouter from './schema';

const router = express.Router();

router.use('/repository', repositoryRouter);
router.use('/plugin', pluginRouter);
router.use('/schema', schemaRouter);
router.use('/policy', policyRouter);
export default router;

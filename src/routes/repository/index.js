import express from 'express';
import repositoryRouter from './repository';
import pluginRouter from './plugin';
import schemaRouter from './schema';
import policyRouter from './policy';

const router = express.Router();

router.use('/repository', repositoryRouter);
router.use('/plugin', pluginRouter);
router.use('/schema', schemaRouter);
router.use('/policy', policyRouter);
export default router;

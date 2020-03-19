import express from 'express';
import repositoryRouter from './repository';
import pluginRouter from './plugin';
import schemaRouter from './schema';

const router = express.Router();
router.use('/repository', repositoryRouter);
router.use('/plugin', pluginRouter);
router.use('/schema', schemaRouter);
export default router;

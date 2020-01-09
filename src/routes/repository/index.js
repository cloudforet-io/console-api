import express from 'express';
import repositoryRouter from './repository';
import pluginRouter from './plugin';

const router = express.Router();
router.use('/repository', repositoryRouter);
router.use('/plugin', pluginRouter);

export default router;

import express from 'express';
import remoteRepositoryRouter from './repository';
import pluginRouter from './plugin';

const router = express.Router();
router.use('/remote-repository', remoteRepositoryRouter);
router.use('/plugin', pluginRouter);

export default router;

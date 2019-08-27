import express from 'express';
import remoteRepositoryRouter from './remote-repository';
import pluginRouter from './plugin';

const router = express.Router();
router.use('/plugin', pluginRouter);

export default router;

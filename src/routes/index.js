import express from 'express';
import identityRouter from './identity';
import repositoryRouter from './repository';

const router = express.Router();
router.use('/identity', identityRouter);
router.use('/repository', repositoryRouter);

export default router;
